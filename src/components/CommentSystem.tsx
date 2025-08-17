import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, User, Clock } from 'lucide-react'
import { getRequestComments, addComment } from '../lib/supabase'
import type { MaintenanceComment } from '../lib/types'

interface CommentSystemProps {
  requestId: string
  currentUser: {
    name: string
    type: 'admin' | 'supervisor' | 'technician'
  }
}

export function CommentSystem({ requestId, currentUser }: CommentSystemProps) {
  const [comments, setComments] = useState<MaintenanceComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [requestId])

  const loadComments = async () => {
    try {
      const { data, error } = await getRequestComments(requestId)
      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const { data, error } = await addComment({
        request_id: requestId,
        author_name: currentUser.name,
        author_type: currentUser.type,
        comment_text: newComment.trim(),
        is_internal: false
      })

      if (error) throw error

      if (data) {
        setComments(prev => [...prev, data])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getAuthorColor = (authorType: string) => {
    switch (authorType) {
      case 'admin': return 'text-red-600 dark:text-red-400'
      case 'supervisor': return 'text-blue-600 dark:text-blue-400'
      case 'technician': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getAuthorBadge = (authorType: string) => {
    switch (authorType) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'supervisor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'technician': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to add one!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className={`font-medium ${getAuthorColor(comment.author_type)}`}>
                    {comment.author_name}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getAuthorBadge(comment.author_type)}`}>
                    {comment.author_type}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(comment.created_at)}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {comment.comment_text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Commenting as {currentUser.name} ({currentUser.type})
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

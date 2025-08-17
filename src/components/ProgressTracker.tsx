import React, { useState, useEffect } from 'react'
import { CheckCircle, Circle, Clock, User, Calendar } from 'lucide-react'
import { getTaskProgress, updateTaskProgress } from '../lib/supabase'
import type { TaskProgress } from '../lib/types'

interface ProgressTrackerProps {
  requestId: string
  currentUser?: {
    name: string
    type: 'admin' | 'supervisor' | 'technician'
  }
  readOnly?: boolean
}

export function ProgressTracker({ requestId, currentUser, readOnly = false }: ProgressTrackerProps) {
  const [tasks, setTasks] = useState<TaskProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [requestId])

  const loadTasks = async () => {
    try {
      const { data, error } = await getTaskProgress(requestId)
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskToggle = async (task: TaskProgress) => {
    if (readOnly || !currentUser) return

    setUpdating(task.id)
    try {
      const updates: Partial<TaskProgress> = {
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : undefined,
        completed_by: !task.is_completed ? currentUser.name : undefined
      }

      const { data, error } = await updateTaskProgress(task.id, updates)
      if (error) throw error

      if (data) {
        setTasks(prev => prev.map(t => t.id === task.id ? data : t))
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter(task => task.is_completed).length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Progress Tracker
        </h3>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {completionPercentage}% Complete
          </div>
          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No progress milestones defined yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id} className="flex items-start space-x-4">
              {/* Progress Line */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleTaskToggle(task)}
                  disabled={readOnly || updating === task.id}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.is_completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                  } ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
                    updating === task.id ? 'opacity-50' : ''
                  }`}
                >
                  {updating === task.id ? (
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : task.is_completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                {index < tasks.length - 1 && (
                  <div className={`w-0.5 h-8 mt-2 ${
                    task.is_completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    task.is_completed 
                      ? 'text-green-700 dark:text-green-300 line-through' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {task.task_name}
                  </h4>
                  {task.is_completed && (
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                
                {task.task_description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {task.task_description}
                  </p>
                )}

                {task.is_completed && (task.completed_by || task.completed_at) && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {task.completed_by && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>by {task.completed_by}</span>
                      </div>
                    )}
                    {task.completed_at && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>on {formatDate(task.completed_at)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!readOnly && currentUser && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click on the circles to mark tasks as complete. Progress is automatically tracked.
          </p>
        </div>
      )}
    </div>
  )
}

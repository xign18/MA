import React, { useState } from 'react'
import { Lock, AlertCircle, LogIn, User, Mail, Phone, Building2 } from 'lucide-react'
import { authenticateSupervisor, type SupervisorAuthResult } from '../lib/supabase'

interface SupervisorLoginPageProps {
  onSuccess: (supervisor: any, company: any) => void
  onBack: () => void
}

export function SupervisorLoginPage({ onSuccess, onBack }: SupervisorLoginPageProps) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate input
      if (!login.trim()) {
        throw new Error('Please enter your email, username, or phone number')
      }
      if (!password.trim()) {
        throw new Error('Please enter your password')
      }

      // Attempt authentication
      const result: SupervisorAuthResult = await authenticateSupervisor(login.trim(), password)

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed')
      }

      if (result.supervisor && result.company) {
        // Store supervisor info in localStorage for session management
        localStorage.setItem('supervisor_session', JSON.stringify({
          supervisor: result.supervisor,
          company: result.company,
          loginTime: new Date().toISOString()
        }))

        onSuccess(result.supervisor, result.company)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getLoginPlaceholder = () => {
    if (login.includes('@')) return 'Email address'
    if (login.match(/^\+?[\d\s-()]+$/)) return 'Phone number'
    return 'Username, email, or phone'
  }

  const getLoginIcon = () => {
    if (login.includes('@')) return <Mail className="h-4 w-4 text-gray-400" />
    if (login.match(/^\+?[\d\s-()]+$/)) return <Phone className="h-4 w-4 text-gray-400" />
    return <User className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Supervisor Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Access your company dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email, Username, or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getLoginIcon()}
                </div>
                <input
                  type="text"
                  id="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder={getLoginPlaceholder()}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You can use your email, username, or phone number to log in
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <button
                onClick={onBack}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Don't have an account? Contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

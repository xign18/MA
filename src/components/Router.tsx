import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ensureAdminUsers, setCurrentUserAsAdmin, isAdminEmail } from '../lib/adminUtils'
import { LoginPage } from './LoginPage'
import { SupervisorDashboard } from './SupervisorDashboard'
import { SupervisorLoginPage } from './SupervisorLoginPage'
import { TechnicianDashboard } from './TechnicianDashboard'
import { AdminPanel } from './AdminPanel'
import { isAdmin } from '../lib/auth'

type Route = 'home' | 'admin' | 'supervisor' | 'technician' | 'admin-signup'
type AuthState = 'login' | 'signup'

export function Router() {
  const { user, loading: authLoading } = useAuth()
  const [currentRoute, setCurrentRoute] = useState<Route>('home')
  const [adminAuthState, setAdminAuthState] = useState<AuthState>('login')
  const [adminSetupComplete, setAdminSetupComplete] = useState(false)
  const [supervisorSession, setSupervisorSession] = useState<any>(null)

  // Ensure admin users are properly configured on app startup
  useEffect(() => {
    const setupAdmins = async () => {
      try {
        await ensureAdminUsers()
        setAdminSetupComplete(true)
      } catch (error) {
        console.warn('Failed to setup admin users:', error)
        setAdminSetupComplete(true) // Continue anyway
      }
    }

    setupAdmins()
  }, [])

  // Check for existing supervisor session
  useEffect(() => {
    const savedSession = localStorage.getItem('supervisor_session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        // Check if session is still valid (not older than 24 hours)
        const loginTime = new Date(session.loginTime)
        const now = new Date()
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

        if (hoursDiff < 24) {
          setSupervisorSession(session)
        } else {
          localStorage.removeItem('supervisor_session')
        }
      } catch (error) {
        localStorage.removeItem('supervisor_session')
      }
    }
  }, [])

  useEffect(() => {
    // Simple client-side routing based on URL hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      switch (hash) {
        case 'admin':
          setCurrentRoute('admin')
          break
        case 'supervisor':
          setCurrentRoute('supervisor')
          break
        case 'technician':
          setCurrentRoute('technician')
          break
        case 'admin-signup':
          setCurrentRoute('admin-signup')
          break
        default:
          setCurrentRoute('home')
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleAuthSuccess = () => {
    // Redirect based on user role after successful auth
    if (currentRoute === 'admin' || currentRoute === 'admin-signup') {
      // Stay on admin route, will be handled by role check
    } else if (currentRoute === 'supervisor') {
      // Stay on supervisor route, will be handled by role check
    } else if (currentRoute === 'technician') {
      // Stay on technician route, will be handled by role check
    }
  }

  const handleSignOut = () => {
    window.location.hash = ''
    setCurrentRoute('home')
  }

  // Helper function to check if user has admin role
  const hasAdminRole = (user: any) => {
    return isAdmin(user)
  }

  if (!adminSetupComplete || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {!adminSetupComplete ? 'Setting up admin users...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Route handling
  switch (currentRoute) {
    case 'admin':
      if (!user) {
        return (
          <LoginPage
            userType="admin"
            onSuccess={handleAuthSuccess}
          />
        )
      }
      
      if (hasAdminRole(user)) {
        return <AdminPanel onSignOut={handleSignOut} />
      }
      // If user is not admin, show access denied with admin setup option
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have admin privileges.
            </p>

            {/* Show admin setup button if user email is in admin list */}
            {isAdminEmail(user.email || '') && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  Your email is configured as an admin. Click below to activate admin privileges:
                </p>
                <button
                  onClick={async () => {
                    const result = await setCurrentUserAsAdmin()
                    if (result.success) {
                      window.location.reload() // Reload to refresh user data
                    } else {
                      alert('Failed to set admin role: ' + result.error)
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Activate Admin Role
                </button>
              </div>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <p>Debug info:</p>
              <p>User metadata role: {user.user_metadata?.role || 'none'}</p>
              <p>App metadata role: {user.app_metadata?.role || 'none'}</p>
              <p>User metadata user_role: {user.user_metadata?.user_role || 'none'}</p>
              <p>Profile role: {profile?.role || 'none'}</p>
              <p>Email: {user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )



    case 'supervisor':
      // Supervisor authentication required
      if (supervisorSession) {
        return (
          <SupervisorDashboard
            onSignOut={() => {
              setSupervisorSession(null)
              localStorage.removeItem('supervisor_session')
              setCurrentRoute('home')
            }}
            supervisorProfile={supervisorSession.supervisor}
            companyProfile={supervisorSession.company}
          />
        )
      } else {
        return (
          <SupervisorLoginPage
            onSuccess={(supervisor, company) => {
              const session = {
                supervisor,
                company,
                loginTime: new Date().toISOString()
              }
              setSupervisorSession(session)
              localStorage.setItem('supervisor_session', JSON.stringify(session))
            }}
            onBack={() => setCurrentRoute('home')}
          />
        )
      }

    case 'technician':
      // Direct access to technician dashboard - no login required
      return <TechnicianDashboard onSignOut={handleSignOut} />

    default:
      // Home route - show the original maintenance form
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Vehicle Maintenance System
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Choose your access level to get started
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="#admin"
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Access
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage users, roles, and system settings
                  </p>
                </div>
              </a>

              <a
                href="#supervisor"
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Supervisor Access
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submit requests and manage company vehicles
                  </p>
                </div>
              </a>

              <a
                href="#technician"
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Technician Access
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and update assigned maintenance tasks
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )
  }

  return null
}
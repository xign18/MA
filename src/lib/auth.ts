import { supabase } from './supabase'
import { isAdminEmail } from './adminUtils'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Admin authentication - only for admin users
 * Supervisor and Technician dashboards have direct access without authentication
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      return { data, error }
    }

    // If login is successful and user is an admin, ensure their profile exists
    if (data.user && !error && isAdminEmail(email)) {
      try {
        // Update user metadata to ensure admin role is set
        await supabase.auth.updateUser({
          data: {
            role: 'admin',
            user_role: 'admin'
          }
        })

        // Update or create admin profile
        await supabase
          .from('admin_users')
          .upsert([{
            id: data.user.id,
            email: email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0] || 'Admin User',
            is_active: true
          }], {
            onConflict: 'id'
          })
      } catch (updateError) {
        console.warn('Failed to update admin role on login:', updateError)
      }
    }

    return { data, error }
  } catch (unexpectedError) {
    console.error('Unexpected sign in error:', unexpectedError)
    return { data: { user: null, session: null }, error: unexpectedError as any }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getAdminProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data: data as AdminUser | null, error }
}

/**
 * Check if a user has admin privileges
 * Only used for admin panel access control
 */
export const isAdmin = (user: any): boolean => {
  if (!user) return false

  // Check multiple sources for admin role
  const userMetadataRole = user.user_metadata?.role
  const appMetadataRole = user.app_metadata?.role
  const userMetadataUserRole = user.user_metadata?.user_role

  return (
    userMetadataRole === 'admin' ||
    appMetadataRole === 'admin' ||
    userMetadataUserRole === 'admin' ||
    isAdminEmail(user.email || '')
  )
}
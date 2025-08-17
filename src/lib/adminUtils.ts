import { supabase } from './supabase'

// List of predefined admin emails
const ADMIN_EMAILS = [
  'admin@abc.com', // Primary admin email
  'abebe6993@gmail.com' // Add more admin emails as needed
]

// Check if an email is in the admin list
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Function to set admin role for current user (if they're in the admin list)
export const setCurrentUserAsAdmin = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('No authenticated user found')
    }

    if (!isAdminEmail(user.email || '')) {
      throw new Error('User email is not in the admin list')
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        role: 'admin',
        user_role: 'admin'
      }
    })

    if (updateError) throw updateError

    // Update or create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert([{
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
        role: 'admin'
      }], {
        onConflict: 'id'
      })

    if (profileError) {
      console.warn('Profile update failed, but user metadata was updated:', profileError)
    }

    return { success: true, message: 'Admin role set successfully' }
  } catch (error: any) {
    console.error('Error setting admin role:', error)
    return { success: false, error: error.message }
  }
}

// Function to check and setup admin users (simplified version)
export const ensureAdminUsers = async () => {
  try {
    // This function now just logs that admin setup is available
    // The actual admin setup happens when an admin user logs in
    console.log('Admin emails configured:', ADMIN_EMAILS)
    console.log('Admin users will be automatically promoted when they sign up or log in')
    return { success: true }
  } catch (error: any) {
    console.warn('Admin setup warning:', error)
    return { success: false, error: error.message }
  }
}
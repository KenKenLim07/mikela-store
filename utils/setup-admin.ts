// Utility to set up admin users and debug admin access
import { supabase } from '../lib/supabase'

export async function makeUserAdmin(userEmail: string) {
  try {
    console.log(`Making user ${userEmail} an admin...`)
    
    // First, get the user by email from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Cannot list users (need service role key):', authError)
      return { success: false, error: 'Need admin permissions' }
    }
    
    const targetUser = authUsers.users.find(user => user.email === userEmail)
    
    if (!targetUser) {
      console.error('User not found:', userEmail)
      return { success: false, error: 'User not found' }
    }
    
    // Update or create profile with admin role
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: targetUser.id,
        email: userEmail,
        role: 'admin',
        full_name: targetUser.user_metadata?.full_name
      })
      .select()
    
    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Successfully made user admin:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Setup error:', error)
    return { success: false, error: error.message }
  }
}

export async function debugUserRoles() {
  try {
    console.log('=== User Roles Debug ===')
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return
    }
    
    if (!session) {
      console.log('No active session')
      return
    }
    
    console.log('Current session user:', {
      id: session.user.id,
      email: session.user.email,
      metadata: session.user.user_metadata
    })
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) {
      console.error('Profile error:', profileError)
      console.log('No profile found - this might be the issue!')
      return
    }
    
    console.log('Current user profile:', profile)
    console.log('Is admin?', profile?.role === 'admin')
    
    // Get all profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
    
    if (!allError) {
      console.log('All profiles:', allProfiles)
      const adminCount = allProfiles?.filter(p => p.role === 'admin').length || 0
      console.log('Total admin users:', adminCount)
    }
    
  } catch (error) {
    console.error('Debug error:', error)
  }
}

// Quick fix function to create missing profile
export async function createMissingProfile() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('No session:', sessionError)
      return { success: false, error: 'No session' }
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        email: session.user.email,
        role: 'admin', // Set as admin by default
        full_name: session.user.user_metadata?.full_name
      })
      .select()
    
    if (error) {
      console.error('Error creating profile:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Profile created/updated:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Create profile error:', error)
    return { success: false, error: error.message }
  }
}
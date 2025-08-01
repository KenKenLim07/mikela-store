import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types/db'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isProfileFetching = useRef(false)
  const hasInitialProfile = useRef(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
          setLoading(false)
          return
        }

        if (session?.user) {
          // Set basic user immediately but keep loading=true until profile is fetched
          setUser({
            id: session.user.id,
            email: undefined,
            role: 'user', // temporary default
            full_name: undefined
          })
          
          // Fetch profile and wait for it to complete before setting loading=false
          if (!isProfileFetching.current) {
            isProfileFetching.current = true
            await fetchUserProfile(session.user.id)
          }
        } else {
          // No session, not loading anymore
          setLoading(false)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Failed to get session')
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: undefined,
            role: 'user', // temporary default
            full_name: undefined
          })
          
          if (!isProfileFetching.current) {
            isProfileFetching.current = true
            await fetchUserProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setError(null)
          hasInitialProfile.current = false
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // Set to default user role if profile fetch fails
        setUser(prev => prev ? {
          ...prev,
          role: 'user'
        } : null)
      } else if (data) {
        setUser(prev => prev ? {
          ...prev,
          email: data.email,
          role: data.role || 'user',
          full_name: data.full_name
        } : null)
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
      // Set to default user role if profile fetch fails
      setUser(prev => prev ? {
        ...prev,
        role: 'user'
      } : null)
    } finally {
      isProfileFetching.current = false
      hasInitialProfile.current = true
      // Only set loading to false after profile fetch is complete
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: { email: string, password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async ({ email, password, fullName }: { email: string, password: string, fullName: string }) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }
} 
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types/db'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isProfileFetching = useRef(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
          return
        }

        if (session?.user) {
          // Set basic user immediately for fast loading
          setUser({
            id: session.user.id,
            email: undefined,
            role: 'user',
            full_name: undefined
          })
          
          // Fetch profile in background (non-blocking)
          if (!isProfileFetching.current) {
            isProfileFetching.current = true
            fetchUserProfile(session.user.id)
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Failed to get session')
      } finally {
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
            role: 'user',
            full_name: undefined
          })
          
          if (!isProfileFetching.current) {
            isProfileFetching.current = true
            fetchUserProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setError(null)
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
        // Don't set error here - user can still use the app with basic info
        return
      }

      if (data) {
        setUser(prev => prev ? {
          ...prev,
          email: data.email,
          role: data.role || 'user',
          full_name: data.full_name
        } : null)
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
    } finally {
      isProfileFetching.current = false
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
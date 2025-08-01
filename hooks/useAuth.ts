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
          setLoading(false)
          return
        }

        if (session?.user) {
          // Don't set user until profile is fetched to avoid race conditions
          if (!isProfileFetching.current) {
            isProfileFetching.current = true
            await fetchUserProfile(session.user.id)
          }
        } else {
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
          if (!isProfileFetching.current) {
            isProfileFetching.current = true
            await fetchUserProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setError(null)
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
        // Set user with basic info and default role if profile fetch fails
        setUser({
          id: userId,
          email: undefined,
          role: 'user',
          full_name: undefined
        })
        setLoading(false)
        return
      }

      if (data) {
        setUser({
          id: userId,
          email: data.email,
          role: data.role || 'user',
          full_name: data.full_name
        })
      } else {
        // No profile found, create basic user
        setUser({
          id: userId,
          email: undefined,
          role: 'user',
          full_name: undefined
        })
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
      // Set user with basic info on error
      setUser({
        id: userId,
        email: undefined,
        role: 'user',
        full_name: undefined
      })
    } finally {
      isProfileFetching.current = false
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
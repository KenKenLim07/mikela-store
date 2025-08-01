import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, SupabaseResponse } from '../types/db'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const fetchProducts = async () => {
    if (hasFetched.current) return
    
    try {
      setLoading(true)
      setError(null)
      hasFetched.current = true
      
      const { data, error }: SupabaseResponse<Product[]> = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setError(error.message)
        return
      }

      setProducts(data || [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Start fetching products immediately - don't wait for auth
    fetchProducts()
  }, []) // Remove authLoading dependency

  return {
    products,
    loading, // Only show products loading, not auth loading
    error,
    refetch: () => {
      hasFetched.current = false
      fetchProducts()
    }
  }
} 
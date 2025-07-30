import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ProductForm } from '../components/admin/ProductForm'
import { supabase } from '../lib/supabase'

export const AdminAddProduct = () => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Defense-in-depth: Additional security check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const handleCreate = async (form: {
    name: string
    description: string
    price: string
    image?: File | null
    stocks?: number
  }) => {
    setError(null)
    setLoading(true)
    setProgress(0)
    let image_url: string | undefined = undefined

    // 1. Upload image if present
    if (form.image) {
      const fileExt = form.image.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      const filePath = `products/${fileName}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, form.image, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (evt: any) => {
            if (evt.total) {
              setProgress(Math.round((evt.loaded / evt.total) * 100))
            }
          }
        } as any) // onUploadProgress is not in types yet
      
      if (uploadError) {
        setError('Failed to upload image: ' + uploadError.message)
        setLoading(false)
        return
      }
      image_url = supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl
    }

    // 2. Insert product into DB
    const { error: insertError } = await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image_url,
      stocks: form.stocks ?? 0 // default to 0 if undefined
    })

    if (insertError) {
      setError('Failed to create product: ' + insertError.message)
      setLoading(false)
      return
    }

    setProgress(100)
    setTimeout(() => {
      setLoading(false)
      navigate('/admin/products')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-pink-600 mb-4 text-center">Add a New Product</h1>
        <p className="text-center text-gray-500 mb-6">
          Fill out the form below to add a new product to your store!
        </p>
        <ProductForm
          mode="create"
          onSubmit={handleCreate}
          loading={loading}
          error={error}
        />
        {loading && (
          <div className="mt-6 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-pink-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-300">
              <div className="bg-pink-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="mt-2 text-sm text-pink-600">{progress < 100 ? 'Uploading...' : 'Product created!'}</span>
          </div>
        )}
      </div>
    </div>
  )
} 
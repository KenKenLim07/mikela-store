import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../types/db'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export const Checkout = () => {
  const [searchParams] = useSearchParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyerName, setBuyerName] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const navigate = useNavigate()
  const productId = searchParams.get('product')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!productId) {
      setError('No product selected for checkout.')
      setLoading(false)
      return
    }
    const fetchProduct = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      if (error || !data) {
        setError('Product not found.')
        setLoading(false)
        return
      }
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [productId])

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setProof(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProofPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setProofPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerName.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!proof) {
      setError('Please upload your GCash payment proof.')
      return
    }
    if (product?.stocks === 0) {
      setError('Sorry, this product is out of stock.')
      return
    }
    setError(null)
    setSubmitting(true)
    setProgress(0)
    let payment_proof_url: string | undefined = undefined

    // 1. Upload payment proof
    if (proof) {
      const fileExt = proof.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      const filePath = `orders/${fileName}`
      const { data, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, proof, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (evt: any) => {
            if (evt.total) {
              setProgress(Math.round((evt.loaded / evt.total) * 100))
            }
          }
        } as any)
      if (uploadError) {
        setError('Failed to upload payment proof: ' + uploadError.message)
        setSubmitting(false)
        return
      }
      payment_proof_url = supabase.storage.from('payment-proofs').getPublicUrl(filePath).data.publicUrl
    }

    // 2. Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id: product?.id,
        buyer_name: buyerName.trim(),
        payment_proof_url,
        status: 'pending',
        user_id: user?.id
      })
      .select()
      .single()

    if (orderError) {
      setError('Failed to create order: ' + orderError.message)
      setSubmitting(false)
      return
    }

    setProgress(100)
    setSuccess(true)
    setOrderId(orderData.id)
    setSubmitting(false)

    // After successful order creation, decrement stocks
    const { error: stockError } = await supabase.from('products').update({ stocks: (product?.stocks ?? 1) - 1 }).eq('id', product?.id)
    if (stockError) {
      setError('Order placed, but failed to update stock: ' + stockError.message)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  // Block guest checkout
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-pink-600 mb-2">Sign in to Checkout</h2>
          <p className="text-gray-700 mb-4">You need to be signed in to place an order. Please log in or create an account to continue.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-gray-200 text-pink-700 rounded hover:bg-gray-300"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!productId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your checkout is empty</h2>
          <p className="text-gray-600 mb-4">Please select a product to continue with your purchase.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase. We'll process your order soon.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">Order ID: <span className="font-mono font-medium">{orderId}</span></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading product...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/payment?product=${productId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Payment
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Complete Order</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="w-16 h-1 bg-green-500 mx-2"></div>
            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">2</span>
            </div>
          </div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Payment Proof</h2>
          <p className="text-gray-600 text-sm">Please upload a screenshot of your GCash payment</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* Product Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-2xl">🖼️</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-600">₱{product.price.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Buyer Name */}
            <div>
              <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="buyerName"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GCash Payment Proof *
              </label>
              <div className="space-y-4">
                {/* File Input */}
                <div className="flex items-center space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProofChange}
                    className="hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Choose File
                  </button>
                  <span className="text-sm text-gray-500">
                    {proof ? proof.name : 'No file chosen'}
                  </span>
                </div>

                {/* Preview */}
                {proofPreview && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={proofPreview}
                      alt="Payment proof preview"
                      className="max-w-full h-auto max-h-64 mx-auto rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Store
              </button>
            </div>

            {/* Progress Bar */}
            {submitting && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 
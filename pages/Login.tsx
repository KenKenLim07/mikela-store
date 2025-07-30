import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { signIn } from '../lib/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export const Login = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }, [user, navigate])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setErrors({})
    try {
      const { error } = await signIn({
        email: formData.email,
        password: formData.password
      })
      if (error) {
        setErrors({ general: error.message })
        return
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword(v => !v)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-pink-100 text-2xl">🛍️</span>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Sign In</h2>
          <p className="mt-1 text-sm text-gray-600">Welcome back! Please sign in to your account.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="on">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 w-full rounded border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          {errors.general && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">{errors.general}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span>Don&apos;t have an account?</span>
          <Link to="/register" className="text-pink-600 hover:underline ml-1">Register</Link>
        </div>
      </div>
    </div>
  )
} 
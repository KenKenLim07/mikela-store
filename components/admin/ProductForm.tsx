import { useState, useRef } from 'react'
import type { Product } from '../../types/db'

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Product>
  onSubmit: (data: FormData) => Promise<void>
  loading?: boolean
  error?: string | null
}

interface FormData {
  name: string
  description: string
  price: string
  image?: File | null
  stocks?: number
}

export const ProductForm = ({ mode, initialData = {}, onSubmit, loading, error }: ProductFormProps) => {
  const [form, setForm] = useState<FormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price ? String(initialData.price) : '',
    image: undefined,
    stocks: initialData.stocks || 0
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validate = (): boolean => {
    if (!form.name.trim()) {
      setFormError('Product name is required')
      return false
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setFormError('Price must be a positive number')
      return false
    }
    if (!form.stocks && form.stocks !== 0) {
      setFormError('Stocks is required')
      return false
    }
    if (form.stocks < 0) {
      setFormError('Stocks cannot be negative')
      return false
    }
    setFormError(null)
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setForm((prev) => ({ ...prev, image: file }))
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({ ...form, stocks: form.stocks })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name <span className="text-pink-600">*</span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (₱) <span className="text-pink-600">*</span>
        </label>
        <input
          type="number"
          name="price"
          id="price"
          value={form.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="stocks" className="block text-sm font-medium text-gray-700">Stocks</label>
        <input
          type="number"
          id="stocks"
          name="stocks"
          min={0}
          required
          value={form.stocks ?? ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          placeholder="How many items in stock?"
        />
        {formError && formError.includes('Stocks') && <p className="mt-1 text-xs text-red-500">{formError}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Product Image</label>
        <div className="flex items-center space-x-4 mt-2">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded" />
          ) : (
            <div className="h-20 w-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
          />
        </div>
      </div>
      {(formError || error) && (
        <div className="rounded bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
          {formError || error}
        </div>
      )}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Product')}
        </button>
      </div>
    </form>
  )
} 
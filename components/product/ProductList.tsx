import { useProducts } from '../../hooks/useProducts'
import { ProductCard } from './ProductCard'
import type { Product } from '../../types/db'
import { Layout } from '../ui/Layout'
import { memo, useMemo } from 'react'

// Skeleton component for loading state
const ProductSkeleton = memo(() => (
  <div className="bg-white rounded-md shadow-md overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="aspect-square w-full bg-gray-200"></div>
    {/* Content skeleton */}
    <div className="p-1">
      <div className="flex items-center justify-between mb-1">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
))

ProductSkeleton.displayName = 'ProductSkeleton'

const LoadingGrid = memo(() => {
  const skeletons = useMemo(() => 
    Array.from({ length: 8 }).map((_, index) => (
      <ProductSkeleton key={index} />
    )), 
    []
  )

  return (
    <section>
      <Layout>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {skeletons}
        </div>
      </Layout>
    </section>
  )
})

LoadingGrid.displayName = 'LoadingGrid'

const ErrorDisplay = memo(({ error }: { error: string }) => (
  <section>
    <Layout>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg font-medium mb-2">Unable to load products</div>
        <p className="text-red-700 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    </Layout>
  </section>
))

ErrorDisplay.displayName = 'ErrorDisplay'

const EmptyState = memo(() => (
  <div className="col-span-full text-center py-12">
    <div className="text-gray-400 text-6xl mb-4">🛍️</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
    <p className="text-gray-500">Check back soon for new items!</p>
  </div>
))

EmptyState.displayName = 'EmptyState'

const ProductGrid = memo(({ products }: { products: Product[] }) => {
  const productCards = useMemo(() => 
    products.map((product: Product) => (
      <ProductCard key={product.id} product={product} />
    )),
    [products]
  )

  return (
    <section>
      <Layout>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            productCards
          )}
        </div>
      </Layout>
    </section>
  )
})

ProductGrid.displayName = 'ProductGrid'

export const ProductList = memo(() => {
  const { products, loading, error } = useProducts()

  if (loading) {
    return <LoadingGrid />
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  return <ProductGrid products={products} />
})

ProductList.displayName = 'ProductList' 
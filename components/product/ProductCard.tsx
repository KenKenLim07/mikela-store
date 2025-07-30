import type { Product } from '../../types/db'
import { Link } from 'react-router-dom'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

const ImageWithSkeleton = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 flex items-center justify-center">
          <span className="text-gray-300 text-4xl">🖼️</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`object-cover w-full h-full transition-transform duration-300 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        draggable={false}
      />
    </div>
  )
}

const BuyButton = ({ isOutOfStock, productId, productName }: { isOutOfStock: boolean; productId: string; productName: string }) => (
  <Link
    to={isOutOfStock ? '#' : `/payment?product=${productId}`}
    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-pink-400
      ${isOutOfStock
        ? 'bg-gray-300 text-gray-400 cursor-not-allowed pointer-events-none'
        : 'bg-pink-600 text-white hover:bg-pink-700 focus:bg-pink-700 active:bg-pink-800'}
    `}
    aria-label={isOutOfStock ? 'Out of Stock' : `Buy ${productName}`}
    aria-disabled={isOutOfStock}
    tabIndex={isOutOfStock ? -1 : 0}
  >
    {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
  </Link>
)

export const ProductCard = ({ product }: ProductCardProps) => {
  const isOutOfStock = product.stocks === 0

  return (
    <article
      className="bg-white rounded-md shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col overflow-hidden group focus-within:ring-2 focus-within:ring-pink-400"
      tabIndex={0}
      aria-label={`Product: ${product.name}`}
    >
      <header>
        {product.image_url ? (
          <ImageWithSkeleton src={product.image_url} alt={product.name} />
        ) : (
          <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-300 text-4xl">🖼️</span>
          </div>
        )}
      </header>
      <section className="p-1 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1 gap-2 min-h-[1.5em]">
          <h3 className="font-semibold text-sm text-gray-900 truncate" title={product.name}>
            {product.name}
          </h3>
          <span
            className={`text-xs font-medium transition-colors duration-200 whitespace-nowrap ${isOutOfStock ? 'text-red-500' : 'text-gray-500 group-hover:text-pink-600'}`}
            title={isOutOfStock ? 'Out of Stock' : `Stocks: ${product.stocks}`}
            aria-live="polite"
          >
            {isOutOfStock ? 'Out of Stock' : `Stocks: ${product.stocks}`}
          </span>
        </div>
        {product.description && (
          <p className="text-gray-500 text-xs mb-1 line-clamp-2 leading-snug">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-pink-600 font-bold text-sm transition-colors duration-200 group-hover:text-pink-700">
            ₱{product.price.toFixed(2)}
          </span>
          <BuyButton isOutOfStock={isOutOfStock} productId={product.id} productName={product.name} />
        </div>
      </section>
    </article>
  )
} 
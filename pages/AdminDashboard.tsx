import { useProducts } from '../hooks/useProducts'
import { useOrders } from '../hooks/useOrders'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { PlusIcon, ShoppingBagIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const { products, loading: productsLoading } = useProducts()
  const { orders, loading: ordersLoading } = useOrders()

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

  const stats = [
    {
      name: 'Total Products',
      value: products.length,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    {
      name: 'Total Orders',
      value: orders.length,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    {
      name: 'Total Customers',
      value: 0, // TODO: Add customers hook
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      href: '/admin/customers'
    }
  ]

  if (productsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 flex items-center gap-4">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-2 flex items-center justify-center`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to={stat.href}
                    className="font-medium text-blue-700 hover:text-blue-900"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/products/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Add New Product</h3>
                <p className="text-sm text-gray-500">Create a new product listing</p>
              </div>
            </Link>
            
            <Link
              to="/admin/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Products</h3>
                <p className="text-sm text-gray-500">Edit or delete existing products</p>
              </div>
            </Link>
            
            <Link
              to="/admin/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">View Orders</h3>
                <p className="text-sm text-gray-500">Check recent orders and payments</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Products</h2>
            <Link
              to="/admin/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products yet. Add your first product!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <span className="text-sm font-medium text-green-600">
                      ₱{product.price.toFixed(2)}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}
                  <Link
                    to={`/admin/products/edit/${product.id}`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Edit product
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
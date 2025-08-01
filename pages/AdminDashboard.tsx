import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { debugUserRoles, createMissingProfile } from '../utils/setup-admin'

export const AdminDashboard = () => {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleDebug = async () => {
    setLoading(true)
    try {
      await debugUserRoles()
      // Get fresh user info after debug
      setDebugInfo({
        currentUser: user,
        timestamp: new Date().toISOString(),
        debugComplete: true
      })
    } catch (error) {
      console.error('Debug failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async () => {
    setLoading(true)
    try {
      const result = await createMissingProfile()
      console.log('Create profile result:', result)
      // Reload page to get fresh auth state
      if (result.success) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Create profile failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('AdminDashboard mounted with user:', user)
  }, [user])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        {/* Debug Section */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-3">Debug Admin Access</h2>
          <div className="space-y-3">
            <div className="text-sm text-yellow-700">
              <p><strong>Current User ID:</strong> {user?.id}</p>
              <p><strong>Current Role:</strong> {user?.role}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Is Admin:</strong> {user?.role === 'admin' ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDebug}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Running Debug...' : 'Debug User Roles'}
              </button>
              
              <button
                onClick={handleCreateProfile}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create/Fix Profile'}
              </button>
            </div>
            
            {debugInfo && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Products</h3>
            <p className="text-3xl font-bold">--</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold">--</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold">$--</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/products"
              className="block p-4 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <h3 className="font-semibold text-pink-900">Manage Products</h3>
              <p className="text-pink-700 text-sm">Add, edit, or remove products</p>
            </a>
            
            <a
              href="/admin/orders"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-semibold text-blue-900">View Orders</h3>
              <p className="text-blue-700 text-sm">Manage customer orders</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 
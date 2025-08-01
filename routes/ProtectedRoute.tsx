import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactElement
  adminOnly?: boolean
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()

  // Debug logging for admin access issues
  if (adminOnly) {
    console.log('ProtectedRoute Debug:', {
      loading,
      user,
      userRole: user?.role,
      adminOnly,
      isAdmin: user?.role === 'admin'
    })
  }

  // Show loading skeleton while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Check admin role if required
  if (adminOnly && user.role !== 'admin') {
    console.log('ProtectedRoute: Admin required but user role is:', user.role)
    return <Navigate to="/" replace />
  }

  console.log('ProtectedRoute: Access granted')
  return children
} 
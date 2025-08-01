import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Navbar } from './components/ui/Navbar'
import { ProtectedRoute } from './routes/ProtectedRoute'

// Direct imports for admin components to debug access issue
import { AdminDashboard } from './pages/AdminDashboard'
import { ManageProducts } from './pages/ManageProducts'
import { AdminAddProduct } from './pages/AdminAddProduct'
import { AdminOrders } from './pages/AdminOrders'

// Lazy load non-admin page components for code splitting
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })))
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })))
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })))
const PaymentQR = lazy(() => import('./pages/PaymentQR').then(module => ({ default: module.PaymentQR })))
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })))
const Orders = lazy(() => import('./pages/Orders').then(module => ({ default: module.Orders })))

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/payment" element={<PaymentQR />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute adminOnly><ManageProducts /></ProtectedRoute>} />
              <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><AdminAddProduct /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  )
}

export default App

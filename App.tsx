import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/ui/Navbar'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Checkout } from './pages/Checkout'
import { PaymentQR } from './pages/PaymentQR'
import { AdminDashboard } from './pages/AdminDashboard'
import { ManageProducts } from './pages/ManageProducts'
import { NotFound } from './pages/NotFound'
import { AdminAddProduct } from './pages/AdminAddProduct'
import { AdminOrders } from './pages/AdminOrders'
import { Orders } from './pages/Orders'
import { ProtectedRoute } from './routes/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
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
        </main>
      </div>
    </Router>
  )
}

export default App

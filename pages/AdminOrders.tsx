import { useState } from 'react'
import { useOrders } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import React from 'react'
import { Modal } from '../components/ui/Modal'
import { useRef } from 'react'

// Toast system (minimal, for now)
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
    {message}
    <button className="ml-2 text-white/80 hover:text-white" onClick={onClose}>&times;</button>
  </div>
)

const statusFlow = ['pending', 'confirmed', 'completed', 'denied']

export const AdminOrders = () => {
  const { user, loading: authLoading } = useAuth()
  const { orders, loading, error, refetch } = useOrders()
  const { products } = useProducts()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [localOrders, setLocalOrders] = useState(orders)
  const [denialModalOpen, setDenialModalOpen] = useState(false)
  const [denialReason, setDenialReason] = useState('')
  const [pendingDenyOrder, setPendingDenyOrder] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const denialReasonRef = useRef('')

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

  // Update local orders when orders prop changes
  React.useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  const getProduct = (id: string) => products.find(p => p.id === id)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Prevent default form submission
    event?.preventDefault?.()
    
    setUpdatingId(orderId)
    setUpdateError(null)
    
    // Find the order and previous status
    const order = localOrders.find(o => o.id === orderId)
    const prevStatus = order?.status

    // If changing to denied, open modal for reason
    if (newStatus === 'denied' && prevStatus !== 'denied') {
      setPendingDenyOrder(orderId)
      setDenialModalOpen(true)
      return
    }
    await updateOrderStatus(orderId, newStatus, prevStatus)
  }

  // Helper to update order status and handle stock/denial reason
  const updateOrderStatus = async (orderId: string, newStatus: string, prevStatus?: string, denialReasonValue?: string) => {
    const order = localOrders.find(o => o.id === orderId)
    // Only update denial_reason if denying
    const updateObj: any = { status: newStatus }
    if (newStatus === 'denied' && denialReasonValue) {
      updateObj.denial_reason = denialReasonValue
    } else if (newStatus !== 'denied') {
      updateObj.denial_reason = null
    }
    const { error } = await supabase
      .from('orders')
      .update(updateObj)
      .eq('id', orderId)
    if (error) {
      setUpdateError('Failed to update status: ' + error.message)
    } else {
      setLocalOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus, denial_reason: updateObj.denial_reason }
            : order
        )
      )
      // Only increment stock if going from non-denied to denied
      if (newStatus === 'denied' && prevStatus !== 'denied') {
        const productId = order?.product_id
        if (productId) {
          const product = products.find(p => p.id === productId)
          if (product) {
            await supabase.from('products').update({ stocks: product.stocks + 1 }).eq('id', productId)
            setToast('Stock restored for denied order.')
          }
        }
      }
      // Only decrement if going from denied to non-denied
      if (prevStatus === 'denied' && newStatus !== 'denied') {
        const productId = order?.product_id
        if (productId) {
          const product = products.find(p => p.id === productId)
          if (product && product.stocks > 0) {
            await supabase.from('products').update({ stocks: product.stocks - 1 }).eq('id', productId)
          }
        }
      }
    }
    setUpdatingId(null)
  }

  // Use localOrders for rendering
  const displayOrders = localOrders.length > 0 ? localOrders : orders

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {/* Denial reason modal */}
      <Modal
        open={denialModalOpen}
        onClose={() => { setDenialModalOpen(false); setDenialReason(''); setPendingDenyOrder(null) }}
        title="Reason for Denial"
        actions={
          <>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => { setDenialModalOpen(false); setDenialReason(''); setPendingDenyOrder(null) }}
            >Cancel</button>
            <button
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
              disabled={!denialReason.trim()}
              onClick={async () => {
                if (pendingDenyOrder) {
                  await updateOrderStatus(pendingDenyOrder, 'denied', localOrders.find(o => o.id === pendingDenyOrder)?.status, denialReason)
                  setDenialModalOpen(false)
                  setDenialReason('')
                  setPendingDenyOrder(null)
                }
              }}
            >Deny Order</button>
          </>
        }
      >
        <textarea
          className="w-full border rounded p-2 min-h-[80px] focus:border-pink-500 focus:ring-pink-500"
          placeholder="Please provide a reason for denial..."
          value={denialReason}
          onChange={e => setDenialReason(e.target.value)}
          autoFocus
        />
      </Modal>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 shadow"
          >
            Refresh
          </button>
        </div>
        {updateError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {updateError}
          </div>
        )}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading orders...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : displayOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Proof</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayOrders.map(order => {
                  const product = getProduct(order.product_id || '')
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product ? (
                          <div className="flex items-center gap-2">
                            {product.image_url && (
                              <img src={product.image_url} alt={product.name} className="h-8 w-8 object-cover rounded" />
                            )}
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{order.buyer_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.payment_proof_url ? (
                          <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <img src={order.payment_proof_url} alt="Proof" className="h-12 w-12 object-cover rounded border hover:scale-105 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          value={order.status || 'pending'}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="px-2 py-1 rounded border border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm bg-white shadow-sm"
                        >
                          {statusFlow.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
} 
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

const NavbarSkeleton = () => (
  <nav className="bg-white shadow-sm border-b border-gray-200 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
      <div className="w-32 h-6 bg-gray-200 rounded mr-4" />
      <div className="w-16 h-6 bg-gray-200 rounded mr-2" />
      <div className="w-16 h-6 bg-gray-200 rounded" />
    </div>
  </nav>
)

export const Navbar = () => {
  // All hooks must be called before any early return!
  const { user, loading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false)
  const adminDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!isAdminDropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target as Node)) {
        setIsAdminDropdownOpen(false)
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsAdminDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isAdminDropdownOpen])

  // Only render skeleton while loading
  if (loading) return <NavbarSkeleton />

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleAdminDropdown = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-pink-600 hover:text-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded"
            >
              <span>🛍️</span>
              <span>Mikela Store</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <Link
                to="/"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                >
                  My Orders
                </Link>
              )}
              {/* Admin Dropdown */}
              {user?.role === 'admin' && (
                <div className="relative">
                  <button
                    onClick={toggleAdminDropdown}
                    className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 flex items-center space-x-1"
                    aria-expanded={isAdminDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>Admin</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  {/* Overlay dropdown absolutely, animate in/out */}
                  <div
                    ref={adminDropdownRef}
                    className={`fixed top-16 right-8 z-50 w-56 transition-all duration-200 ease-out ${isAdminDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'} bg-white rounded-md shadow-2xl border border-gray-200 py-2`}
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                    tabIndex={-1}
                    aria-label="Admin menu"
                  >
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors rounded"
                      onClick={() => setIsAdminDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/products"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors rounded"
                      onClick={() => setIsAdminDropdownOpen(false)}
                    >
                      Manage Products
                    </Link>
                  </div>
                  {/* Optional: backdrop for focus */}
                  {isAdminDropdownOpen && (
                    <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setIsAdminDropdownOpen(false)} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Menu / Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Hello, {user.full_name || 'User'}!
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-pink-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-xl animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-gray-700 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMobileMenu}
              >
                My Orders
              </Link>
            )}
            {/* Mobile Admin Links */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className="text-gray-700 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Manage Products
                </Link>
              </>
            )}
            {/* Mobile User Menu */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Hello, {user.full_name || 'User'}!
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-pink-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 
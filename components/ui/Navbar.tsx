import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

const NavbarSkeleton = memo(() => (
  <nav className="bg-white shadow-sm border-b border-gray-200 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
      <div className="w-32 h-6 bg-gray-200 rounded mr-4" />
      <div className="w-16 h-6 bg-gray-200 rounded mr-2" />
      <div className="w-16 h-6 bg-gray-200 rounded" />
    </div>
  </nav>
))

NavbarSkeleton.displayName = 'NavbarSkeleton'

export const Navbar = memo(() => {
  // All hooks must be called before any early return!
  const { user, loading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false)
  const adminDropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = useCallback(async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }, [signOut])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const toggleAdminDropdown = useCallback(() => {
    setIsAdminDropdownOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role])

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!isAdminDropdownOpen) return
    
    const handleClick = (e: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target as Node)) {
        setIsAdminDropdownOpen(false)
      }
    }
    
    const handleEsc = (e: KeyboardEvent) => {
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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              onClick={closeMobileMenu}
            >
              <span className="text-2xl">🛍️</span>
              <span className="text-xl font-bold text-pink-600 hidden sm:block">Mikela Store</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/orders" 
                  className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                >
                  My Orders
                </Link>
                
                {isAdmin && (
                  <div className="relative" ref={adminDropdownRef}>
                    <button
                      onClick={toggleAdminDropdown}
                      className="flex items-center text-gray-700 hover:text-pink-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-md px-2 py-1"
                      aria-expanded={isAdminDropdownOpen}
                      aria-haspopup="true"
                    >
                      Admin
                      <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAdminDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/products"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          Manage Products
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          Manage Orders
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-pink-600 transition-colors p-2 rounded-md"
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-pink-600 transition-colors font-medium py-2"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/orders" 
                  className="block text-gray-700 hover:text-pink-600 transition-colors font-medium py-2"
                  onClick={closeMobileMenu}
                >
                  My Orders
                </Link>
                
                {isAdmin && (
                  <>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-sm font-semibold text-gray-500 mb-2">Admin</p>
                      <Link
                        to="/admin"
                        className="block text-gray-700 hover:text-pink-600 transition-colors py-2 pl-4"
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/products"
                        className="block text-gray-700 hover:text-pink-600 transition-colors py-2 pl-4"
                        onClick={closeMobileMenu}
                      >
                        Manage Products
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="block text-gray-700 hover:text-pink-600 transition-colors py-2 pl-4"
                        onClick={closeMobileMenu}
                      >
                        Manage Orders
                      </Link>
                    </div>
                  </>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="block text-left w-full text-gray-700 hover:text-pink-600 transition-colors font-medium py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block text-gray-700 hover:text-pink-600 transition-colors font-medium py-2"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors font-medium text-center"
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
})

Navbar.displayName = 'Navbar' 
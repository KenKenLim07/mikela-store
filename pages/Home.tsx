import { Link } from 'react-router-dom'
import { ProductList } from '../components/product/ProductList'
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Layout, SectionLayout } from '../components/ui/Layout'

// Hero Section Component
const HeroSection = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
  <section className="relative bg-white overflow-hidden pb-4">
    <Layout className="relative py-6 sm:py-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-3xl sm:text-4xl">👋</span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-pink-600 tracking-tight">
            Hi, I'm Mikela!
          </h1>
        </div>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
          I'm a 13-year-old aspiring entrepreneur passionate about helping everyone find the perfect items! 
          Welcome to my little store where I curate adorable and quality products just for you.
        </p>
        <div className="flex flex-row gap-3 justify-center items-center">
          <button
            onClick={scrollToProducts}
            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-base"
          >
            <ShoppingBagIcon className="w-4 h-4 mr-2" />
            Shop Now
          </button>
          <Link
            to="/orders"
            className="inline-flex items-center px-6 py-3 border-2 border-pink-600 text-pink-600 font-semibold rounded-full hover:bg-pink-50 transition-all duration-200 text-base"
          >
            <HeartIcon className="w-4 h-4 mr-2" />
            My Orders
          </Link>
        </div>
      </div>
    </Layout>
  </section>
  )
}



// Testimonials Section Component
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Student',
      content: 'Love the quality of the school supplies! The pens write so smoothly and the notebooks are adorable.',
      rating: 5,
      avatar: '👩‍🎓'
    },
    {
      name: 'Mike R.',
      role: 'Parent',
      content: 'Great prices and fast delivery. My daughter loves all the cute accessories she got from here.',
      rating: 5,
      avatar: '👨‍👧'
    },
    {
      name: 'Emma L.',
      role: 'Artist',
      content: 'The art supplies are amazing quality! Perfect for my creative projects. Highly recommend!',
      rating: 5,
      avatar: '👩‍🎨'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <Layout>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our happy customers!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </Layout>
    </section>
  )
}



// Footer Component
const Footer = () => (
  <footer className="bg-gray-900 text-white">
    <Layout className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">🛍️</span>
            <h3 className="text-2xl font-bold text-pink-400">Mikela Store</h3>
          </div>
          <p className="text-gray-300 mb-4 max-w-md">
            Your one-stop shop for adorable school supplies and fun finds. 
            Making learning and creating more enjoyable for everyone!
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
              <span className="sr-only">Facebook</span>
              📘
            </a>
            <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
              <span className="sr-only">Instagram</span>
              📷
            </a>
            <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
              <span className="sr-only">Twitter</span>
              🐦
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-300 hover:text-pink-400 transition-colors">Home</Link></li>
            <li><Link to="/orders" className="text-gray-300 hover:text-pink-400 transition-colors">My Orders</Link></li>
            <li><Link to="/login" className="text-gray-300 hover:text-pink-400 transition-colors">Login</Link></li>
            <li><Link to="/register" className="text-gray-300 hover:text-pink-400 transition-colors">Register</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2 text-gray-300">
            <li>📧 support@mikelastore.com</li>
            <li>📱 +63 912 345 6789</li>
            <li>📍 Manila, Philippines</li>
            <li>🕒 Mon-Fri: 9AM-6PM</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">
          © 2024 Mikela Store. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-pink-400 text-sm transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-pink-400 text-sm transition-colors">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-pink-400 text-sm transition-colors">Shipping Info</a>
        </div>
              </div>
      </Layout>
    </footer>
  )

// Main Home Component
export const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Animated Separator */}
      <div className="relative py-1 bg-white">
        <Layout>
          <div className="flex justify-center">
                          <div className="relative">
                <div className="w-0 h-px bg-pink-300 animate-expand-line"></div>
              </div>
            </div>
          </Layout>
        </div>

      {/* Products Section */}
      <section id="products-section" className="pt-4 pb-12 bg-white">
        <Layout>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              I carefully select each item myself! From trending favorites to hidden gems, discover products that make learning and creating more fun.
            </p>
          </div>
          <ProductList />
        </Layout>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <Footer />
    </div>
  )
} 
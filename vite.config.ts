import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true
    })
  ],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173, // Default Vite port
    strictPort: true, // Fail if port is already in use
  },
  build: {
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks for better caching and loading
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'router-vendor'
          }
          if (id.includes('node_modules/@supabase/supabase-js')) {
            return 'supabase-vendor'
          }
          if (id.includes('node_modules/@heroicons/react')) {
            return 'icons-vendor'
          }
          if (id.includes('node_modules/class-variance-authority') || 
              id.includes('node_modules/clsx') || 
              id.includes('node_modules/tailwind-merge')) {
            return 'ui-vendor'
          }
          // Admin pages chunk
          if (id.includes('AdminDashboard') || 
              id.includes('AdminAddProduct') || 
              id.includes('AdminOrders') || 
              id.includes('ManageProducts')) {
            return 'admin-pages'
          }
          // Auth pages chunk
          if (id.includes('Login.tsx') || id.includes('Register.tsx')) {
            return 'auth-pages'
          }
          // Shop pages chunk
          if (id.includes('Checkout.tsx') || 
              id.includes('PaymentQR.tsx') || 
              id.includes('Orders.tsx')) {
            return 'shop-pages'
          }
        },
        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]'
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `assets/styles/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    // Target modern browsers for smaller builds
    target: 'esnext',
    minify: 'terser'
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
  }
})

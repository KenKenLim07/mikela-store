import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  className?: string
  containerClassName?: string
}

export const Layout = ({ 
  children, 
  className = "", 
  containerClassName = "max-w-7xl mx-auto px-1.5" 
}: LayoutProps) => {
  return (
    <div className={className}>
      <div className={containerClassName}>
        {children}
      </div>
    </div>
  )
}

// Predefined layout variants for consistency
export const PageLayout = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <Layout className={`min-h-screen ${className}`}>
    {children}
  </Layout>
)

export const SectionLayout = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <Layout className={`py-8 ${className}`}>
    {children}
  </Layout>
)

export const ContainerLayout = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <Layout className={className}>
    {children}
  </Layout>
) 
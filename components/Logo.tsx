import { Building2 } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} role="banner">
      <div className={`${sizeClasses[size]} rounded-xl bg-primary flex items-center justify-center shadow-lg`} aria-hidden="true">
        <Building2 className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-primary-foreground`} strokeWidth={2} aria-hidden="true" />
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold tracking-tight`}>
            Gestion Pro
          </h1>
          <p className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            Gestion professionnelle
          </p>
        </div>
      )}
    </div>
  )
}


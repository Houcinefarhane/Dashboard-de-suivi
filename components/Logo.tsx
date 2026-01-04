import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-48',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  // Pour les petites tailles, on affiche juste le symbole B
  if (size === 'sm' && !showText) {
    return (
      <div className={`flex items-center ${className}`} role="banner">
        <div className="w-8 h-8 rounded-xl relative overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #96b9dc 100%)' }}>
          <div className="absolute top-0 right-0 w-3 h-3" style={{ backgroundColor: '#96b9dc' }}>
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-white"></div>
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">B</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} role="banner">
      {showText ? (
        <Image
          src="/logo-billieve.svg"
          alt="Billiev"
          width={size === 'sm' ? 200 : size === 'md' ? 320 : 1000}
          height={size === 'sm' ? 75 : size === 'md' ? 120 : 375}
          className={sizeClasses[size]}
          priority
        />
      ) : (
        <div className="w-20 h-20 rounded-xl relative overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #96b9dc 100%)' }}>
          <div className="absolute top-0 right-0 w-5 h-5" style={{ backgroundColor: '#96b9dc' }}>
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-white"></div>
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-4xl">B</span>
        </div>
      )}
    </div>
  )
}


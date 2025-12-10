import Image from 'next/image'

type LogoVariant = 'icon' | 'horizontal' | 'monochrome'
type LogoSize = 'xs' | 'sm' | 'md' | 'lg'

interface LogoProps {
  variant?: LogoVariant
  size?: LogoSize
  opacity?: number
  className?: string
}

const sizeMap: Record<LogoSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 36,
}

const logoFiles: Record<LogoVariant, string> = {
  icon: '/newslens-icon.png',
  horizontal: '/newslens-horizontal.png',
  monochrome: '/newslens-monochrome.png',
}

export function Logo({
  variant = 'horizontal',
  size = 'md',
  opacity = 1,
  className = '',
}: LogoProps) {
  const height = sizeMap[size]
  const src = logoFiles[variant]

  return (
    <Image
      src={src}
      alt="NewsLens"
      height={height}
      width={height * (variant === 'icon' ? 1 : 4)}
      className={className}
      style={{ opacity }}
      priority
    />
  )
}

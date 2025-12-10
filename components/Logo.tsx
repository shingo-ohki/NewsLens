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

// アスペクト比（幅：高さ）
const aspectRatioMap: Record<LogoVariant, number> = {
  icon: 112 / 113,
  horizontal: 309 / 85,
  monochrome: 311 / 93,
}

export function Logo({
  variant = 'horizontal',
  size = 'md',
  opacity = 1,
  className = '',
}: LogoProps) {
  const height = sizeMap[size]
  const width = Math.round(height * aspectRatioMap[variant])
  const src = logoFiles[variant]

  return (
    <Image
      src={src}
      alt="NewsLens"
      width={width}
      height={height}
      className={className}
      style={{ opacity }}
      priority
    />
  )
}

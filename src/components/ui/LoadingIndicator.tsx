'use client'

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
}

export function LoadingIndicator({ 
  size = 'md', 
  className = '',
  text 
}: LoadingIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`${sizeMap[size]} border-purple-500/30 border-t-purple-500 rounded-full animate-spin`} 
      />
      {text && (
        <span className="text-sm text-gray-400">{text}</span>
      )}
    </div>
  )
}

// Button with loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButton({ 
  loading, 
  loadingText,
  children, 
  disabled,
  className = '',
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`relative ${className} ${loading ? 'cursor-wait' : ''}`}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <LoadingIndicator size="sm" />
          {loadingText && <span className="ml-2 text-sm">{loadingText}</span>}
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  )
}

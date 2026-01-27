import { Loader2 } from 'lucide-react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  tip?: string
  fullScreen?: boolean
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

const LoaderCommon = ({
  size = 'md',
  tip,
  fullScreen = false,
  className = ''
}: LoaderProps) => {
  const loader = (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-blue-600`} />
      {tip && <span className="text-gray-500 text-sm">{tip}</span>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {loader}
      </div>
    )
  }

  return <div className="flex items-center justify-center p-8">{loader}</div>
}

export default LoaderCommon

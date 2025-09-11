const Skeleton = ({ 
  className = '', 
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 rounded'
  const animationClasses = animation === 'pulse' ? 'animate-pulse' : 'animate-wave'
  
  const variants = {
    rectangular: '',
    circular: 'rounded-full',
    text: 'h-4 rounded',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${animationClasses} ${className}`
  
  return <div className={classes} />
}

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton className="w-full h-48" />
    <div className="p-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  </div>
)

export default Skeleton
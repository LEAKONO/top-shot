const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

export default PageContainer
export default function GlassCard({ children, className = '', hoverable = false, onClick }) {
  return (
    <div
      className={`${hoverable ? 'glass-card cursor-pointer' : 'glass-card-static'} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

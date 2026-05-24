const statusConfig = {
  'Pending': { color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400' },
  'Open': { color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400' },
  'Closed': { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-400' },
  'Ready for pick up': { color: 'bg-pink-50 text-pink-500 border-pink-200', dot: 'bg-pink-400' },
  'Picked up': { color: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-400' },
  'Pending install/delivery': { color: 'bg-sky-50 text-sky-600 border-sky-200', dot: 'bg-sky-400' },
  'Nil': { color: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
}

export default function StatusPill({ status, className = '' }) {
  const config = statusConfig[status] || statusConfig['Nil']
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      text-[10px] tracking-wider font-medium uppercase
      border ${config.color} ${className}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status || 'Unknown'}
    </span>
  )
}

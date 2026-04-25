const config = {
  PENDIENTE: {
    label: 'Pendiente',
    className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  },
  EN_PROCESO: {
    label: 'En proceso',
    className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  COMPLETADO: {
    label: 'Completado',
    className: 'bg-green-500/10 text-green-400 border border-green-500/20',
  },
}

export default function StatusBadge({ estado }) {
  const { label, className } = config[estado] || config.PENDIENTE
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
const config = {
  PENDIENTE: {
    label: 'Pendiente',
    className: 'bg-warning/10 text-warning border border-warning/25',
    dot: 'bg-warning',
  },
  EN_PROCESO: {
    label: 'En proceso',
    className: 'bg-accent/10 text-accent border border-accent/25',
    dot: 'bg-accent',
  },
  COMPLETADO: {
    label: 'Completado',
    className: 'bg-success/10 text-success border border-success/25',
    dot: 'bg-success',
  },
}

export default function StatusBadge({ estado, size = 'md' }) {
  const cfg = config[estado] || config.PENDIENTE
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full ${textSize} font-medium ${cfg.className} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {cfg.label}
    </span>
  )
}
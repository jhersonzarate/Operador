export default function StatCard({ label, value, icon: Icon, color = 'text-primary' }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          {label}
        </span>
        {Icon && <Icon size={16} className={color} />}
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
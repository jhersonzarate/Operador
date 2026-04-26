export default function StatCard({ label, value, icon: Icon, color = 'text-primary', sub }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 card-hover relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at top right, rgba(134,59,255,0.06) 0%, transparent 60%)' }} />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-widest leading-none">
            {label}
          </span>
          {Icon && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-border/60 flex items-center justify-center">
              <Icon size={14} className={color} />
            </div>
          )}
        </div>
        <p className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${color}`}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-muted mt-2">{sub}</p>}
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { Bell, Menu, ChevronRight } from 'lucide-react'
import { casesApi } from '../services/api'

export default function Header({ onMenuToggle }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await casesApi.dashboard()
        if (!cancelled) setStats(res.data)
      } catch { /* silent */ }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-5 shrink-0 relative z-30">
      {/* Left: hamburger (mobile) + metrics (desktop) */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        {/* Hamburger — only on mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-muted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-border flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Brand pill — mobile */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <div className="w-5 h-5 rounded bg-primary-dim flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-3 h-3 fill-primary">
              <path d="M10 1L4 8h5v2H3l6 9v-7h5L10 1z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-text tracking-wide">ComplyTools</span>
        </div>

        {/* Metrics — hidden on mobile, shown on md+ */}
        {stats && (
          <div className="hidden md:flex items-center gap-4">
            <MetricPill label="Casos" value={stats.totalCasos} color="text-text" />
            <div className="w-px h-4 bg-border" />
            <MetricPill label="Hoy" value={stats.completadosHoy} color="text-success" />
            <div className="w-px h-4 bg-border hidden lg:block" />
            <MetricPill
              label="En proceso"
              value={stats.casosEnProceso}
              color="text-accent"
              className="hidden lg:flex"
            />
            <div className="w-px h-4 bg-border hidden xl:block" />
            <MetricPill
              label="Fuentes"
              value={stats.totalFuentes}
              color="text-primary"
              className="hidden xl:flex"
            />
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Status dot */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
          <span className="text-[10px] font-medium text-success tracking-wide">Online</span>
        </div>

        <button className="text-muted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-border relative">
          <Bell size={17} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            A
          </div>
          <span className="text-xs text-text-secondary hidden sm:block">Admin</span>
          <ChevronRight size={12} className="text-muted hidden sm:block" />
        </div>
      </div>
    </header>
  )
}

function MetricPill({ label, value, color, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-[11px] text-muted">{label}:</span>
      <span className={`text-[11px] font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}
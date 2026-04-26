import { useEffect, useState } from 'react'
import { casesApi } from '../services/api'
import StatCard from '../components/StatCard'
import { FolderOpen, CheckCircle, Clock, Link2, TrendingUp, Timer, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const fetchStats = async () => {
      try {
        const res = await casesApi.dashboard()
        if (!cancelled) setStats(res.data)
      } catch {
        if (!cancelled) setError('No se pudo conectar con el servidor.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 px-4">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
        <AlertCircle size={22} className="text-danger" />
      </div>
      <p className="text-sm text-danger text-center">{error}</p>
      <p className="text-xs text-muted text-center">
        Backend esperado en <code className="text-primary font-mono">http://localhost:8080</code>
      </p>
    </div>
  )

  const formatTiempo = (min) => {
    if (!min || min === 0) return '—'
    if (min < 60) return `${Math.round(min)} min`
    return `${(min / 60).toFixed(1)} h`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent max-w-[60px]" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Overview</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Resumen operativo en tiempo real</p>
      </div>

      {/* Primary stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total de casos" value={stats?.totalCasos ?? 0}
          icon={FolderOpen} color="text-primary"
          sub={`${stats?.casosPendientes ?? 0} pendientes`}
        />
        <StatCard label="Completados hoy" value={stats?.completadosHoy ?? 0}
          icon={CheckCircle} color="text-success"
          sub="Últimas 24 h"
        />
        <StatCard label="En proceso" value={stats?.casosEnProceso ?? 0}
          icon={Clock} color="text-accent"
          sub="Investigación activa"
        />
        <StatCard label="Fuentes totales" value={stats?.totalFuentes ?? 0}
          icon={Link2} color="text-primary"
          sub="Registradas en BD"
        />
      </div>

      {/* Productivity metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="Productividad diaria"
          value={stats?.productividadDiaria ?? 0}
          icon={TrendingUp} color="text-warning"
          sub="Casos completados hoy"
        />
        <StatCard
          label="Tiempo promedio / caso"
          value={formatTiempo(stats?.tiempoPromedioPorCaso)}
          icon={Timer} color="text-accent"
          sub="Desde creación a completado"
        />
      </div>

      {/* Status distribution */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text">Distribución de estados</h2>
          <span className="text-xs text-muted tabular-nums">{stats?.totalCasos ?? 0} total</span>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <ProgressBar label="Pendientes" value={stats?.casosPendientes ?? 0}
            total={stats?.totalCasos ?? 1} color="bg-warning" textColor="text-warning" />
          <ProgressBar label="En proceso" value={stats?.casosEnProceso ?? 0}
            total={stats?.totalCasos ?? 1} color="bg-accent" textColor="text-accent" />
          <ProgressBar label="Completados" value={stats?.casosCompletados ?? 0}
            total={stats?.totalCasos ?? 1} color="bg-success" textColor="text-success" />
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <InfoCard
          title="Compliance Normativa"
          desc="Ley Nº 30424, SBS, ISO 31000 & ISO 37001"
          accent="primary"
        />
        <InfoCard
          title="Cobertura"
          desc="Lavado de activos, corrupción, narcotráfico y más"
          accent="accent"
        />
        <InfoCard
          title="Tiempo real"
          desc="Métricas actualizadas automáticamente cada minuto"
          accent="success"
        />
      </div>
    </div>
  )
}

function ProgressBar({ label, value, total, color, textColor }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
          <span className="text-sm text-text-secondary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold tabular-nums ${textColor}`}>{value}</span>
          <span className="text-xs text-muted w-8 text-right tabular-nums">{pct}%</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function InfoCard({ title, desc, accent }) {
  const colors = {
    primary: 'border-primary/20 bg-primary-dim',
    accent: 'border-accent/20 bg-accent-dim',
    success: 'border-success/20 bg-success/10',
  }
  const dotColors = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[accent]}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${dotColors[accent]}`} />
        <p className="text-xs font-semibold text-text">{title}</p>
      </div>
      <p className="text-xs text-muted leading-relaxed">{desc}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="space-y-2">
        <div className="h-3 w-24 shimmer rounded" />
        <div className="h-7 w-40 shimmer rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 shimmer rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-24 shimmer rounded-xl" />
        <div className="h-24 shimmer rounded-xl" />
      </div>
      <div className="h-48 shimmer rounded-xl" />
    </div>
  )
}
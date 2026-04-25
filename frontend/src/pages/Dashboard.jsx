import { useEffect, useState } from 'react'
import { casesApi } from '../services/api'
import StatCard from '../components/StatCard'
import { FolderOpen, CheckCircle, Clock, Link, TrendingUp, Timer } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false

    const fetchStats = async () => {
      try {
        const res = await casesApi.dashboard()
        if (!cancelado) {
          setStats(res.data)
        }
      } catch (err) {
        if (!cancelado) {
          console.error('[Dashboard] Error al cargar stats:', err)
          setError('No se pudo conectar con el servidor. Verifique que el backend este activo.')
        }
      } finally {
        if (!cancelado) {
          setLoading(false)
        }
      }
    }

    fetchStats()
    return () => { cancelado = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Cargando metricas...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-red-400 text-sm">{error}</p>
        <p className="text-xs text-muted">
          Backend esperado en{' '}
          <code className="text-primary">http://localhost:8080</code>
        </p>
      </div>
    )
  }

  // Formatear tiempo promedio en minutos o horas
  const formatTiempo = (minutos) => {
    if (!minutos || minutos === 0) return '—'
    if (minutos < 60) return `${Math.round(minutos)} min`
    const horas = (minutos / 60).toFixed(1)
    return `${horas} h`
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Resumen operativo en tiempo real</p>
      </div>

      {/* Fila principal de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total de casos"
          value={stats?.totalCasos ?? 0}
          icon={FolderOpen}
          color="text-primary"
        />
        <StatCard
          label="Completados hoy"
          value={stats?.completadosHoy ?? 0}
          icon={CheckCircle}
          color="text-green-400"
        />
        <StatCard
          label="En proceso"
          value={stats?.casosEnProceso ?? 0}
          icon={Clock}
          color="text-blue-400"
        />
        <StatCard
          label="Total fuentes"
          value={stats?.totalFuentes ?? 0}
          icon={Link}
          color="text-violet-400"
        />
      </div>

      {/* NUEVAS métricas de productividad — requeridas por el prompt */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Productividad diaria"
          value={stats?.productividadDiaria ?? 0}
          icon={TrendingUp}
          color="text-orange-400"
        />
        <StatCard
          label="Tiempo promedio / caso"
          value={formatTiempo(stats?.tiempoPromedioPorCaso)}
          icon={Timer}
          color="text-cyan-400"
        />
      </div>

      {/* Distribución de estados */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-4">
          Distribucion de estados
        </h2>
        <div className="space-y-3">
          <EstadoBar
            label="Pendientes"
            value={stats?.casosPendientes ?? 0}
            total={stats?.totalCasos ?? 1}
            color="bg-yellow-400"
          />
          <EstadoBar
            label="En proceso"
            value={stats?.casosEnProceso ?? 0}
            total={stats?.totalCasos ?? 1}
            color="bg-blue-400"
          />
          <EstadoBar
            label="Completados"
            value={stats?.casosCompletados ?? 0}
            total={stats?.totalCasos ?? 1}
            color="bg-green-400"
          />
        </div>
      </div>
    </div>
  )
}

// Barra de progreso por estado
function EstadoBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-sm text-text-secondary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">{value}</span>
          <span className="text-xs text-muted">{pct}%</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
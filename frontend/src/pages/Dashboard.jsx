import { useEffect, useState } from 'react'
import { casesApi } from '../services/api'
import StatCard from '../components/StatCard'
import { FolderOpen, CheckCircle, Clock, Link } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    casesApi.dashboard()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Cargando metricas...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Resumen operativo en tiempo real
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="col-span-3 bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text mb-4">
            Distribucion de estados
          </h2>
          <div className="flex gap-6">
            <StateRow label="Pendientes" value={stats?.casosPendientes ?? 0} color="bg-yellow-400" />
            <StateRow label="En proceso" value={stats?.casosEnProceso ?? 0} color="bg-blue-400" />
            <StateRow label="Completados" value={stats?.casosCompletados ?? 0} color="bg-green-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StateRow({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text ml-auto">{value}</span>
    </div>
  )
}
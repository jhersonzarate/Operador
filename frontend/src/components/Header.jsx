import { useEffect, useState } from 'react'
import { Bell, Activity } from 'lucide-react'
import { casesApi } from '../services/api'

/**
 * CORRECCIÓN: El header ahora muestra métricas reales del backend,
 * no texto estático. Carga los datos del dashboard y los muestra
 * como indicadores rápidos en la barra superior.
 */
export default function Header() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelado = false

    const cargar = async () => {
      try {
        const res = await casesApi.dashboard()
        if (!cancelado) setStats(res.data)
      } catch {
        // Header falla silenciosamente — no es crítico
      }
    }

    cargar()
    // Refrescar cada 60 segundos
    const intervalo = setInterval(cargar, 60_000)
    return () => {
      cancelado = true
      clearInterval(intervalo)
    }
  }, [])

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Métricas rápidas */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-muted">
          <Activity size={14} />
          <span className="text-xs">Sistema activo</span>
        </div>
        {stats && (
          <div className="flex items-center gap-5">
            <MetricaPill
              label="Total casos"
              valor={stats.totalCasos}
              color="text-text"
            />
            <MetricaPill
              label="Completados hoy"
              valor={stats.completadosHoy}
              color="text-green-400"
            />
            <MetricaPill
              label="En proceso"
              valor={stats.casosEnProceso}
              color="text-blue-400"
            />
            <MetricaPill
              label="Fuentes registradas"
              valor={stats.totalFuentes}
              color="text-violet-400"
            />
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <button className="text-muted hover:text-text transition-colors">
          <Bell size={17} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            A
          </div>
          <span className="text-xs text-text-secondary hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  )
}

function MetricaPill({ label, valor, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted">{label}:</span>
      <span className={`text-xs font-semibold ${color}`}>{valor}</span>
    </div>
  )
}
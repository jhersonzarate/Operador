import { useEffect, useState, useCallback } from 'react'
import { ClipboardList, RefreshCw, AlertCircle, Shield, Clock } from 'lucide-react'
import { auditApi } from '../services/api'

const ACCION_CONFIG = {
  CREAR_CASO:      { color: 'text-success bg-success/10 border-success/20',  dot: 'bg-success' },
  ACTUALIZAR_CASO: { color: 'text-accent  bg-accent/10  border-accent/20',   dot: 'bg-accent'  },
  ELIMINAR_CASO:   { color: 'text-danger  bg-danger/10  border-danger/20',   dot: 'bg-danger'  },
  REGISTRAR_FUENTE:{ color: 'text-primary bg-primary/10 border-primary/20',  dot: 'bg-primary' },
  DEFAULT:         { color: 'text-muted   bg-border      border-border-light', dot: 'bg-muted' },
}

const getAccionConfig = (accion) =>
  ACCION_CONFIG[accion] || ACCION_CONFIG.DEFAULT

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await auditApi.listar(100)
      setLogs(res.data)
    } catch (error) {
      setError(
        error.response?.status === 404
          ? 'El endpoint /api/audit-logs aún no está disponible en el backend.'
          : 'No se pudo conectar con el servidor. Verifica que el backend esté activo.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await fetchLogs()
    }
    init()
  }, [fetchLogs])

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '—'
    try {
      const d = new Date(fechaStr)
      return {
        fecha: d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
        hora: d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }
    } catch {
      return { fecha: fechaStr, hora: '' }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">

      {/* Page header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-8 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Sistema</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text">Auditoría</h1>
          <p className="text-sm text-muted mt-0.5">
            Historial de acciones registradas — {logs.length} entradas
          </p>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="
            flex items-center gap-2 px-3 py-2 text-xs sm:text-sm
            bg-surface border border-border rounded-lg
            text-text-secondary hover:text-text hover:border-border-light
            transition-all disabled:opacity-50 self-start xs:self-auto
          "
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 sm:h-14 shimmer rounded-xl" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-surface border border-border rounded-xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-warning/10 border border-warning/20 mx-auto flex items-center justify-center">
            <AlertCircle size={24} className="text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text mb-1">Sin conexión al módulo</p>
            <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">{error}</p>
          </div>
          <div className="bg-background border border-border rounded-xl p-4 text-left max-w-sm mx-auto">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Información técnica
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Las acciones se registran automáticamente en la tabla{' '}
              <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">audit_logs</code>{' '}
              cuando se crean, modifican o eliminan casos y fuentes.
            </p>
          </div>
          <button
            onClick={() => fetchLogs()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-medium transition-all"
          >
            <RefreshCw size={13} />
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && logs.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary-dim mx-auto flex items-center justify-center">
            <ClipboardList size={20} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-text">Sin registros de auditoría</p>
          <p className="text-xs text-muted">Las acciones del sistema aparecerán aquí automáticamente</p>
        </div>
      )}

      {/* Data */}
      {!loading && !error && logs.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                <span className="text-sm font-semibold text-text">Log de actividad</span>
              </div>
              <span className="text-xs text-muted font-mono tabular-nums">{logs.length} registros</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['#', 'Acción', 'Entidad', 'ID', 'Detalle', 'Fecha / Hora'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const cfg = getAccionConfig(log.accion)
                    const fecha = formatFecha(log.fecha)
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-border/40 hover:bg-border/20 transition-colors"
                      >
                        <td className="px-4 py-3.5 text-muted font-mono text-xs">
                          {logs.length - idx}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {log.accion}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary text-xs font-mono">
                          {log.entidad}
                        </td>
                        <td className="px-4 py-3.5 text-muted text-xs font-mono">
                          {log.entidadId != null ? `#${log.entidadId}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary text-xs max-w-xs">
                          <span className="line-clamp-1">{log.detalle || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs text-text-secondary">{fecha.fecha}</span>
                            <span className="text-[10px] text-muted font-mono">{fecha.hora}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {logs.map((log, idx) => {
              const cfg = getAccionConfig(log.accion)
              const fecha = formatFecha(log.fecha)
              return (
                <div
                  key={log.id}
                  className="bg-surface border border-border rounded-xl p-4 space-y-3"
                >
                  {/* Top row: action badge + number */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {log.accion}
                    </span>
                    <span className="text-[10px] text-muted font-mono">#{logs.length - idx}</span>
                  </div>

                  {/* Entity + ID */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted uppercase tracking-wider">Entidad:</span>
                      <span className="text-xs text-text-secondary font-mono">{log.entidad}</span>
                    </div>
                    {log.entidadId != null && (
                      <span className="text-[10px] text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">
                        #{log.entidadId}
                      </span>
                    )}
                  </div>

                  {/* Detail */}
                  {log.detalle && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-2 border-l-2 border-border pl-2.5">
                      {log.detalle}
                    </p>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-[10px] text-muted pt-1 border-t border-border/50">
                    <Clock size={10} />
                    <span>{fecha.fecha}</span>
                    <span className="font-mono">{fecha.hora}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-muted text-center pb-2">
            Mostrando los últimos {logs.length} registros del sistema
          </p>
        </>
      )}
    </div>
  )
}
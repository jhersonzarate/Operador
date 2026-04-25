import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import axios from 'axios'

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false

    const fetchLogs = async () => {
      try {
        // Endpoint de auditoría — devuelve los últimos 50 registros
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/audit-logs`, {
          timeout: 8000,
        })
        if (!cancelado) {
          setLogs(res.data)
        }
      } catch (err) {
        if (!cancelado) {
          // El endpoint de audit-logs puede no estar implementado aún
          // Mostramos mensaje informativo en lugar de crashear
          setError(
            err.response?.status === 404
              ? 'El endpoint /api/audit-logs aun no esta implementado en el backend.'
              : 'No se pudo conectar con el backend.'
          )
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    fetchLogs()
    return () => { cancelado = true }
  }, [])

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '—'
    try {
      return new Date(fechaStr).toLocaleString('es-PE')
    } catch {
      return fechaStr
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Auditoria</h1>
        <p className="text-sm text-muted mt-1">
          Historial de acciones registradas en el sistema
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48 text-muted text-sm">
          Cargando historial...
        </div>
      )}

      {error && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center space-y-3">
          <ClipboardList size={32} className="text-muted mx-auto" />
          <p className="text-sm text-muted">{error}</p>
          <p className="text-xs text-muted">
            Cada accion (crear, editar, eliminar) queda registrada automaticamente
            en la tabla <code className="text-primary font-mono">audit_logs</code>.
          </p>
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted">No hay registros de auditoria aun.</p>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Accion</th>
                <th className="text-left px-4 py-3 font-medium">Entidad</th>
                <th className="text-left px-4 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">Detalle</th>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr
                  key={log.id}
                  className="border-b border-border hover:bg-border/30 transition-colors"
                >
                  <td className="px-4 py-3 text-primary font-mono text-xs">
                    {log.accion}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{log.entidad}</td>
                  <td className="px-4 py-3 text-muted text-xs">#{log.entidadId}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs max-w-xs truncate">
                    {log.detalle}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {formatFecha(log.fecha)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
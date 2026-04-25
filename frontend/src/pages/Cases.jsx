import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { casesApi, exportApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import CaseFormModal from '../components/CaseFormModal'
import { Plus, Search, Download, ExternalLink, Trash2 } from 'lucide-react'

export default function Cases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await casesApi.listar()
      setCases(res.data)
    } catch (err) {
      console.error('[Cases] Error al cargar:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      await cargar()
    }
    load()
  }, [])

  const buscar = async () => {
    if (!query.trim()) {
      cargar()
      return
    }
    setLoading(true)
    try {
      const res = await casesApi.buscar(query)
      setCases(res.data)
    } catch (err) {
      console.error('[Cases] Error al buscar:', err)
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Eliminar este caso y todas sus fuentes?')) return
    try {
      await casesApi.eliminar(id)
      cargar()
    } catch (err) {
      console.error('[Cases] Error al eliminar:', err)
    }
  }

  const abrirBusquedaGoogle = (nombre, pais, e) => {
    e.stopPropagation()
    const q1 = encodeURIComponent(`"${nombre}" fraude ${pais}`)
    const q2 = encodeURIComponent(`"${nombre}" investigacion`)
    window.open(`https://www.google.com/search?q=${q1}`, '_blank')
    setTimeout(() => {
      window.open(`https://www.google.com/search?q=${q2}`, '_blank')
    }, 400)
  }

  const exportarCSV = async () => {
    try {
      const res = await exportApi.exportarCSV()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'casos-complytools.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al exportar. Verifique que el backend este activo.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Casos</h1>
          <p className="text-sm text-muted mt-1">{cases.length} registros encontrados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-secondary hover:text-text transition-colors"
          >
            <Download size={15} />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-medium transition-colors"
          >
            <Plus size={15} />
            Nuevo caso
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-lg px-3">
          <Search size={15} className="text-muted shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Buscar por nombre o pais..."
            className="flex-1 bg-transparent py-2.5 text-sm text-text placeholder-muted outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); cargar() }}
              className="text-muted hover:text-text text-xs transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        <button
          onClick={buscar}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text hover:border-primary transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">ID</th>
              <th className="text-left px-4 py-3 font-medium">Nombre completo</th>
              <th className="text-left px-4 py-3 font-medium">Pais</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium">Fuentes</th>
              <th className="text-left px-4 py-3 font-medium">Fecha</th>
              <th className="text-left px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted text-sm">
                  Cargando casos...
                </td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted text-sm">
                  No hay casos registrados
                </td>
              </tr>
            ) : (
              cases.map(caso => (
                <tr
                  key={caso.id}
                  onClick={() => navigate(`/cases/${caso.id}`)}
                  className="border-b border-border hover:bg-border/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 text-muted font-mono text-xs">#{caso.id}</td>
                  <td className="px-4 py-3.5 text-text font-medium">{caso.nombreCompleto}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{caso.pais}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge estado={caso.estado} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-medium ${caso.totalFuentes < 2 ? 'text-yellow-400' : 'text-text-secondary'}`}>
                      {caso.totalFuentes}
                      {caso.totalFuentes < 2 && (
                        <span className="text-xs text-muted ml-1">(min. 2)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-text-secondary text-xs">
                    {caso.createdAt
                      ? new Date(caso.createdAt).toLocaleDateString('es-PE')
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => abrirBusquedaGoogle(caso.nombreCompleto, caso.pais, e)}
                        title="Buscar en Google"
                        className="text-muted hover:text-primary transition-colors"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={e => eliminar(caso.id, e)}
                        title="Eliminar caso"
                        className="text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CaseFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); cargar() }}
        />
      )}
    </div>
  )
}
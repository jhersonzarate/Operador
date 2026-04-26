import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { casesApi, exportApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import CaseFormModal from '../components/CaseFormModal'
import {
  Plus, Search, Download, ExternalLink, Trash2,
  AlertCircle, ChevronRight, Link2
} from 'lucide-react'

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
      console.error('[Cases]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await cargar()
    }
    init()
  }, [cargar])

  const buscar = async () => {
    if (!query.trim()) { cargar(); return }
    setLoading(true)
    try {
      const res = await casesApi.buscar(query)
      setCases(res.data)
    } catch (err) {
      console.error('[Cases buscar]', err)
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este caso y todas sus fuentes?')) return
    try {
      await casesApi.eliminar(id)
      cargar()
    } catch (err) {
      console.error('[Cases eliminar]', err)
    }
  }

  const abrirGoogle = (nombre, pais, e) => {
    e.stopPropagation()
    const q = encodeURIComponent(`"${nombre}" fraude ${pais}`)
    window.open(`https://www.google.com/search?q=${q}`, '_blank')
  }

  const exportarCSV = async () => {
    try {
      const res = await exportApi.exportarCSV()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = 'casos-complytools.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al exportar. Verifique que el backend esté activo.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
      {/* Page header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text">Casos</h1>
          <p className="text-sm text-muted mt-0.5">
            {cases.length} registro{cases.length !== 1 ? 's' : ''} encontrado{cases.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-surface border border-border rounded-lg text-text-secondary hover:text-text hover:border-border-light transition-all"
          >
            <Download size={14} />
            <span className="hidden xs:inline">Exportar</span> CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-semibold transition-all shadow-glow-sm"
          >
            <Plus size={14} />
            Nuevo caso
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-lg px-3 focus-within:border-primary/50 transition-colors">
          <Search size={15} className="text-muted shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Buscar por nombre o país..."
            className="flex-1 bg-transparent py-2.5 text-sm text-text placeholder-muted outline-none min-w-0"
          />
          {query && (
            <button onClick={() => { setQuery(''); cargar() }}
              className="text-muted hover:text-text text-xs transition-colors shrink-0 px-1">
              ✕
            </button>
          )}
        </div>
        <button
          onClick={buscar}
          className="px-3 sm:px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text hover:border-primary/50 transition-colors shrink-0"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : cases.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-surface border border-border rounded-xl overflow-hidden">
            <div className="table-wrapper">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Nombre completo', 'País', 'Estado', 'Fuentes', 'Fecha', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cases.map(caso => (
                    <tr
                      key={caso.id}
                      onClick={() => navigate(`/cases/${caso.id}`)}
                      className="border-b border-border/50 hover:bg-border/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3.5 text-muted font-mono text-xs">#{caso.id}</td>
                      <td className="px-4 py-3.5 text-text font-medium max-w-[200px] lg:max-w-xs">
                        <span className="line-clamp-1">{caso.nombreCompleto}</span>
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary text-xs">{caso.pais}</td>
                      <td className="px-4 py-3.5"><StatusBadge estado={caso.estado} size="sm" /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link2 size={11} className={caso.totalFuentes < 2 ? 'text-warning' : 'text-muted'} />
                          <span className={`text-sm font-semibold tabular-nums ${caso.totalFuentes < 2 ? 'text-warning' : 'text-text-secondary'}`}>
                            {caso.totalFuentes}
                          </span>
                          {caso.totalFuentes < 2 && (
                            <AlertCircle size={11} className="text-warning" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary text-xs whitespace-nowrap">
                        {caso.createdAt ? new Date(caso.createdAt).toLocaleDateString('es-PE') : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => abrirGoogle(caso.nombreCompleto, caso.pais, e)}
                            title="Buscar en Google"
                            className="text-muted hover:text-primary transition-colors p-1 rounded"
                          >
                            <ExternalLink size={13} />
                          </button>
                          <button
                            onClick={e => eliminar(caso.id, e)}
                            title="Eliminar"
                            className="text-muted hover:text-danger transition-colors p-1 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {cases.map(caso => (
              <div
                key={caso.id}
                onClick={() => navigate(`/cases/${caso.id}`)}
                className="bg-surface border border-border rounded-xl p-4 cursor-pointer active:bg-border/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted">#{caso.id}</span>
                      <StatusBadge estado={caso.estado} size="sm" />
                    </div>
                    <p className="font-semibold text-text text-sm line-clamp-1">{caso.nombreCompleto}</p>
                    <p className="text-xs text-muted mt-0.5">{caso.pais}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted shrink-0 mt-1" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <Link2 size={12} className={caso.totalFuentes < 2 ? 'text-warning' : 'text-muted'} />
                    <span className={`text-xs font-semibold tabular-nums ${caso.totalFuentes < 2 ? 'text-warning' : 'text-text-secondary'}`}>
                      {caso.totalFuentes} fuente{caso.totalFuentes !== 1 ? 's' : ''}
                    </span>
                    {caso.totalFuentes < 2 && (
                      <span className="text-[10px] text-warning">(mín. 2)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => abrirGoogle(caso.nombreCompleto, caso.pais, e)}
                      className="text-muted hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary-dim"
                    >
                      <ExternalLink size={13} />
                    </button>
                    <button
                      onClick={e => eliminar(caso.id, e)}
                      className="text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-danger/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <CaseFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); cargar() }}
        />
      )}
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="bg-surface border border-border rounded-xl px-6 py-16 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-dim mx-auto flex items-center justify-center">
        <Search size={24} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text">Sin casos registrados</p>
        <p className="text-xs text-muted mt-1">Crea tu primer caso para comenzar la investigación</p>
      </div>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-semibold transition-all"
      >
        <Plus size={14} />
        Nuevo caso
      </button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 shimmer rounded-xl" />
      ))}
    </div>
  )
}
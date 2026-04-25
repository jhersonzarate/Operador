import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { casesApi, sourcesApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import CaseFormModal from '../components/CaseFormModal'
import SourceFormModal from '../components/SourceFormModal'
import {
  ArrowLeft, ExternalLink, Plus, Trash2,
  AlertTriangle, CheckCircle, Pencil
} from 'lucide-react'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caso, setCaso] = useState(null)
  const [sources, setSources] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSourceModal, setShowSourceModal] = useState(false)

  const cargar = async () => {
    const [c, s] = await Promise.all([
      casesApi.obtener(id),
      sourcesApi.listar(id),
    ])
    setCaso(c.data)
    setSources(s.data)
  }

  useEffect(() => { cargar() }, [id])

  const eliminarFuente = async (sourceId) => {
    if (!confirm('Eliminar esta fuente?')) return
    await sourcesApi.eliminar(id, sourceId)
    cargar()
  }

  const toggleValidacion = async (source) => {
    await sourcesApi.validar(id, source.id, {
      sospechosa: !source.sospechosa,
      relevante: source.relevante,
    })
    cargar()
  }

  if (!caso) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Cargando caso...
      </div>
    )
  }

  return (
    <div>
      {/* Nav volver */}
      <button
        onClick={() => navigate('/cases')}
        className="flex items-center gap-2 text-sm text-muted hover:text-text mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Volver a casos
      </button>

      {/* Header del caso */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs text-muted font-mono">#{caso.id}</span>
              <StatusBadge estado={caso.estado} />
            </div>
            <h1 className="text-lg font-semibold text-text">{caso.nombreCompleto}</h1>
            <p className="text-sm text-muted mt-1">{caso.pais}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-secondary hover:text-text transition-colors"
            >
              <Pencil size={13} />
              Editar
            </button>
            <button
              onClick={() => {
                const q = encodeURIComponent(`"${caso.nombreCompleto}" fraude ${caso.pais}`)
                window.open(`https://www.google.com/search?q=${q}`, '_blank')
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white transition-colors"
            >
              <ExternalLink size={13} />
              Buscar en Google
            </button>
          </div>
        </div>
      </div>

      {/* Fuentes */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-text">Fuentes registradas</h2>
          <p className="text-xs text-muted mt-0.5">
            {sources.length} fuente{sources.length !== 1 ? 's' : ''} —
            {sources.length < 2 && (
              <span className="text-yellow-400 ml-1">Minimo 2 requeridas</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowSourceModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-medium transition-colors"
        >
          <Plus size={13} />
          Agregar fuente
        </button>
      </div>

      <div className="space-y-3">
        {sources.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl px-5 py-10 text-center">
            <p className="text-sm text-muted">Sin fuentes registradas aun</p>
          </div>
        ) : (
          sources.map(source => (
            <div
              key={source.id}
              className={`bg-surface border rounded-xl p-4 transition-colors ${
                source.sospechosa
                  ? 'border-yellow-500/30'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">{source.tipo}</span>
                    {source.sospechosa && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <AlertTriangle size={11} />
                        Sospechosa
                      </span>
                    )}
                    {source.relevante && !source.sospechosa && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle size={11} />
                        Relevante
                      </span>
                    )}
                  </div>
                  
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-sm text-text-secondary hover:text-primary break-all transition-colors block"
                  >
                    {source.url}
                  </a>
                  {source.observacion && (
                    <p className="text-xs text-muted mt-1.5">{source.observacion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleValidacion(source)}
                    className="text-xs text-muted hover:text-yellow-400 transition-colors"
                  >
                    {source.sospechosa ? 'Quitar alerta' : 'Marcar sospechosa'}
                  </button>
                  <button
                    onClick={() => eliminarFuente(source.id)}
                    className="text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showEditModal && (
        <CaseFormModal
          casoInicial={caso}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); cargar() }}
        />
      )}

      {showSourceModal && (
        <SourceFormModal
          caseId={id}
          onClose={() => setShowSourceModal(false)}
          onSaved={() => { setShowSourceModal(false); cargar() }}
          urlsExistentes={sources.map(s => s.url)}
        />
      )}
    </div>
  )
}
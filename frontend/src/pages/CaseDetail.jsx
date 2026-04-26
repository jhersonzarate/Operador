import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { casesApi, sourcesApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import CaseFormModal from '../components/CaseFormModal'
import SourceFormModal from '../components/SourceFormModal'
import {
  ArrowLeft, ExternalLink, Plus, Trash2,
  AlertTriangle, CheckCircle, Pencil, AlertCircle, Link2
} from 'lucide-react'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caso, setCaso] = useState(null)
  const [sources, setSources] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [errorCarga, setErrorCarga] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    setErrorCarga(null)
    try {
      const [resCaso, resSources] = await Promise.all([
        casesApi.obtener(id),
        sourcesApi.listar(id),
      ])
      setCaso(resCaso.data)
      setSources(resSources.data)
    } catch {
      setErrorCarga('No se pudo cargar el caso.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const init = async () => {
      await cargar()
    }
    init()
  }, [cargar])

  const eliminarFuente = async (sourceId) => {
    if (!window.confirm('¿Eliminar esta fuente?')) return
    await sourcesApi.eliminar(id, sourceId).catch(console.error)
    cargar()
  }

  const toggleValidacion = async (source) => {
    await sourcesApi.validar(id, source.id, {
      sospechosa: !source.sospechosa,
      relevante: source.relevante,
    }).catch(console.error)
    cargar()
  }

  const abrirGoogle = () => {
    if (!caso) return
    const q = encodeURIComponent(`"${caso.nombreCompleto}" fraude ${caso.pais}`)
    window.open(`https://www.google.com/search?q=${q}`, '_blank')
  }

  if (loading) return <LoadingSkeleton onBack={() => navigate('/cases')} />

  if (errorCarga) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 px-4">
      <AlertCircle size={32} className="text-danger" />
      <p className="text-sm text-danger text-center">{errorCarga}</p>
      <button onClick={() => navigate('/cases')}
        className="text-sm text-muted hover:text-text transition-colors">
        ← Volver a casos
      </button>
    </div>
  )

  const fuentesSospechosas = sources.filter(s => s.sospechosa).length

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/cases')}
        className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Volver a casos
      </button>

      {/* Case header card */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted">#{caso.id}</span>
              <StatusBadge estado={caso.estado} />
              {fuentesSospechosas > 0 && (
                <span className="flex items-center gap-1 text-xs text-warning bg-warning/10 border border-warning/20 rounded-full px-2 py-0.5">
                  <AlertTriangle size={10} />
                  {fuentesSospechosas} sospechosa{fuentesSospechosas > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-text leading-tight">{caso.nombreCompleto}</h1>
            <p className="text-sm text-muted mt-1">{caso.pais}</p>

            {/* Meta info row */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border/50">
              <MetaItem label="Asignado a" value={caso.asignadoA || 'Sin asignar'} />
              <MetaItem label="Creado" value={caso.createdAt ? new Date(caso.createdAt).toLocaleDateString('es-PE') : '—'} />
              <MetaItem label="Fuentes" value={`${sources.length}`}
                valueClass={sources.length < 2 ? 'text-warning' : 'text-success'} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-secondary hover:text-text hover:border-border-light transition-all"
            >
              <Pencil size={13} />
              Editar
            </button>
            <button
              onClick={abrirGoogle}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-medium transition-all"
            >
              <ExternalLink size={13} />
              <span className="hidden xs:inline">Buscar en </span>Google
            </button>
          </div>
        </div>

        {/* Sources warning */}
        {sources.length < 2 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2.5">
            <AlertTriangle size={13} className="shrink-0" />
            <span>Se requieren al menos <strong>2 fuentes</strong> para poder completar este caso.</span>
          </div>
        )}
      </div>

      {/* Sources section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-text flex items-center gap-2">
              <Link2 size={14} className="text-primary" />
              Fuentes registradas
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {sources.length} fuente{sources.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowSource(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-semibold transition-all shadow-glow-sm"
          >
            <Plus size={13} />
            <span className="hidden xs:inline">Agregar</span> fuente
          </button>
        </div>

        {/* Sources list */}
        <div className="space-y-2.5">
          {sources.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl px-5 py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-dim mx-auto flex items-center justify-center">
                <Link2 size={18} className="text-primary" />
              </div>
              <p className="text-sm text-muted">Sin fuentes registradas aún</p>
              <button
                onClick={() => setShowSource(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-primary hover:bg-primary-hover rounded-lg text-white transition-all"
              >
                <Plus size={12} />
                Agregar primera fuente
              </button>
            </div>
          ) : (
            sources.map(source => (
              <SourceCard
                key={source.id}
                source={source}
                onToggle={() => toggleValidacion(source)}
                onDelete={() => eliminarFuente(source.id)}
              />
            ))
          )}
        </div>
      </div>

      {showEdit && (
        <CaseFormModal
          casoInicial={caso}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); cargar() }}
        />
      )}
      {showSource && (
        <SourceFormModal
          caseId={id}
          onClose={() => setShowSource(false)}
          onSaved={() => { setShowSource(false); cargar() }}
          urlsExistentes={sources.map(s => s.url)}
        />
      )}
    </div>
  )
}

function SourceCard({ source, onToggle, onDelete }) {
  return (
    <div className={`bg-surface border rounded-xl p-4 transition-colors ${
      source.sospechosa ? 'border-warning/30 bg-warning/5' : 'border-border'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Type + flags */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold text-primary bg-primary-dim border border-primary/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
              {source.tipo}
            </span>
            {source.sospechosa && (
              <span className="flex items-center gap-1 text-[10px] text-warning font-medium">
                <AlertTriangle size={10} />
                Sospechosa
              </span>
            )}
            {source.relevante && !source.sospechosa && (
              <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                <CheckCircle size={10} />
                Relevante
              </span>
            )}
          </div>

          {/* URL */}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-sm text-text-secondary hover:text-primary transition-colors break-all line-clamp-2 sm:line-clamp-1 leading-relaxed"
          >
            {source.url}
          </a>

          {source.observacion && (
            <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">{source.observacion}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end">
          <button
            onClick={onToggle}
            className={`text-[11px] font-medium transition-colors whitespace-nowrap px-2 py-1 rounded-md
              ${source.sospechosa
                ? 'text-muted hover:text-text bg-border/40'
                : 'text-warning hover:text-warning/80 bg-warning/10'
              }`}
          >
            {source.sospechosa ? 'Quitar alerta' : '⚠ Marcar'}
          </button>
          <button
            onClick={onDelete}
            className="text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-danger/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function MetaItem({ label, value, valueClass = 'text-text-secondary' }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted">{label}:</span>
      <span className={`text-[11px] font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-5 w-24 shimmer rounded" />
      <div className="h-36 shimmer rounded-xl" />
      <div className="h-64 shimmer rounded-xl" />
    </div>
  )
}
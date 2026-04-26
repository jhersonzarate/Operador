import { useState } from 'react'
import { sourcesApi } from '../services/api'
import { X, AlertTriangle, ExternalLink } from 'lucide-react'

const TIPOS = ['NOTICIAS', 'JUDICIAL', 'REGULATORIO', 'REDES_SOCIALES', 'OTRO']

const TIPO_LABELS = {
  NOTICIAS: 'Noticias',
  JUDICIAL: 'Judicial',
  REGULATORIO: 'Regulatorio',
  REDES_SOCIALES: 'Redes Sociales',
  OTRO: 'Otro',
}

const TIPO_COLORS = {
  NOTICIAS: 'bg-accent/20 text-accent border-accent/30',
  JUDICIAL: 'bg-danger/20 text-danger border-danger/30',
  REGULATORIO: 'bg-primary/20 text-primary border-primary/30',
  REDES_SOCIALES: 'bg-warning/20 text-warning border-warning/30',
  OTRO: 'bg-border text-muted border-border-light',
}

export default function SourceFormModal({ caseId, onClose, onSaved, urlsExistentes = [] }) {
  const [form, setForm] = useState({
    url: '',
    tipo: '',
    observacion: '',
    sospechosa: false,
    relevante: true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const validar = () => {
    const url = form.url.trim()
    if (!url) return 'La URL es obligatoria'
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'La URL debe comenzar con http:// o https://'
    }
    if (!form.tipo) return 'El tipo de fuente es obligatorio'
    if (urlsExistentes.includes(url)) {
      return 'Esta URL ya fue registrada en este caso'
    }
    return null
  }

  const handleSubmit = async () => {
    const errValidacion = validar()
    if (errValidacion) {
      setError(errValidacion)
      return
    }
    setLoading(true)
    try {
      await sourcesApi.registrar(caseId, { ...form, url: form.url.trim() })
      onSaved()
    } catch (e) {
      const msg =
        e.response?.data?.campos
          ? Object.values(e.response.data.campos).join(' — ')
          : e.response?.data?.error || 'Error al registrar la fuente'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Try to detect URL for preview
  const urlValid = form.url.startsWith('http://') || form.url.startsWith('https://')

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div
        className="
          bg-surface border border-border
          w-full sm:max-w-md
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl overflow-hidden
        "
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="p-5 sm:p-6">
          {/* Drag handle — mobile */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-border-light" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-text">Registrar fuente</h2>
              <p className="text-xs text-muted mt-0.5">Agrega evidencia al caso investigado</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-border transition-all"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {/* URL input */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                URL de la fuente <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  autoFocus
                  value={form.url}
                  onChange={e => handleChange('url', e.target.value)}
                  placeholder="https://ejemplo.com/articulo-relevante"
                  className="
                    w-full bg-background border border-border rounded-xl
                    px-3.5 py-3 pr-10 text-sm text-text placeholder-muted
                    outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                    transition-all duration-150
                  "
                />
                {urlValid && (
                  <a
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    title="Abrir URL"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Tipo — pill selector */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                Tipo de fuente <span className="text-danger">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TIPOS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleChange('tipo', t)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                      ${form.tipo === t
                        ? TIPO_COLORS[t]
                        : 'bg-background border-border text-muted hover:text-text-secondary hover:border-border-light'
                      }
                    `}
                  >
                    {TIPO_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Observación */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                Observación <span className="text-muted font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.observacion}
                onChange={e => handleChange('observacion', e.target.value)}
                placeholder="Contexto adicional sobre esta fuente, por qué es relevante..."
                rows={3}
                className="
                  w-full bg-background border border-border rounded-xl
                  px-3.5 py-3 text-sm text-text placeholder-muted
                  outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                  transition-all duration-150 resize-none leading-relaxed
                "
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col xs:flex-row gap-3 p-3.5 bg-background border border-border rounded-xl">
              <Toggle
                label="Fuente sospechosa"
                description="Contiene indicios de irregularidades"
                checked={form.sospechosa}
                onChange={v => handleChange('sospechosa', v)}
                activeColor="warning"
              />
              <div className="w-px bg-border hidden xs:block" />
              <Toggle
                label="Relevante"
                description="Aporta evidencia al caso"
                checked={form.relevante}
                onChange={v => handleChange('relevante', v)}
                activeColor="success"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl px-3.5 py-3">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="
                flex-1 px-4 py-3 text-sm font-medium
                bg-background border border-border rounded-xl
                text-text-secondary hover:text-text hover:border-border-light
                transition-all duration-150 disabled:opacity-50
              "
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="
                flex-1 px-4 py-3 text-sm font-semibold
                bg-primary hover:bg-primary-hover rounded-xl text-white
                transition-all duration-150 disabled:opacity-50
                shadow-glow-sm active:scale-[0.98]
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Registrando...
                </span>
              ) : 'Registrar fuente'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 640px) {
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  )
}

function Toggle({ label, description, checked, onChange, activeColor = 'primary' }) {
  const trackColors = {
    primary: 'bg-primary',
    warning: 'bg-warning',
    success: 'bg-success',
  }

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 flex-1 text-left group"
    >
      {/* Track */}
      <div className={`
        relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 border
        ${checked
          ? `${trackColors[activeColor]} border-transparent`
          : 'bg-border border-border-light'
        }
      `}>
        <div className={`
          absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}
        `} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-text-secondary group-hover:text-text transition-colors leading-none">
          {label}
        </p>
        <p className="text-[10px] text-muted mt-0.5 leading-tight">{description}</p>
      </div>
    </button>
  )
}
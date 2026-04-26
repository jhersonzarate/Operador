import { useState } from 'react'
import { casesApi } from '../services/api'
import { X, AlertTriangle, ChevronDown } from 'lucide-react'

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO']
const PAISES = [
  'Peru', 'Colombia', 'Chile', 'Argentina', 'Mexico',
  'Ecuador', 'Bolivia', 'Venezuela', 'Brasil', 'Uruguay', 'Otro'
]

const ESTADO_LABELS = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  COMPLETADO: 'Completado',
}

export default function CaseFormModal({ onClose, onSaved, casoInicial }) {
  const [form, setForm] = useState({
    nombreCompleto: casoInicial?.nombreCompleto || '',
    pais: casoInicial?.pais || '',
    estado: casoInicial?.estado || 'PENDIENTE',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async () => {
    if (!form.nombreCompleto.trim()) {
      setError('El nombre completo es obligatorio')
      return
    }
    if (!form.pais.trim()) {
      setError('El país es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (casoInicial) {
        await casesApi.actualizar(casoInicial.id, form)
      } else {
        await casesApi.crear(form)
      }
      onSaved()
    } catch (e) {
      const msg = e.response?.data?.error
        || (e.response?.data?.campos
          ? Object.values(e.response.data.campos).join(' — ')
          : 'Error al guardar el caso')
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

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      {/* Sheet on mobile (slides from bottom), centered modal on desktop */}
      <div
        className="
          bg-surface border border-border
          w-full sm:max-w-md
          rounded-t-2xl sm:rounded-2xl
          p-5 sm:p-6
          shadow-2xl
          animate-in
        "
        style={{
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border-light" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-text">
              {casoInicial ? 'Editar caso' : 'Nuevo caso'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {casoInicial ? 'Modifica los datos del caso' : 'Registra un nuevo caso de investigación'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-border transition-all"
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-5" />

        {/* Form fields */}
        <div className="space-y-4">
          {/* Nombre completo */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
              Nombre completo <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              value={form.nombreCompleto}
              onChange={e => handleChange('nombreCompleto', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Ej: Juan Carlos Pérez López"
              className="
                w-full bg-background border border-border rounded-xl
                px-3.5 py-3 text-sm text-text placeholder-muted
                outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                transition-all duration-150
              "
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
              País <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <select
                value={form.pais}
                onChange={e => handleChange('pais', e.target.value)}
                className="
                  w-full bg-background border border-border rounded-xl
                  px-3.5 py-3 text-sm text-text
                  outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                  transition-all duration-150 appearance-none cursor-pointer
                "
              >
                <option value="">Seleccionar país</option>
                {PAISES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
              Estado
            </label>
            {/* Segmented control look */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-background border border-border rounded-xl">
              {ESTADOS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => handleChange('estado', e)}
                  className={`
                    py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-150 leading-tight
                    ${form.estado === e
                      ? e === 'COMPLETADO'
                        ? 'bg-success/20 text-success border border-success/30'
                        : e === 'EN_PROCESO'
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'bg-warning/20 text-warning border border-warning/30'
                      : 'text-muted hover:text-text-secondary'
                    }
                  `}
                >
                  {ESTADO_LABELS[e]}
                </button>
              ))}
            </div>
            {form.estado === 'COMPLETADO' && (
              <div className="flex items-start gap-2 mt-2 text-xs text-warning">
                <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                <span>Se requieren al menos 2 fuentes registradas para completar un caso</span>
              </div>
            )}
          </div>

          {/* Error message */}
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
                Guardando...
              </span>
            ) : (casoInicial ? 'Guardar cambios' : 'Crear caso')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 640px) {
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 1; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </div>
  )
}
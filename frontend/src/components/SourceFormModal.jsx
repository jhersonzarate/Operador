import { useState } from 'react'
import { sourcesApi } from '../services/api'
import { X } from 'lucide-react'

const TIPOS = ['NOTICIAS', 'JUDICIAL', 'REGULATORIO', 'REDES_SOCIALES', 'OTRO']

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
    if (!form.url.trim()) return 'La URL es obligatoria'
    if (!form.url.startsWith('http://') && !form.url.startsWith('https://')) {
      return 'La URL debe comenzar con http:// o https://'
    }
    if (!form.tipo) return 'El tipo de fuente es obligatorio'
    if (urlsExistentes.includes(form.url.trim())) {
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

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-text">Registrar fuente</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              URL de la fuente
            </label>
            <input
              autoFocus
              value={form.url}
              onChange={e => handleChange('url', e.target.value)}
              placeholder="https://ejemplo.com/noticia"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Tipo de fuente
            </label>
            <select
              value={form.tipo}
              onChange={e => handleChange('tipo', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
            >
              <option value="">Seleccionar tipo</option>
              {TIPOS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Observacion
            </label>
            <textarea
              value={form.observacion}
              onChange={e => handleChange('observacion', e.target.value)}
              placeholder="Contexto adicional sobre esta fuente..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.sospechosa}
                onChange={e => handleChange('sospechosa', e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              Marcar como sospechosa
            </label>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm bg-background border border-border rounded-lg text-text-secondary hover:text-text transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar fuente'}
          </button>
        </div>
      </div>
    </div>
  )
}
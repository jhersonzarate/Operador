import { useState } from 'react'
import { casesApi } from '../services/api'
import { X } from 'lucide-react'

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO']
const PAISES = ['Peru', 'Colombia', 'Chile', 'Argentina', 'Mexico', 'Ecuador', 'Bolivia', 'Otro']

export default function CaseFormModal({ onClose, onSaved, casoInicial }) {
  const [form, setForm] = useState({
    nombreCompleto: casoInicial?.nombreCompleto || '',
    pais: casoInicial?.pais || '',
    estado: casoInicial?.estado || 'PENDIENTE',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.nombreCompleto.trim() || !form.pais.trim()) {
      setError('Nombre y pais son obligatorios')
      return
    }
    setLoading(true)
    try {
      if (casoInicial) {
        await casesApi.actualizar(casoInicial.id, form)
      } else {
        await casesApi.crear(form)
      }
      onSaved()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-text">
            {casoInicial ? 'Editar caso' : 'Nuevo caso'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Nombre completo
            </label>
            <input
              value={form.nombreCompleto}
              onChange={e => setForm({ ...form, nombreCompleto: e.target.value })}
              placeholder="Ej: Juan Carlos Perez Lopez"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Pais</label>
            <select
              value={form.pais}
              onChange={e => setForm({ ...form, pais: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
            >
              <option value="">Seleccionar pais</option>
              {PAISES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Estado</label>
            <select
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
            >
              {ESTADOS.map(e => <option key={e}>{e}</option>)}
            </select>
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
            className="flex-1 px-4 py-2.5 text-sm bg-background border border-border rounded-lg text-text-secondary hover:text-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm bg-primary hover:bg-primary-hover rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar caso'}
          </button>
        </div>
      </div>
    </div>
  )
}
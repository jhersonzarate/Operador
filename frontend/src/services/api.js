import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje = error.response?.data?.error || 'Error de conexion con el servidor'
    console.error('[ComplyTools API]', mensaje)
    return Promise.reject(error)
  }
)

export const casesApi = {
  listar: () => api.get('/cases'),
  obtener: (id) => api.get(`/cases/${id}`),
  crear: (data) => api.post('/cases', data),
  actualizar: (id, data) => api.put(`/cases/${id}`, data),
  eliminar: (id) => api.delete(`/cases/${id}`),
  buscar: (q) => api.get('/cases/buscar', { params: { q } }),
  dashboard: () => api.get('/cases/dashboard'),
}

export const sourcesApi = {
  listar: (caseId) => api.get(`/cases/${caseId}/sources`),
  registrar: (caseId, data) => api.post(`/cases/${caseId}/sources`, data),
  validar: (caseId, sourceId, data) =>
    api.patch(`/cases/${caseId}/sources/${sourceId}/validacion`, data),
  eliminar: (caseId, sourceId) =>
    api.delete(`/cases/${caseId}/sources/${sourceId}`),
}

export const exportApi = {
  exportarCSV: () =>
    api.get('/export/cases/csv', { responseType: 'blob' }),
}
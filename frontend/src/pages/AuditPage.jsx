export default function AuditPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Auditoria</h1>
        <p className="text-sm text-muted mt-1">Historial de acciones del sistema</p>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-muted">
          El historial de auditoria se consulta desde el endpoint{' '}
          <code className="text-primary font-mono text-xs">/api/audit-logs</code>
        </p>
        <p className="text-xs text-muted mt-2">
          Cada accion (crear, editar, eliminar) queda registrada automaticamente en la base de datos.
        </p>
      </div>
    </div>
  )
}
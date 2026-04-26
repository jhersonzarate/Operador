import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  FolderSearch,
  ClipboardList,
  ShieldCheck,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cases', icon: FolderSearch, label: 'Casos' },
  { to: '/audit', icon: ClipboardList, label: 'Auditoría' },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.()
  }, [location.pathname])

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [open])

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          w-64 bg-surface border-r border-border
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Logo mark — replicate ComplyTools lightning bolt feel */}
            <div className="w-8 h-8 rounded-lg bg-primary-dim flex items-center justify-center glow-sm">
              <ShieldCheck size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-text text-sm leading-none tracking-wide">
                ComplyTools
              </p>
              <p className="text-xs text-muted mt-0.5">Assistant v1.0</p>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-muted hover:text-text transition-colors p-1 rounded-md hover:bg-border"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Decorative gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted uppercase tracking-widest">
            Navegación
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                 transition-all duration-150 relative overflow-hidden
                 ${isActive
                   ? 'bg-primary-dim text-primary border border-primary/20'
                   : 'text-text-secondary hover:bg-border/60 hover:text-text border border-transparent'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon
                    size={17}
                    className={isActive ? 'text-primary' : 'text-muted group-hover:text-text-secondary transition-colors'}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text truncate">Administrador</p>
              <p className="text-[10px] text-muted">Sistema activo</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-success shrink-0 ml-auto animate-pulse-slow" />
          </div>
        </div>
      </aside>
    </>
  )
}
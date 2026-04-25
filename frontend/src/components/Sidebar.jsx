import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderSearch,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cases', icon: FolderSearch, label: 'Casos' },
  { to: '/audit', icon: ClipboardList, label: 'Auditoria' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary" size={22} />
          <span className="font-semibold text-text text-sm tracking-wide">
            ComplyTools
          </span>
        </div>
        <p className="text-xs text-muted mt-0.5 ml-7">Assistant v1.0</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-border hover:text-text'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted">Operador: Admin</p>
      </div>
    </aside>
  )
}
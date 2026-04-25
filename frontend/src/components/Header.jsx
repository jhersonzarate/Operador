import { Bell, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-muted">
        <Search size={16} />
        <span className="text-sm">Sistema de Gestion de Listas Negativas</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-muted hover:text-text transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
          A
        </div>
      </div>
    </header>
  )
}
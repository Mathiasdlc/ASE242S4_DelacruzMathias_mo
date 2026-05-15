import { Sparkles, LogOut } from 'lucide-react'

export default function Navbar({ onLogout }) {
  return (
    <nav className="h-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 border-b-2 border-amber-400/20 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 left-64 right-0 z-40 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-lg">
          <Sparkles className="text-slate-950" size={24} />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Altavista Rooftop</h1>
          <p className="text-slate-400 text-xs">Dashboard Moderno</p>
        </div>
      </div>

      {/* Logout Button */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      )}
    </nav>
  )
}

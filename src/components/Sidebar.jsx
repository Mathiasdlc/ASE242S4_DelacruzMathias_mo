import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Package, Table2, Calendar, ShoppingCart } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Clientes' },
    { path: '/products', icon: Package, label: 'Productos' },
    { path: '/table-spots', icon: Table2, label: 'Mesas' },
    { path: '/reservations', icon: Calendar, label: 'Reservas' },
    { path: '/orders', icon: ShoppingCart, label: 'Órdenes' },
  ]

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-slate-950 to-slate-900 border-r-2 border-amber-400/20 fixed left-0 top-0 overflow-y-auto shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
            <span className="text-slate-950 font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent font-bold text-lg">ALTAVISTA</h1>
            <p className="text-slate-400 text-xs">Rooftop Bar</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all transform ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold scale-105 shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-amber-400 hover:scale-105'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/50">
        <p className="text-slate-500 text-xs text-center font-medium">
          © 2026 Altavista Rooftop
        </p>
      </div>
    </aside>
  )
}

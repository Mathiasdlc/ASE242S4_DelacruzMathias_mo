import { useEffect, useState } from 'react'
import { Users, Package, Table2, Calendar } from 'lucide-react'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    availableTables: 0,
    activeReservations: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [customersRes, productsRes, tablesRes, reservationsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
        api.get('/table-spots'),
        api.get('/reservations'),
      ])

      setStats({
        totalCustomers: customersRes.data?.length || 0,
        totalProducts: productsRes.data?.length || 0,
        availableTables: productsRes.data?.filter(t => t.available)?.length || 0,
        activeReservations: reservationsRes.data?.filter(r => r.status === 'active')?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-yellow-600 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-4 rounded-lg ${color}`}>
          <Icon size={32} className="text-black" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
        <p className="text-gray-400">Monitor your Altavista Rooftop restaurant operations in real-time</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Customers"
          value={stats.totalCustomers}
          color="bg-blue-500"
        />
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats.totalProducts}
          color="bg-yellow-600"
        />
        <StatCard
          icon={Table2}
          title="Available Tables"
          value={stats.availableTables}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Active Reservations"
          value={stats.activeReservations}
          color="bg-purple-500"
        />
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-gradient-to-r from-gray-900 to-blue-900 rounded-lg p-8 border border-yellow-600">
        <h2 className="text-xl font-bold text-yellow-600 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
          <div>
            <p className="text-sm text-gray-400">Frontend Stack</p>
            <p className="font-semibold">React 19 + Vite + Tailwind</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Backend API</p>
            <p className="font-semibold">Spring Boot on :8081</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Database</p>
            <p className="font-semibold">MongoDB + WebFlux</p>
          </div>
        </div>
      </div>
    </div>
  )
}

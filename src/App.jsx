import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Products from './pages/Products'
import TableSpots from './pages/TableSpots'
import Reservations from './pages/Reservations'
import Orders from './pages/Orders'

export default function App() {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="ml-64 w-full">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="mt-16">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/table-spots" element={<TableSpots />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #fbbf24',
          },
        }}
      />
    </Router>
  )
}


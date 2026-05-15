import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Modal from '../components/Modal'

export default function Reservations() {
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [formData, setFormData] = useState({
    customer_id: '',
    table_id: '',
    reservation_date: '',
    reservation_time: '',
    guests_count: '',
    status: 'Pendiente',
  })

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    const filtered = reservations.filter(
      (res) =>
        res.customer_id?.toString().includes(searchTerm) ||
        res.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredReservations(filtered)
  }, [searchTerm, reservations])

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reservations')
      setReservations(response.data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
      toast.error('Error loading reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData({
      customer_id: '',
      table_id: '',
      reservation_date: '',
      reservation_time: '',
      guests_count: '',
      status: 'Pendiente',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (reservation) => {
    setModalMode('edit')
    setSelectedReservation(reservation)
    setFormData(reservation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReservation(null)
    setFormData({
      customer_id: '',
      table_id: '',
      reservation_date: '',
      reservation_time: '',
      guests_count: '',
      status: 'Pendiente',
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.customer_id || !formData.reservation_date || !formData.reservation_time) {
      toast.error('Customer, Date, and Time are required')
      return
    }

    try {
      if (modalMode === 'create') {
        await api.post('/reservations', formData)
        toast.success('Reservation created successfully')
      } else {
        await api.put(`/reservations/${selectedReservation._id}`, formData)
        toast.success('Reservation updated successfully')
      }
      handleCloseModal()
      fetchReservations()
    } catch (error) {
      console.error('Error saving reservation:', error)
      toast.error('Error saving reservation')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await api.delete(`/reservations/${id}`)
        toast.success('Reservation deleted (soft delete)')
        fetchReservations()
      } catch (error) {
        console.error('Error deleting reservation:', error)
        toast.error('Error deleting reservation')
      }
    }
  }

  const handleRestore = async (id) => {
    try {
      await api.patch(`/reservations/${id}/restore`)
      toast.success('Reservation restored')
      fetchReservations()
    } catch (error) {
      console.error('Error restoring reservation:', error)
      toast.error('Error restoring reservation')
    }
  }

  const isDeleted = (res) => res.deleted_at && !res.restored_at

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-900 text-green-200'
      case 'Pendiente':
        return 'bg-yellow-900 text-yellow-200'
      case 'Cancelado':
        return 'bg-red-900 text-red-200'
      default:
        return 'bg-gray-900 text-gray-200'
    }
  }

  const formatDateTime = (date, time) => {
    if (!date || !time) return '-'
    return `${new Date(date).toLocaleDateString()} at ${time}`
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Reservations</h1>

        {/* Controls */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-72 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600"
            />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-black rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            <Plus size={20} />
            New Reservation
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Customer ID</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Date & Time</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Guests</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Table ID</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Status</th>
              <th className="px-6 py-4 text-center text-yellow-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  No reservations found
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation) => (
                <tr
                  key={reservation._id}
                  className={`border-b border-gray-800 hover:bg-gray-900 transition-colors ${
                    isDeleted(reservation) ? 'opacity-50 bg-red-900 bg-opacity-10' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-white font-medium">{reservation.customer_id}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(reservation.reservation_date).toLocaleDateString()} at {reservation.reservation_time}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{reservation.guests_count} People</td>
                  <td className="px-6 py-4 text-gray-300">{reservation.table_id}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {isDeleted(reservation) ? (
                        <button
                          onClick={() => handleRestore(reservation._id)}
                          className="p-2 text-green-400 hover:bg-green-900 hover:bg-opacity-30 rounded transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(reservation)}
                            className="p-2 text-blue-400 hover:bg-blue-900 hover:bg-opacity-30 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="p-2 text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? 'New Reservation' : 'Edit Reservation'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer ID *
            </label>
            <input
              type="text"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Customer ObjectId"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Table ID
            </label>
            <input
              type="text"
              name="table_id"
              value={formData.table_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Table ObjectId"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
              <input
                type="date"
                name="reservation_date"
                value={formData.reservation_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
              <input
                type="time"
                name="reservation_time"
                value={formData.reservation_time}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              name="guests_count"
              value={formData.guests_count}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Number"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-600 text-black rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              {modalMode === 'create' ? 'Create' : 'Update'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

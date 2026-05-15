import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Modal from '../components/Modal'

export default function TableSpots() {
  const [tables, setTables] = useState([])
  const [filteredTables, setFilteredTables] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: '',
    location: '',
    is_available: true,
  })

  useEffect(() => {
    fetchTables()
  }, [])

  useEffect(() => {
    const filtered = tables.filter(
      (table) =>
        table.table_number?.toString().includes(searchTerm) ||
        table.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTables(filtered)
  }, [searchTerm, tables])

  const fetchTables = async () => {
    setLoading(true)
    try {
      const response = await api.get('/table-spots')
      setTables(response.data || [])
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast.error('Error loading tables')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData({ table_number: '', capacity: '', location: '', is_available: true })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (table) => {
    setModalMode('edit')
    setSelectedTable(table)
    setFormData(table)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTable(null)
    setFormData({ table_number: '', capacity: '', location: '', is_available: true })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.table_number || !formData.capacity) {
      toast.error('Table Number and Capacity are required')
      return
    }

    try {
      if (modalMode === 'create') {
        await api.post('/table-spots', formData)
        toast.success('Table created successfully')
      } else {
        await api.put(`/table-spots/${selectedTable._id}`, formData)
        toast.success('Table updated successfully')
      }
      handleCloseModal()
      fetchTables()
    } catch (error) {
      console.error('Error saving table:', error)
      toast.error('Error saving table')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await api.delete(`/table-spots/${id}`)
        toast.success('Table deleted (soft delete)')
        fetchTables()
      } catch (error) {
        console.error('Error deleting table:', error)
        toast.error('Error deleting table')
      }
    }
  }

  const handleRestore = async (id) => {
    try {
      await api.patch(`/table-spots/${id}/restore`)
      toast.success('Table restored')
      fetchTables()
    } catch (error) {
      console.error('Error restoring table:', error)
      toast.error('Error restoring table')
    }
  }

  const isDeleted = (table) => table.deleted_at && !table.restored_at

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Table Spots</h1>

        {/* Controls */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-72 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by table number or location..."
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
            Add Table
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-400 py-8">Loading...</div>
        ) : filteredTables.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            No tables found
          </div>
        ) : (
          filteredTables.map((table) => (
            <div
              key={table._id}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-yellow-600 transition-all ${
                isDeleted(table) ? 'opacity-50 border-red-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-yellow-600">
                    Table {table.table_number}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{table.location}</p>
                </div>
                <div className="flex gap-1">
                  {isDeleted(table) ? (
                    <button
                      onClick={() => handleRestore(table._id)}
                      className="p-2 text-green-400 hover:bg-green-900 hover:bg-opacity-30 rounded transition-colors"
                      title="Restore"
                    >
                      <RotateCcw size={18} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(table)}
                        className="p-2 text-blue-400 hover:bg-blue-900 hover:bg-opacity-30 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(table._id)}
                        className="p-2 text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-white font-semibold">{table.capacity} Seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  {table.is_available ? (
                    <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-900 text-red-200 rounded-full text-sm">
                      Occupied
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? 'Add New Table' : 'Edit Table'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Table Number *
            </label>
            <input
              type="number"
              name="table_number"
              value={formData.table_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="e.g., 1, 2, 3..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Number of seats"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="e.g., Window, Terrace, Main Hall"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleInputChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="is_available" className="text-sm text-gray-300 cursor-pointer">
              Available
            </label>
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

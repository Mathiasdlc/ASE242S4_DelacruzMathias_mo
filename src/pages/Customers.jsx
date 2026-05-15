import { useEffect, useState } from 'react'
import { Trash2, Edit2, Eye, Plus, Search, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Modal from '../components/Modal'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    client_type: 'V',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/customers')
      setCustomers(response.data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Error loading customers')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData({ first_name: '', last_name: '', email: '', phone: '', client_type: 'V' })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (customer) => {
    setModalMode('edit')
    setSelectedCustomer(customer)
    setFormData(customer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
    setFormData({ first_name: '', last_name: '', email: '', phone: '', client_type: 'V' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('First Name, Last Name and Email are required')
      return
    }

    try {
      if (modalMode === 'create') {
        await api.post('/customers', formData)
        toast.success('Customer created successfully')
      } else {
        await api.put(`/customers/${selectedCustomer._id}`, formData)
        toast.success('Customer updated successfully')
      }
      handleCloseModal()
      fetchCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Error saving customer')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`)
        toast.success('Customer deleted (soft delete)')
        fetchCustomers()
      } catch (error) {
        console.error('Error deleting customer:', error)
        toast.error('Error deleting customer')
      }
    }
  }

  const handleRestore = async (id) => {
    try {
      await api.patch(`/customers/${id}/restore`)
      toast.success('Customer restored')
      fetchCustomers()
    } catch (error) {
      console.error('Error restoring customer:', error)
      toast.error('Error restoring customer')
    }
  }

  const isDeleted = (customer) => customer.deleted_at && !customer.restored_at

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Customers</h1>

        {/* Controls */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-72 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
            Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Email</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Phone</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Type</th>
              <th className="px-6 py-4 text-center text-yellow-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className={`border-b border-gray-800 hover:bg-gray-900 transition-colors ${
                    isDeleted(customer) ? 'opacity-50 bg-red-900 bg-opacity-10' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-white">{customer.first_name} {customer.last_name}</td>
                  <td className="px-6 py-4 text-gray-300">{customer.email}</td>
                  <td className="px-6 py-4 text-gray-300">{customer.phone}</td>
                  <td className="px-6 py-4 text-gray-300">{customer.client_type}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {isDeleted(customer) ? (
                        <button
                          onClick={() => handleRestore(customer._id)}
                          className="p-2 text-green-400 hover:bg-green-900 hover:bg-opacity-30 rounded transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(customer)}
                            className="p-2 text-blue-400 hover:bg-blue-900 hover:bg-opacity-30 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
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
        title={modalMode === 'create' ? 'Add New Customer' : 'Edit Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Enter customer email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Client Type</label>
            <select
              name="client_type"
              value={formData.client_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
            >
              <option value="V">VIP</option>
              <option value="R">Regular</option>
              <option value="N">New</option>
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

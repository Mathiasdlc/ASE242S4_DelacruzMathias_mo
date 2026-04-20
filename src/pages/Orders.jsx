import { useEffect, useState } from 'react'
import { Plus, Search, Eye, Trash2, Edit2, X, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Modal from '../components/Modal'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [formData, setFormData] = useState({
    customer_id: '',
    total_amount: '',
    status: 'pending',
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.customer_id?.toString().includes(searchTerm) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOrders(filtered)
  }, [searchTerm, orders])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await api.get('/orders')
      setOrders(response.data || [])
      toast.success('Orders loaded')
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Error loading orders')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData({
      customer_id: '',
      total_amount: '',
      status: 'pending',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (order) => {
    setModalMode('edit')
    setSelectedOrder(order)
    setFormData(order)
    setIsModalOpen(true)
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
    setFormData({
      customer_id: '',
      total_amount: '',
      status: 'pending',
    })
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedOrder(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.total_amount) {
      toast.error('Total Amount is required')
      return
    }

    try {
      if (modalMode === 'create') {
        await api.post('/orders', formData)
        toast.success('Order created successfully')
      } else {
        await api.put(`/orders/${selectedOrder._id}`, formData)
        toast.success('Order updated successfully')
      }
      handleCloseModal()
      fetchOrders()
    } catch (error) {
      console.error('Error saving order:', error)
      toast.error('Error saving order')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${id}`)
        toast.success('Order deleted (soft delete)')
        fetchOrders()
      } catch (error) {
        console.error('Error deleting order:', error)
        toast.error('Error deleting order')
      }
    }
  }

  const handleRestore = async (id) => {
    try {
      await api.patch(`/orders/${id}/restore`)
      toast.success('Order restored')
      fetchOrders()
    } catch (error) {
      console.error('Error restoring order:', error)
      toast.error('Error restoring order')
    }
  }

  const isDeleted = (order) => order.deleted_at && !order.restored_at

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-200'
      case 'preparing':
        return 'bg-blue-900 text-blue-200'
      case 'ready':
        return 'bg-green-900 text-green-200'
      case 'completed':
        return 'bg-purple-900 text-purple-200'
      case 'cancelled':
        return 'bg-red-900 text-red-200'
      default:
        return 'bg-gray-900 text-gray-200'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Orders</h1>

        {/* Controls */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-72 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by customer ID or status..."
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
            New Order
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Customer ID</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Total Amount</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-yellow-600 font-semibold">Date / Time</th>
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
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className={`border-b border-gray-800 hover:bg-gray-900 transition-colors ${
                  isDeleted(order) ? 'opacity-50 bg-red-900 bg-opacity-10' : ''
                }`}>
                  <td className="px-6 py-4 text-white font-medium">
                    {order.customer_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-semibold">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {isDeleted(order) ? (
                        <button
                          onClick={() => handleRestore(order._id)}
                          className="p-2 text-green-400 hover:bg-green-900 hover:bg-opacity-30 rounded transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="p-2 text-gray-400 hover:bg-gray-900 hover:text-yellow-600 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(order)}
                            className="p-2 text-blue-400 hover:bg-blue-900 hover:bg-opacity-30 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
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

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title={`Order Details - ${selectedOrder?.customer_id}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Customer ID</p>
                <p className="text-white font-semibold">{selectedOrder.customer_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Date & Time</p>
              <p className="text-gray-300">{formatDate(selectedOrder.createdAt)}</p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-yellow-600 font-semibold">Total Amount:</span>
                <span className="text-yellow-400 text-xl font-bold">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseDetailsModal}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors mt-6"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? 'New Order' : 'Edit Order'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Customer ID</label>
            <input
              type="text"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="Enter customer ID (ObjectId)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Amount *
            </label>
            <input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleInputChange}
              step="0.01"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-600"
              placeholder="0.00"
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
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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

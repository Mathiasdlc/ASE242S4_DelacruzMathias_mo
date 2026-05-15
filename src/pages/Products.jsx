import { useEffect, useState } from 'react'
import { Trash2, Edit2, Plus, Search, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Modal from '../components/Modal'

export default function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  
  // Estados para confirmación y resultado
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: null, // 'delete', 'restore'
    productId: null,
    productName: null,
  })
  
  const [resultModal, setResultModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    productName: '',
  })
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_available: true,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  // Definir isDeleted ANTES de usarla en useEffects
  const isDeleted = (product) => {
    // Verificar si el producto tiene deleted_at establecido
    const deletedAt = product.deleted_at || product.deletedAt
    const restoredAt = product.restored_at || product.restoredAt
    
    // Un producto está eliminado si:
    // 1. Tiene deleted_at con valor (no null/undefined)
    // 2. Y NO tiene restored_at (o es null/undefined)
    // Como fallback, también verificamos is_available
    const isDeletedByTimestamp = !!deletedAt && !restoredAt
    const isDeletedByAvailable = product.is_available === false
    
    const result = isDeletedByTimestamp || isDeletedByAvailable
    
    console.log(`📦 ${product.name}:`, {
      deleted_at: deletedAt,
      restored_at: restoredAt,
      is_available: product.is_available,
      isDeletedByTimestamp,
      isDeletedByAvailable,
      result
    })
    
    return result
  }

  useEffect(() => {
    let filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Aplicar filtro de estado
    if (statusFilter === 'active') {
      filtered = filtered.filter((product) => !isDeleted(product))
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((product) => isDeleted(product))
    }

    setFilteredProducts(filtered)
  }, [searchTerm, products, statusFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/products')
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  // Funciones para modales de confirmación y resultado
  const openConfirmationModal = (actionType, productId, productName) => {
    let title, message
    if (actionType === 'delete') {
      title = '¿Eliminar Producto?'
      message = `¿Estás seguro de que deseas eliminar "${productName}"?`
    } else if (actionType === 'restore') {
      title = '¿Restaurar Producto?'
      message = `¿Deseas restaurar "${productName}" a tu catálogo?`
    }
    
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      actionType,
      productId,
      productName,
    })
  }

  const showResultModal = (actionType, productName) => {
    let title, message
    if (actionType === 'delete') {
      title = '✓ Eliminado'
      message = `El producto "${productName}" ha sido desactivado.`
    } else if (actionType === 'restore') {
      title = '✓ Restaurado'
      message = `El producto "${productName}" ha sido restaurado exitosamente.`
    }
    
    setResultModal({
      isOpen: true,
      title,
      message,
      productName,
    })
  }

  const closeAllModals = () => {
    setConfirmationModal({ ...confirmationModal, isOpen: false })
    setResultModal({ ...resultModal, isOpen: false })
  }

  const executeConfirmedAction = async () => {
    const { actionType, productId, productName } = confirmationModal
    
    try {
      if (actionType === 'delete') {
        await api.patch(`/products/${productId}/eliminar`, {})
        setConfirmationModal({ ...confirmationModal, isOpen: false })
        showResultModal('delete', productName)
        setTimeout(() => {
          fetchProducts()
          closeAllModals()
        }, 2000)
      } else if (actionType === 'restore') {
        await api.patch(`/products/${productId}/restaurar`, {})
        setConfirmationModal({ ...confirmationModal, isOpen: false })
        showResultModal('restore', productName)
        setTimeout(() => {
          fetchProducts()
          closeAllModals()
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Error executing action:', error.message)
      toast.error('Error al ejecutar la acción: ' + error.message)
      setConfirmationModal({ ...confirmationModal, isOpen: false })
    }
  }

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData({ name: '', description: '', price: '', category: '', is_available: true })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (product) => {
    console.log('=== OPEN EDIT MODAL ===')
    console.log('Producto recibido:', product)
    console.log('Keys del producto:', Object.keys(product))
    console.log('_id:', product._id)
    console.log('id:', product.id)
    
    // Asegurar que tenemos el ID
    const productId = product._id || product.id
    if (!productId) {
      console.error('❌ NO HAY ID EN EL PRODUCTO')
      toast.error('Product ID not found')
      return
    }
    
    console.log('✅ ID encontrado:', productId)
    setModalMode('edit')
    setSelectedProduct({ ...product, _id: productId })
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      is_available: product.is_available !== undefined ? product.is_available : product.isAvailable,
      image_url: product.image_url || product.imageUrl,
      launch_date: product.launch_date || product.launchDate,
      prep_time: product.prep_time || product.prepTime,
      is_featured: product.is_featured !== undefined ? product.is_featured : product.isFeatured,
      nutritional_info: product.nutritional_info || product.nutritionalInfo,
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setFormData({ name: '', description: '', price: '', category: '', is_available: true })
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

    if (!formData.name || !formData.price) {
      toast.error('Name and Price are required')
      return
    }

    // Normalizar datos: convertir snake_case a camelCase para el backend
    const normalizedData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      isAvailable: formData.is_available !== undefined ? formData.is_available : true,
      imageUrl: formData.image_url || formData.imageUrl || null,
      launchDate: formData.launch_date || formData.launchDate || null,
      prepTime: formData.prep_time || formData.prepTime || null,
      isFeatured: formData.is_featured !== undefined ? formData.is_featured : false,
      nutritionalInfo: formData.nutritional_info || formData.nutritionalInfo || null,
    }

    console.log('=== SUBMIT ===', { modalMode, productId: selectedProduct?._id })
    console.log('JSON enviado:', JSON.stringify(normalizedData, null, 2))

    try {
      if (modalMode === 'create') {
        console.log('📝 Creando producto...')
        const response = await api.post('/products', normalizedData)
        console.log('✅ Respuesta:', response.status, response.data)
        toast.success('✓ Creado')
      } else {
        if (!selectedProduct._id) {
          console.error('❌ NO HAY ID. selectedProduct:', selectedProduct)
          toast.error('Error: No product ID found')
          return
        }
        console.log('🔄 Editando producto ID:', selectedProduct._id)
        console.log('📤 Enviando datos:', normalizedData)
        const response = await api.put(`/products/{selectedProduct._id}`, normalizedData)
        console.log('✅ Respuesta PUT:', response.status, response.data)
        toast.success('✓ Actualizado')
      }
      handleCloseModal()
      setTimeout(() => {
        fetchProducts()
      }, 500)
    } catch (error) {
      console.error('❌ Error:', error.message)
      console.error('Status:', error.response?.status)
      console.error('Data:', error.response?.data)
      toast.error('Error saving product: ' + error.message)
    }
  }

  const handleDelete = (id, productName) => {
    // Verificar que tenemos un ID válido
    if (!id || id === 'undefined') {
      console.error('❌ ID INVÁLIDO:', id)
      toast.error('Error: Product ID not found')
      return
    }
    
    openConfirmationModal('delete', id, productName)
  }

  const handleRestore = (id, productName) => {
    // Verificar que tenemos un ID válido
    if (!id || id === 'undefined') {
      console.error('❌ ID INVÁLIDO:', id)
      toast.error('Error: Product ID not found')
      return
    }
    
    openConfirmationModal('restore', id, productName)
  }

  const formatPrice = (price) => {
    return 'S/ ' + new Intl.NumberFormat('en-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header con gradiente */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-2">
          Productos
        </h1>
        <p className="text-slate-400 text-lg">Gestiona tu catálogo de productos</p>
      </div>

      {/* Controls Section */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-72 relative group">
            <Search className="absolute left-4 top-4 text-amber-400 group-focus-within:text-amber-300 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700 hover:border-slate-600 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all shadow-lg"
            />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={22} />
            Nuevo Producto
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
              statusFilter === 'active'
                ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            ✓ Activos
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
              statusFilter === 'inactive'
                ? 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            ✕ Inactivos
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl shadow-2xl border border-slate-700 bg-slate-800/50 backdrop-blur">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 border-b-2 border-slate-600">
              <th className="px-6 py-5 text-left text-amber-400 font-bold text-sm uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-5 text-left text-amber-400 font-bold text-sm uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-5 text-left text-amber-400 font-bold text-sm uppercase tracking-wider">Precio</th>
              <th className="px-6 py-5 text-left text-amber-400 font-bold text-sm uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-5 text-left text-amber-400 font-bold text-sm uppercase tracking-wider">Estado</th>
              <th className="px-6 py-5 text-center text-amber-400 font-bold text-sm uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-amber-400"></div>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-slate-400 text-lg">
                    <p className="font-semibold mb-2">Sin productos</p>
                    <p className="text-sm">No hay productos para mostrar en este filtro</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className={`border-b border-slate-700 hover:bg-slate-700/30 transition-all transform hover:scale-y-105 cursor-pointer ${
                    isDeleted(product) ? 'opacity-60 bg-red-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-white font-semibold">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-blue-100 rounded-full text-sm font-medium shadow-lg">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-amber-300 font-bold text-lg">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 text-slate-300 truncate max-w-xs text-sm">
                    {product.description}
                  </td>
                  <td className="px-6 py-4">
                    {product.is_available ? (
                      <span className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg inline-block">
                        ✓ Disponible
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-full text-xs font-bold shadow-lg inline-block">
                        ✕ No disponible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-3 justify-center">
                      {isDeleted(product) ? (
                        <button
                          onClick={() => {
                            const id = product._id || product.id
                            console.log('Click restore con ID:', id, 'Producto:', product)
                            handleRestore(id, product.name)
                          }}
                          className="p-2.5 text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/50 rounded-lg transition-all transform hover:scale-110 shadow-md"
                          title="Restaurar"
                        >
                          <RotateCcw size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2.5 text-blue-400 bg-blue-900/20 hover:bg-blue-900/50 rounded-lg transition-all transform hover:scale-110 shadow-md"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              const id = product._id || product.id
                              console.log('Click delete con ID:', id, 'Producto:', product)
                              handleDelete(id, product.name)
                            }}
                            className="p-2.5 text-red-400 bg-red-900/20 hover:bg-red-900/50 rounded-lg transition-all transform hover:scale-110 shadow-md"
                            title="Eliminar"
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
        title={modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-amber-400 mb-3">Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-400 rounded-lg text-white focus:outline-none transition-all shadow-md"
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-400 mb-3">Categoría</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-400 rounded-lg text-white focus:outline-none transition-all shadow-md"
              placeholder="p.ej. Bebida, Comida, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-400 mb-3">Precio *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-400 rounded-lg text-white focus:outline-none transition-all shadow-md"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-400 mb-3">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-400 rounded-lg text-white focus:outline-none transition-all shadow-md resize-none"
              placeholder="Describe tu producto..."
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleInputChange}
              className="w-5 h-5 cursor-pointer accent-amber-400"
            />
            <label htmlFor="is_available" className="text-sm text-slate-200 cursor-pointer font-medium">
              Disponible para venta
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              {modalMode === 'create' ? 'Crear Producto' : 'Actualizar'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all border border-slate-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-700 overflow-hidden animate-scaleIn">
            {/* Decorative top border */}
            <div className={`h-1 bg-gradient-to-r ${
              confirmationModal.actionType === 'delete' 
                ? 'from-red-500 via-rose-400 to-red-500' 
                : 'from-emerald-500 via-green-400 to-emerald-500'
            }`}></div>

            {/* Header con icono */}
            <div className="p-6 text-center">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 border-2 ${
                confirmationModal.actionType === 'delete'
                  ? 'bg-red-500/20 border-red-400'
                  : 'bg-emerald-500/20 border-emerald-400'
              }`}>
                <span className="text-2xl">
                  {confirmationModal.actionType === 'delete' ? '⚠️' : '🔄'}
                </span>
              </div>
              <h2 className={`text-2xl font-bold mb-1 ${
                confirmationModal.actionType === 'delete' 
                  ? 'text-red-300' 
                  : 'text-emerald-300'
              }`}>{confirmationModal.title}</h2>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className="text-slate-300 text-center text-sm mb-6 leading-relaxed">{confirmationModal.message}</p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={executeConfirmedAction}
                  className={`flex-1 px-4 py-3 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                    confirmationModal.actionType === 'delete'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                  }`}
                >
                  {confirmationModal.actionType === 'delete' ? 'Sí, Eliminar' : 'Sí, Restaurar'}
                </button>
                <button
                  onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all border border-slate-600 active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado */}
      {resultModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl shadow-2xl max-w-md w-full border border-emerald-400/20 overflow-hidden animate-scaleIn">
            {/* Decorative top border */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500"></div>

            {/* Checkmark animado */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 mb-6 animate-popIn">
                <svg className="w-10 h-10 text-white animate-scaleCheckmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-emerald-300 mb-2">{resultModal.title}</h2>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              <p className="text-slate-300 text-center text-lg mb-8 leading-relaxed">{resultModal.message}</p>

              {/* Loading indicator mejorado */}
              <div className="flex justify-center mb-6">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 border-r-emerald-300 animate-spin"></div>
                </div>
              </div>

              <p className="text-slate-400 text-center text-sm font-medium">Cerrando en unos momentos...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

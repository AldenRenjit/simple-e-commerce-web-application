import React, { useState, useEffect } from 'react';
import api from '../api/axios.ts';
import { Product, Category } from '../types.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import toast from 'react-hot-toast';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Layers,
  ArrowBigUpDash,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  RefreshCcw,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // CSV State
  const [csvContent, setCsvContent] = useState<string>('//# Example csv lines (product_id,stock_qty)\n1,100\n2,50\n3,85');

  // Modal State (Used for both Create and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form parameters
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_qty: '10',
    image_url: '',
    category_id: '',
    rating: '4.5'
  });

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      // Fetch unlimited/large pool list of products for admin panel management
      const prodResponse = await api.get('/products?limit=100');
      setProducts(prodResponse.data.products);

      const catResponse = await api.get('/categories');
      setCategories(catResponse.data);
    } catch (err) {
      toast.error('Failed to load catalog datasets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_qty: '10',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      category_id: categories[0]?.id.toString() || '',
      rating: '4.5'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (target: Product) => {
    setEditingProduct(target);
    setFormData({
      name: target.name,
      description: target.description || '',
      price: target.price.toString(),
      stock_qty: target.stock_qty.toString(),
      image_url: target.image_url,
      category_id: target.category_id?.toString() || '',
      rating: target.rating.toString()
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.image_url || !formData.category_id) {
      toast.error('Please specify Name, Price, Category and Image URL parameters.');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_qty: parseInt(formData.stock_qty),
      image_url: formData.image_url,
      category_id: parseInt(formData.category_id),
      rating: parseFloat(formData.rating)
    };

    try {
      if (editingProduct) {
        // UPDATE Product
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success(`"${formData.name}" has been updated successfully!`);
      } else {
        // CREATE Product
        await api.post('/products', payload);
        toast.success(`"${formData.name}" has been added successfully!`);
      }
      setIsModalOpen(false);
      fetchCatalogData();
    } catch (err: any) {
      toast.error(err.message || 'Action rejected on database.');
    }
  };

  // Soft-Delete (Toggle status)
  const handleToggleDeactivate = async (target: Product) => {
    try {
      const nextActive = !target.is_active;
      await api.put(`/products/${target.id}`, { is_active: nextActive });
      toast.success(
        nextActive 
          ? `Product "${target.name}" has been enabled.` 
          : `Soft-deleted "${target.name}". It is hidden from catalog grids.`,
        { duration: 4000 }
      );
      fetchCatalogData();
    } catch (err: any) {
      toast.error(err.message || 'Status edit failed.');
    }
  };

  // Bulk stock update action (Fulfill user request)
  const handleBulkStockSubmit = async () => {
    if (!csvContent.trim()) {
      toast.error('The CSV update editor is empty.');
      return;
    }

    try {
      // Parse multi-line CSV string manually to send clean rows to express backend
      const lines = csvContent.split('\n');
      const updatesList: { product_id: number; stock_qty: number }[] = [];

      for (const line of lines) {
        if (line.startsWith('//') || line.startsWith('#') || !line.trim()) {
          continue; // skip comment lines or empty rows
        }

        const parts = line.split(',');
        if (parts.length >= 2) {
          const prodId = parseInt(parts[0].trim());
          const newQty = parseInt(parts[1].trim());

          if (!isNaN(prodId) && !isNaN(newQty)) {
            updatesList.push({ product_id: prodId, stock_qty: newQty });
          }
        }
      }

      if (updatesList.length === 0) {
        toast.error('No valid lines detected in CSV area. Formatting rule: product_id,stock_qty');
        return;
      }

      await api.post('/products/bulk-stock-update', { updates: updatesList });
      toast.success(`Bulk stocked aligned! Replenished ${updatesList.length} rows successfully.`);
      fetchCatalogData();
    } catch (err: any) {
      toast.error(err.message || 'Bulk CSV upload was rejected.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening warehouse stock records..." fullPage={true} />;
  }

  return (
    <div className="bento-grid-container min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title layout bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-center gap-2">
              <Package className="w-7 h-7 text-indigo-650" />
              Products Management CRUD
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wide">
              Registered Sequelize entries: {products.length} devices/books
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:shadow-md active:scale-95 transition-all inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product Entry</span>
          </button>
        </div>

        {/* 2 columns split: Left Column 1-2 manages Bulk CSV, Right Column 3 is table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* BULK CSV REPLENISHMENT PANEL (Col 1) */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                <Upload className="w-4 h-4 text-indigo-650" />
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">Bulk Stock CSV Tool</h3>
              </div>

              <div id="csv-help-banner" className="bg-amber-50 text-amber-805 rounded-xl p-3 text-xs leading-relaxed space-y-1">
                <span className="font-bold flex items-center gap-1 uppercase text-[10px]">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  How CSV bulk works:
                </span>
                <p>Provide comma-separated product ID and corresponding stock values below, then hit deploy.</p>
              </div>

              {/* CSV Editor Area */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">CSV Plaintext Editor</label>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full h-40 bg-gray-50/80 border border-gray-100 rounded-xl p-3 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-gray-700"
                  placeholder="product_id,stock_qty"
                />
              </div>

              {/* CSV Deploy option */}
              <button
                onClick={handleBulkStockSubmit}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200"
              >
                <ArrowBigUpDash className="w-4.5 h-4.5" />
                <span>Deploy Stock Upgrades</span>
              </button>

            </div>

            {/* Quick database stats info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold text-slate-500 space-y-2">
              <span className="font-bold text-slate-900 text-[10px] uppercase block tracking-wider mb-2">Category Mappings</span>
              {categories.map(c => (
                <div key={c.id} className="flex justify-between items-center py-1">
                  <span className="text-slate-700 font-bold">{c.name}</span>
                  <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full font-mono text-[9px] text-slate-400">ID: {c.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCTS LIST TABLE (Col 2-4) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-450 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Item details</th>
                      <th className="py-4 px-6 text-center">Price</th>
                      <th className="py-4 px-6 text-center">Available Stock</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                    {products.map((item) => {
                      const isLowStock = item.stock_qty > 0 && item.stock_qty < 5;
                      const isOutOfStock = item.stock_qty <= 0;

                      return (
                        <tr key={item.id} className={`hover:bg-gray-50/30 ${!item.is_active ? 'opacity-55' : ''}`}>
                          
                          {/* ID */}
                          <td className="py-4 px-6 font-mono text-xs text-gray-400">
                            #{item.id}
                          </td>

                          {/* Details & Image */}
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3 max-w-sm">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-lg bg-gray-50"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="block font-bold text-gray-900 leading-snug line-clamp-1">{item.name}</span>
                                {item.category && (
                                  <span className="inline-block mt-0.5 bg-indigo-50 text-indigo-705 text-[8px] font-extrabold uppercase px-1.5 rounded-sm">
                                    {item.category.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-6 text-center font-sans font-extrabold text-gray-950">
                            ${parseFloat(item.price as string).toFixed(2)}
                          </td>

                          {/* Stock status indicator */}
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block font-bold text-sm px-2 py-1 rounded-lg ${
                              isOutOfStock 
                                ? 'bg-rose-50 text-rose-700' 
                                : isLowStock 
                                ? 'bg-amber-50 text-amber-700 animate-pulse' 
                                : 'text-gray-800'
                            }`}>
                              {item.stock_qty} units
                            </span>
                          </td>

                          {/* Activation toggle visual label */}
                          <td className="py-4 px-6 text-center">
                            {item.is_active ? (
                              <span className="text-emerald-600 border border-emerald-100/50 bg-emerald-50 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="text-rose-600 border border-rose-100 bg-rose-50 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                                Hidden (Soft Deleted)
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="inline-flex space-x-1.5">
                              
                              {/* Edit Modal selector */}
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-gray-550 rounded-lg border border-gray-150 transition-colors"
                                title="Edit Product Settings"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Toggle activation action soft-delete */}
                              <button
                                onClick={() => handleToggleDeactivate(item)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  item.is_active
                                    ? 'hover:bg-rose-50 text-rose-500 border-rose-100'
                                    : 'hover:bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}
                                title={item.is_active ? "Soft Delete (Hide from grid)" : "Restore catalog visibility"}
                              >
                                {item.is_active ? <ToggleLeft className="w-4.5 h-4.5" /> : <ToggleRight className="w-4.5 h-4.5" />}
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. COMPREHENSIVE CREATE/EDIT DIALOG BOX */}
      {isModalOpen && (
        <div id="product-crud-modal" className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-indigo-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-300" />
                <h3 className="font-extrabold text-sm md:text-base tracking-wide uppercase">
                  {editingProduct ? `Edit product specifications` : `Add new product entry`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Product name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Product Display Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Tactile Mechanical Keyboard v2"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all font-semibold text-gray-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Detailed Description</label>
                <textarea
                  name="description"
                  placeholder="Premium specifications details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full h-20 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all text-gray-650"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    placeholder="89.95"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all font-semibold font-sans text-gray-800"
                  />
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Initial Stock quantity</label>
                  <input
                    type="number"
                    name="stock_qty"
                    required
                    placeholder="25"
                    value={formData.stock_qty}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all font-bold font-sans text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Mapping Category</label>
                  <select
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                  >
                    {!formData.category_id && <option value="">Map category...</option>}
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Score */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Initial Rating score</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    name="rating"
                    placeholder="4.5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              {/* image_url selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Image Thumbnail URL</label>
                <input
                  type="text"
                  name="image_url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all text-xs font-mono text-gray-505"
                />
              </div>

              {/* Actions footer inside modal */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-150 text-gray-650 font-semibold py-2.5 rounded-xl text-xs text-center border border-gray-200 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingProduct ? 'Commit Changes' : 'Register Entry'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProductsPage;

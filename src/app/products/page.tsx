'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Image as ImageIcon, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit_type: string;
  pieces_per_pack: number | null;
  is_active: boolean;
  baker: string;
  image_url: string | null;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit_type: 'pack',
    pieces_per_pack: '',
    baker: '',
    image_url: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to sanitize product name for filename
  const sanitizeFileName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, '')       // Remove leading/trailing dashes
      .substring(0, 50);             // Limit length
  };

  // Helper to extract filename from Supabase URL
  const getFileNameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('Categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;

    try {
      const { error } = await supabase
        .from('Categories')
        .insert([{ name: newCategoryName.trim() }]);

      if (error) throw error;
      setNewCategoryName('');
      await fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. It may already exist.');
    }
  }

  async function handleDeleteCategory(category: Category) {
    // Check if any products use this category
    const productsInCategory = products.filter(p => p.category === category.name);
    if (productsInCategory.length > 0) {
      alert(`Cannot delete "${category.name}" - ${productsInCategory.length} product(s) are using it.`);
      return;
    }

    if (!confirm(`Delete category "${category.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('Categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  }

  function filterProducts() {
    let filtered = products;

    if (selectedCategory === '__inactive__') {
      filtered = filtered.filter(p => !p.is_active);
    } else if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory && p.is_active);
    } else {
      // "All Categories" - only show active products
      filtered = filtered.filter(p => p.is_active);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }

  function openAddModal() {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories.length > 0 ? categories[0].name : '',
      price: '',
      unit_type: 'pack',
      pieces_per_pack: '',
      baker: '',
      image_url: ''
    });
    setPreviewImage(null);
    setOriginalImageUrl(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit_type: product.unit_type,
      pieces_per_pack: product.pieces_per_pack?.toString() || '',
      baker: product.baker || '',
      image_url: product.image_url || ''
    });
    setPreviewImage(product.image_url);
    setOriginalImageUrl(product.image_url);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
    setPreviewImage(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create filename based on product name or timestamp
      const fileExt = file.name.split('.').pop();
      const baseName = formData.name ? sanitizeFileName(formData.name) : `product-${Date.now()}`;
      const fileName = `${baseName}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      setPreviewImage(urlData.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        unit_type: formData.unit_type,
        pieces_per_pack: formData.pieces_per_pack ? parseInt(formData.pieces_per_pack) : null,
        baker: formData.baker || null,
        image_url: formData.image_url || null,
        is_active: true
      };

      if (editingProduct) {
        // Delete old image if a new one was uploaded
        if (originalImageUrl && formData.image_url && originalImageUrl !== formData.image_url) {
          const oldFileName = getFileNameFromUrl(originalImageUrl);
          await supabase.storage.from('products').remove([oldFileName]);
        }

        // Update existing product
        const { error } = await supabase
          .from('Products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('Products')
          .insert([productData]);

        if (error) throw error;
      }

      await fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleActive(product: Product) {
    try {
      const { error } = await supabase
        .from('Products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      alert('Failed to update product');
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('Products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  }

  return (
    <AppLayout title="Products">
      <div className="min-h-full">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#FFF8F5] pb-4 pt-6 px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Management</h1>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#A9DFBF] text-white font-medium rounded-lg hover:bg-[#82C3A3] transition-colors"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF] focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
              <option value="__inactive__">Inactive Products</option>
            </select>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Manage Categories"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <main className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden ${!product.is_active ? 'opacity-60' : ''}`}
              >
                {/* Product Image */}
                <div className="relative h-40 bg-gray-100">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-xs mt-1">Image coming soon</span>
                    </div>
                  )}
                  {!product.is_active && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                      Inactive
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 text-xs font-medium rounded text-gray-600">
                    {product.category}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-[#82C3A3]">₱{product.price}</span>
                    <span className="text-sm text-gray-500">
                      {product.pieces_per_pack ? `${product.pieces_per_pack}pcs` : product.unit_type}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        product.is_active
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {product.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </main>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Preview"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ImageIcon size={32} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <Upload size={16} />
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/WebP</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF]"
                    placeholder="e.g., Chocolate Chip Cookies (12pcs)"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF] bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price & Unit Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF]"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type *</label>
                    <select
                      value={formData.unit_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_type: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF] bg-white"
                    >
                      <option value="pack">Pack</option>
                      <option value="piece">Piece</option>
                      <option value="box">Box</option>
                      <option value="dozen">Dozen</option>
                    </select>
                  </div>
                </div>

                {/* Pieces per Pack & Baker */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pieces per Pack</label>
                    <input
                      type="number"
                      value={formData.pieces_per_pack}
                      onChange={(e) => setFormData(prev => ({ ...prev, pieces_per_pack: e.target.value }))}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF]"
                      placeholder="e.g., 12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Baker</label>
                    <input
                      type="text"
                      value={formData.baker}
                      onChange={(e) => setFormData(prev => ({ ...prev, baker: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF]"
                      placeholder="e.g., Mom, Sister"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#A9DFBF] text-white font-semibold rounded-lg hover:bg-[#82C3A3] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Manage Categories</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {/* Add new category */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9DFBF]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-[#A9DFBF] text-white rounded-lg hover:bg-[#82C3A3] transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Category list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map(cat => {
                    const count = products.filter(p => p.category === cat.name).length;
                    return (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-800">{cat.name}</span>
                          <span className="ml-2 text-sm text-gray-500">({count} products)</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title={count > 0 ? 'Cannot delete - has products' : 'Delete category'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

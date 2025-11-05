'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit_type: string;
  pieces_per_pack: number | null;
  is_active: boolean;
};

type CategoryProducts = {
  [category: string]: Product[];
};

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  // Group products by category
  const productsByCategory: CategoryProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as CategoryProducts);

  const categories = Object.keys(productsByCategory).sort();

  function formatPrice(price: number): string {
    return `₱${price.toFixed(2)}`;
  }

  return (
    <AppLayout title="Menu">
      <div className="min-h-full">
        <main className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 hidden lg:block">Menu & Pricelist</h1>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Loading menu...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No products available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-2">
                    {category}
                  </h2>
                  <div className="space-y-1">
                    {productsByCategory[category].map(product => (
                      <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                          {product.unit_type === 'pack' && product.pieces_per_pack && (
                            <p className="text-xs text-gray-500">
                              {product.pieces_per_pack} pcs per pack
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-[#A9DFBF] text-base">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}

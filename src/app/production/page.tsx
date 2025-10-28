import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

// Force dynamic rendering to fetch fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FilterButton = ({ children, isActive = false }: { children: React.ReactNode, isActive?: boolean }) => (
  <button
    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
      isActive
        ? 'bg-[#A9DFBF] text-white'
        : 'bg-white text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

type ProductionItem = {
  name: string;
  quantity: number;
  value: number;
};

type ProductionData = {
  [category: string]: ProductionItem[];
};

async function getProductionData() {
  // Fetch order items from active orders (not completed) with product details
  const { data: orderItems, error } = await supabase
    .from('OrderItems')
    .select(`
      quantity,
      subtotal,
      product_id,
      Products (
        name,
        category
      ),
      Orders (
        is_completed
      )
    `);

  if (error) {
    console.error('Error fetching production data:', error);
    return {};
  }

  // Group by category and product, summing quantities
  const grouped: ProductionData = {};

  orderItems?.forEach((item: any) => {
    // Only include active orders (not completed)
    if (item.Orders?.is_completed) return;

    const category = item.Products?.category || 'Others';
    const productName = item.Products?.name || 'Unknown';

    if (!grouped[category]) {
      grouped[category] = [];
    }

    // Find existing product entry or create new one
    const existingProduct = grouped[category].find(p => p.name === productName);
    if (existingProduct) {
      existingProduct.quantity += item.quantity;
      existingProduct.value += Number(item.subtotal);
    } else {
      grouped[category].push({
        name: productName,
        quantity: item.quantity,
        value: Number(item.subtotal)
      });
    }
  });

  // Sort products within each category by name
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

export default async function ProductionPage() {
  const productionData = await getProductionData();
  const categories = Object.keys(productionData).sort();

  return (
    <AppLayout>
      <div className="min-h-full">
        <main className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Production View</h1>
        {/* Filters */}
        <div className="mb-6 bg-white p-3 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Filter orders by status:</p>
          <div className="flex flex-wrap gap-2">
            <FilterButton isActive>Active</FilterButton>
            <FilterButton>Completed</FilterButton>
            <FilterButton>Unpaid</FilterButton>
            <FilterButton>All Orders</FilterButton>
          </div>
        </div>

        {/* Product List */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active orders to display</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category} className="bg-white p-5 rounded-2xl shadow-md">
                <h2 className="text-lg font-bold text-gray-500 tracking-wider uppercase mb-4">
                  {category}
                </h2>
                <div className="space-y-3">
                  {productionData[category].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <p className="font-semibold text-gray-700">{item.name}</p>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{item.quantity} qty</p>
                        <p className="text-sm text-gray-500">₱{item.value.toFixed(2)}</p>
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

import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

// Force dynamic rendering to fetch fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// A re-usable component for the metric cards on the sales dashboard
const MetricCard = ({ title, value, colorClass }: { title: string; value: string; colorClass: string; }) => (
    <div className="bg-white p-5 rounded-2xl shadow-md">
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

// A re-usable component for the filter buttons
const FilterButton = ({ children, isActive = false }: { children: React.ReactNode, isActive?: boolean }) => (
    <button
        className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors flex-grow text-center ${
            isActive
                ? 'bg-[#C8E6C9] text-green-900' // A slightly different green to match mockup
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
    >
        {children}
    </button>
);

async function getSalesMetrics() {
    const { data: orders, error } = await supabase
        .from('Orders')
        .select('total_amount, is_paid, order_date');

    if (error) {
        console.error('Error fetching orders:', error);
        return {
            todaysSales: 0,
            paidToday: 0,
            pendingPayment: 0,
            overallTotal: 0,
            overallPaid: 0
        };
    }

    const today = new Date().toISOString().split('T')[0];

    let todaysSales = 0;
    let paidToday = 0;
    let pendingPayment = 0;
    let overallTotal = 0;
    let overallPaid = 0;

    orders?.forEach(order => {
        const orderDate = new Date(order.order_date).toISOString().split('T')[0];
        const amount = Number(order.total_amount);

        // Overall metrics
        overallTotal += amount;
        if (order.is_paid) {
            overallPaid += amount;
        }

        // Today's metrics
        if (orderDate === today) {
            todaysSales += amount;
            if (order.is_paid) {
                paidToday += amount;
            } else {
                pendingPayment += amount;
            }
        }
    });

    return {
        todaysSales,
        paidToday,
        pendingPayment,
        overallTotal,
        overallPaid
    };
}

export default async function SalesDashboardPage() {
    const metrics = await getSalesMetrics();

    return (
        <AppLayout>
            <div className="min-h-full">
                <main className="p-4 md:p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales Dashboard</h1>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <MetricCard
                        title="Today's Sales"
                        value={`₱${metrics.todaysSales.toFixed(2)}`}
                        colorClass="text-[#F5B7B1]"
                    />
                    <MetricCard
                        title="Paid Today"
                        value={`₱${metrics.paidToday.toFixed(2)}`}
                        colorClass="text-[#A9DFBF]"
                    />
                    <MetricCard
                        title="Pending Payment"
                        value={`₱${metrics.pendingPayment.toFixed(2)}`}
                        colorClass="text-orange-400"
                    />
                    <MetricCard
                        title="Overall Total Sales"
                        value={`₱${metrics.overallTotal.toFixed(2)}`}
                        colorClass="text-gray-800"
                    />
                    <MetricCard
                        title="Overall Paid Sales"
                        value={`₱${metrics.overallPaid.toFixed(2)}`}
                        colorClass="text-gray-800"
                    />
                </div>

                {/* Filters */}
                <div className="space-y-4 mb-6">
                    <div className="flex gap-2">
                        <FilterButton isActive>Today</FilterButton>
                        <FilterButton>This Week</FilterButton>
                        <FilterButton>This Month</FilterButton>
                        <FilterButton>All Time</FilterButton>
                    </div>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700">
                        <option>All Payment Status</option>
                        <option>Paid Only</option>
                        <option>Unpaid Only</option>
                    </select>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700">
                        <option>All Completion Status</option>
                        <option>Active Only</option>
                        <option>Completed Only</option>
                    </select>
                </div>

                {/* Sales Trend Chart */}
                <div className="bg-white p-5 rounded-2xl shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Sales Trend</h2>
                        <span className="text-sm font-semibold text-gray-600">This Week</span>
                    </div>
                    <div className="h-48 flex flex-col items-center justify-center text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                        </svg>
                        <p>Chart data will be displayed here</p>
                    </div>
                </div>
                </main>
            </div>
        </AppLayout>
    );
}

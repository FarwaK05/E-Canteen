import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, ChevronRight, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderController } from '../../controllers/OrderController';
import { OrderObserver } from '../../observers/OrderObserver';
import { getOrderState } from '../../states/OrderStates';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Order, OrderStatus } from '../../types';

const observer = new OrderObserver();

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Completed',
};

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const refresh = useCallback(async () => {
    const data = await OrderController.getAllOrders();
    setOrders(data);
  }, []);

useEffect(() => {
  refresh().then(() => setLoading(false));
  observer.subscribeAll(() => refresh());

  // ADD CURLY BRACES HERE
  return () => {
    observer.unsubscribe();
  };
}, [refresh]);

  const handleTransition = async (orderId: string, current: OrderStatus, next: OrderStatus) => {
    setProcessing(orderId);
    try {
      await OrderController.updateStatus(orderId, current, next);
      toast.success(`Updated to ${next.replace('_', ' ')}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.id.slice(-6).toUpperCase().includes(searchTerm.toUpperCase()) || 
                         (o as any).profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500">Filter and process customer orders</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name or #ID" 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {['all', 'pending_payment', 'payment_verification', 'confirmed', 'preparing', 'ready', 'completed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s.replace(/_/g, ' ')}
            <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">{orders.filter(o => o.status === s || s === 'all').length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
          No orders found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((order) => {
            const state = getOrderState(order.status);
            const primaryAction = ACTION_LABELS[order.status];
            const primaryNext = state.getAllowedTransitions().find(s => !['cancelled', 'pending_payment'].includes(s));

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-black text-emerald-700">#{order.id.slice(-6).toUpperCase()}</span>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">{(order as any).profiles?.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {order.order_items?.map(i => (
                          <span key={i.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            {i.quantity}x {i.food_items?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">Rs {order.total_price.toFixed(0)}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {order.screenshot_url && (
                        <a href={order.screenshot_url} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition" title="View Payment Receipt">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {order.status === 'payment_verification' && (
                        <>
                          <button 
                            onClick={() => handleTransition(order.id, order.status, 'pending_payment')}
                            className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition"
                          >Reject</button>
                          <button 
                            onClick={() => handleTransition(order.id, order.status, 'confirmed')}
                            className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
                          >Confirm Payment</button>
                        </>
                      )}

                      {primaryAction && primaryNext && (
                        <button
                          disabled={!!processing}
                          onClick={() => handleTransition(order.id, order.status, primaryNext as OrderStatus)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition disabled:opacity-50"
                        >
                          {processing === order.id ? '...' : primaryAction} <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
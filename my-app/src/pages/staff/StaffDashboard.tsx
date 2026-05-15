import { useEffect, useState, useCallback } from 'react';
import { Package, Clock, CheckCircle, AlertCircle, TrendingUp, Eye, Check, X, ChevronRight } from 'lucide-react';
import { OrderController } from '../../controllers/OrderController';
import { OrderObserver } from '../../observers/OrderObserver';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '../../types';

const observer = new OrderObserver();

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await OrderController.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

 useEffect(() => {
  refresh().then(() => setLoading(false));
  observer.subscribeAll(() => refresh());
  
  // ADD CURLY BRACES HERE
  return () => {
    observer.unsubscribe();
  };
}, [refresh]);

  const handleStatusUpdate = async (orderId: string, current: OrderStatus, next: OrderStatus) => {
    try {
      await OrderController.updateStatus(orderId, current, next);
      toast.success(`Order updated to ${next.replace('_', ' ')}`);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const stats = {
    pending: orders.filter((o) => o.status === 'pending_payment').length,
    verifying: orders.filter((o) => o.status === 'payment_verification').length,
    active: orders.filter((o) => ['confirmed', 'preparing', 'ready'].includes(o.status)).length,
    today: orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()).length,
  };

  const activeOrders = orders.filter((o) => 
    ['payment_verification', 'confirmed', 'preparing', 'ready'].includes(o.status)
  );

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time canteen operations</p>
        </div>
        <button onClick={refresh} className="text-sm text-emerald-600 font-medium hover:underline">Refresh List</button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Unpaid', value: stats.pending, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Verifying', value: stats.verifying, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'In Kitchen', value: stats.active, icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: "Today's Total", value: stats.today, icon: TrendingUp, color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Active Orders List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Incoming & Active Orders</h2>
          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">{activeOrders.length} Pending Actions</span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg">No orders need attention right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-black text-emerald-700">#{order.id.slice(-4).toUpperCase()}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-bold text-gray-900">Student:</span> {(order as any).profiles?.name} ({(order as any).profiles?.department})</p>
                      <p><span className="font-bold text-gray-900">Items:</span> {order.order_items?.map(i => `${i.quantity}x ${i.food_items?.name}`).join(', ')}</p>
                      {order.notes && <p className="italic text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">Note: {order.notes}</p>}
                    </div>
                  </div>

                  {/* Dynamic Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* ACTION 1: Verification Flow */}
                    {order.status === 'payment_verification' && (
                      <>
                        <button 
                          onClick={() => setSelectedScreenshot(order.screenshot_url)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-sm"
                        >
                          <Eye className="w-4 h-4" /> View Receipt
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'payment_verification', 'confirmed')}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition"
                          title="Approve Payment"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'payment_verification', 'pending_payment')}
                          className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
                          title="Reject Payment"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* ACTION 2: Kitchen Flow */}
                    {order.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'confirmed', 'preparing')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-md"
                      >
                        Start Preparing <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'preparing', 'ready')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md"
                      >
                        Mark as Ready <Check className="w-4 h-4" />
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'ready', 'completed')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-md"
                      >
                        Complete Order <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot Viewer Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedScreenshot(null)}>
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Payment Verification</h3>
              <button onClick={() => setSelectedScreenshot(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <img src={selectedScreenshot} alt="Payment Receipt" className="w-full rounded-2xl shadow-inner border" />
              <p className="mt-4 text-xs text-center text-gray-500 italic">Verify the transaction ID and amount match the order total.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
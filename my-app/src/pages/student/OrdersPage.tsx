import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package } from 'lucide-react';
import { OrderController } from '../../controllers/OrderController';
import { OrderObserver } from '../../observers/OrderObserver';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ORDER_STATUS_SEQUENCE } from '../../states/OrderStates';
import type { Order, OrderStatus } from '../../types';

const observer = new OrderObserver();

export default function OrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    if (!profile) return;
    const data = await OrderController.getOrdersForUser(profile.id);
    setOrders(data);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    refreshOrders().then(() => setLoading(false));

    // OBSERVER PATTERN — subscribe to realtime updates
    observer.subscribe(profile.id, () => refreshOrders());
    return () => observer.unsubscribe();
  }, [profile, refreshOrders]);

  const stepIndex = (status: OrderStatus) => ORDER_STATUS_SEQUENCE.indexOf(status);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No orders yet</p>
          <p className="text-sm mt-1">Head to the menu to place your first order</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <p className="font-bold text-gray-900">Rs {order.total_price.toFixed(0)}</p>
                </div>
              </div>

              {/* Progress tracker */}
              {order.status !== 'cancelled' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-gray-100">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${(stepIndex(order.status) / (ORDER_STATUS_SEQUENCE.length - 1)) * 100}%`,
                        }}
                      />
                    </div>
                    {ORDER_STATUS_SEQUENCE.map((step, idx) => (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-colors ${
                            idx <= stepIndex(order.status)
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'bg-white border-gray-200'
                          }`}
                        />
                        <span className="text-xs text-gray-400 hidden sm:block capitalize">
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items summary */}
              <div className="flex flex-wrap gap-2 mb-3">
                {order.order_items?.map((item) => (
                  <span key={item.id} className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-600">
                    {item.quantity}x {item.food_items?.name}
                  </span>
                ))}
              </div>

              {/* Upload CTA */}
              {order.status === 'pending_payment' && (
                <Link
                  to={`/orders/${order.id}/payment`}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  Upload Payment Screenshot
                </Link>
              )}

              {order.pickup_time && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pickup: {new Date(order.pickup_time).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

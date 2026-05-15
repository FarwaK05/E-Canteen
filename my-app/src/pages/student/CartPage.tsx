import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { OrderController } from '../../controllers/OrderController';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const minPickup = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16);

  const handlePlaceOrder = async () => {
    if (!profile) return;
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const order = await OrderController.createOrder(
        profile.id,
        items,
        new Date(pickupTime).toISOString(),
        notes
      );
      clearCart();
      toast.success('Order placed! Please upload payment screenshot.');
      navigate(`/orders/${order.id}/payment`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse the menu and add items to get started.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="space-y-3 mb-6">
        {items.map(({ food, quantity }) => (
          <div key={food.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <img
              src={food.image_url}
              alt={food.name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{food.name}</p>
              <p className="text-emerald-600 font-medium text-sm">Rs {food.price.toFixed(0)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(food.id, quantity - 1)}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-800">{quantity}</span>
              <button
                onClick={() => updateQuantity(food.id, quantity + 1)}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
            <div className="text-right w-20">
              <p className="font-bold text-gray-900 text-sm">Rs {(food.price * quantity).toFixed(0)}</p>
            </div>
            <button
              onClick={() => removeItem(food.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Order details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Order Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Time</label>
          <input
            type="datetime-local"
            min={minPickup}
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any dietary requirements or special requests..."
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{items.reduce((s, i) => s + i.quantity, 0)} items</p>
            <p className="text-2xl font-bold text-gray-900">Rs {total.toFixed(0)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

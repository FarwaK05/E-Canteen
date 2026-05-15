import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Clock, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuController } from '../../controllers/MenuController';
import { useCart } from '../../context/CartContext';
import type { FoodItem, FoodCategory } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const CATEGORY_LABELS: Record<FoodCategory | 'all', string> = {
  all: 'All',
  main_course: 'Main Course',
  fast_food: 'Fast Food',
  beverages: 'Beverages',
  desserts: 'Desserts',
  snacks: 'Snacks',
  other: 'Other',
};

export default function MenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'all'>('all');
  const { addItem, items: cartItems } = useCart();

  useEffect(() => {
    MenuController.getAvailable().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(items.map((i) => i.category))] as (FoodCategory | 'all')[];

  const isInCart = (id: string) => cartItems.some((i) => i.food.id === id);

  const handleAdd = (item: FoodItem) => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  if (loading) return <LoadingSpinner message="Loading menu..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Today's Menu</h1>
        <p className="text-gray-500 text-sm">{items.length} items available</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-44 overflow-hidden bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                  }}
                />
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-600 px-2 py-1 rounded-full">
                  {CATEGORY_LABELS[item.category as FoodCategory]}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-600">Rs {item.price.toFixed(0)}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {item.prep_time} min
                    </p>
                  </div>
                  <button
                    onClick={() => handleAdd(item)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isInCart(item.id)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isInCart(item.id) ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuController } from '../../controllers/MenuController.js';
import LoadingSpinner from '../../components/LoadingSpinner.js';
import type { FoodItem, FoodCategory } from '../../types';

const EMPTY_FORM = {
  name: '',
  category: 'main_course' as FoodCategory,
  price: '',
  prep_time: '10',
  image_url: '',
  description: '',
  availability: true,
};

export default function StaffMenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => MenuController.getAll().then((d) => { setItems(d); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: FoodItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      prep_time: item.prep_time.toString(),
      image_url: item.image_url,
      description: item.description,
      availability: item.availability,
    });
    setShowForm(true);
  };

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        prep_time: parseInt(form.prep_time),
        image_url: form.image_url,
        description: form.description,
        availability: form.availability,
      };
      if (editing) {
        await MenuController.update(editing.id, payload);
        toast.success('Item updated');
      } else {
        await MenuController.create(payload);
        toast.success('Item added');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: FoodItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await MenuController.delete(item.id);
      toast.success('Item deleted');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleToggle = async (item: FoodItem) => {
    await MenuController.toggleAvailability(item.id, !item.availability);
    load();
  };

  const categories = MenuController.getCategories();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden transition-opacity ${item.availability ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
            <div className="relative h-36 bg-gray-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'; }}
              />
              {!item.availability && (
                <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                  <span className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">Unavailable</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{item.name}</p>
              <p className="text-xs text-gray-500 capitalize mb-2">{item.category.replace('_', ' ')}</p>
              <p className="text-emerald-600 font-bold mb-3">Rs {item.price.toFixed(0)}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleToggle(item)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" title="Toggle availability">
                  {item.availability ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                </button>
                <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input required value={form.name} onChange={set('name')} placeholder="Item name" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={set('category')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (Rs)</label>
                  <input required type="number" min="1" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input required type="number" min="1" value={form.prep_time} onChange={set('prep_time')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                  <input value={form.image_url} onChange={set('image_url')} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Brief description..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="avail" checked={form.availability} onChange={(e) => setForm((p) => ({ ...p, availability: e.target.checked }))} className="rounded" />
                  <label htmlFor="avail" className="text-sm text-gray-700">Available for ordering</label>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

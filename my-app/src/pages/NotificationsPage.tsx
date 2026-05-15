import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationObserver } from '../observers/OrderObserver';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const observer = new NotificationObserver();

const typeColors: Record<Notification['type'], string> = {
  info: 'bg-blue-50 border-blue-100',
  success: 'bg-emerald-50 border-emerald-100',
  warning: 'bg-amber-50 border-amber-100',
  error: 'bg-red-50 border-red-100',
};

const dotColors: Record<Notification['type'], string> = {
  info: 'bg-blue-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    NotificationController.getForUser(profile.id).then((data) => {
      setNotifications(data);
      setLoading(false);
    });

    observer.subscribe(profile.id, (n) => {
      setNotifications((prev) => [n, ...prev]);
    });

    return () => observer.unsubscribe();
  }, [profile]);

  const markRead = async (id: string) => {
    await NotificationController.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!profile) return;
    await NotificationController.markAllRead(profile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) return <LoadingSpinner />;

  const unread = notifications.filter((n) => !n.is_read);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unread.length} unread</p>
          )}
        </div>
        {unread.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-opacity ${typeColors[n.type]} ${n.is_read ? 'opacity-60' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read ? 'bg-gray-300' : dotColors[n.type]}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

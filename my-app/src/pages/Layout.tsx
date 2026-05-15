import { useEffect, useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationObserver } from '../observers/OrderObserver'; // Ensure this matches your file name
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Layout() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Create the observer instance INSIDE the component using useMemo.
  // This ensures a clean, unique instance for the current session.
  const notifObserver = useMemo(() => new NotificationObserver(), []);

  const refreshNotificationCount = async (userId: string) => {
    try {
      const data = await NotificationController.getForUser(userId);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    // Only run if a user is logged in
    if (!profile) return;

    // 2. Fetch initial unread count
    refreshNotificationCount(profile.id);

    // 3. Subscribe to real-time notification changes
    // This will trigger whenever a staff member updates an order status
    notifObserver.subscribe(profile.id, (notification) => {
      // Increment count locally for instant feedback
      setUnreadCount((prev) => prev + 1);
      
      // Optional: Show a popup toast when a new notification arrives
      toast(notification.message, {
        icon: '🔔',
        duration: 4000,
      });
    });

    // 4. CLEANUP: This is the most important part. 
    // It closes the WebSocket connection when the user logs out or closes the tab.
    return () => {
      notifObserver.unsubscribe();
    };
  }, [profile, notifObserver]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar receives the live unread count */}
      <Navbar unreadCount={unreadCount} />
      
      <main className="flex-1 pb-20 lg:pb-8">
        {/* Outlet renders the specific page (Menu, Dashboard, etc.) */}
        <Outlet />
      </main>

      {/* Optional: Simple footer for branding */}
      <footer className="hidden lg:block py-6 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            University E-Canteen © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
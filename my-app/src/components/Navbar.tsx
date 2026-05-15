import { Bell, LogOut, ShoppingCart, UtensilsCrossed, LayoutDashboard, ClipboardList, Utensils, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  unreadCount?: number;
}

export default function Navbar({ unreadCount = 0 }: NavbarProps) {
  const { profile, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  const isStaff = profile?.role === 'staff';

  const studentLinks = [
    { to: '/menu', label: 'Menu', icon: Utensils },
    { to: '/orders', label: 'My Orders', icon: ClipboardList },
  ];

  const staffLinks = [
    { to: '/staff', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/orders', label: 'Orders', icon: ClipboardList },
    { to: '/staff/menu', label: 'Menu Mgmt', icon: Utensils },
  ];

  const links = isStaff ? staffLinks : studentLinks;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link to={isStaff ? '/staff' : '/menu'} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-gray-900 hidden xs:block uppercase">E-Canteen</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 ml-6 flex-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Icons & Profile Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Student Cart */}
            {!isStaff && (
              <Link
                to="/cart"
                className={`relative p-2 rounded-xl transition-all ${
                    location.pathname === '/cart' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                    {count}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            <Link
              to="/notifications"
              className={`relative p-2 rounded-xl transition-all ${
                location.pathname === '/notifications' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{profile?.name}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">{profile?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-inner"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Mini-Bar (Sub-navigation) */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto no-scrollbar">
          {links.map((link) => {
             const Icon = link.icon;
             const active = location.pathname === link.to;
             return (
               <Link
                 key={link.to}
                 to={link.to}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                   active ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-500'
                 }`}
               >
                 <Icon className="w-3.5 h-3.5" />
                 {link.label}
               </Link>
             );
          })}
        </div>
      </div>
    </nav>
  );
}
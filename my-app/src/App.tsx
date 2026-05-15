import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Layout from './pages/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MenuPage from './pages/student/MenuPage';
import CartPage from './pages/student/CartPage';
import PaymentUploadPage from './pages/student/PaymentUploadPage';
import OrdersPage from './pages/student/OrdersPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrdersPage from './pages/staff/StaffOrdersPage';
import StaffMenuPage from './pages/staff/StaffMenuPage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'student' | 'staff';
}) {
  const { profile, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Loading..." />;
  if (!profile) return <Navigate to="/login" replace />;
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'staff' ? '/staff' : '/menu'} replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (profile) return <Navigate to={profile.role === 'staff' ? '/staff' : '/menu'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Authenticated layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Student routes */}
        <Route path="/menu" element={<ProtectedRoute requiredRole="student"><MenuPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute requiredRole="student"><CartPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute requiredRole="student"><OrdersPage /></ProtectedRoute>} />
        <Route
          path="/orders/:orderId/payment"
          element={<ProtectedRoute requiredRole="student"><PaymentUploadPage /></ProtectedRoute>}
        />

        {/* Staff routes */}
        <Route path="/staff" element={<ProtectedRoute requiredRole="staff"><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/orders" element={<ProtectedRoute requiredRole="staff"><StaffOrdersPage /></ProtectedRoute>} />
        <Route path="/staff/menu" element={<ProtectedRoute requiredRole="staff"><StaffMenuPage /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { duration: 3000 },
              error: { duration: 4000 },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

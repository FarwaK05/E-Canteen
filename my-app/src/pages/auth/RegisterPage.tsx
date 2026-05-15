import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Eye, EyeOff, ShieldCheck, GraduationCap, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthController } from '../../controllers/AuthController';
import type { UserRole } from '../../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // States for role and security
  const [role, setRole] = useState<UserRole>('student');
  const [staffKey, setStaffKey] = useState('');
  
  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // SECRET KEY: Only staff can create accounts if they know this code
  const SECRET_STAFF_KEY = "STAFF123"; 

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Staff Security Check
    if (role === 'staff' && staffKey !== SECRET_STAFF_KEY) {
      toast.error('Invalid Staff Access Key. Please contact the administrator.');
      return;
    }

    // 2. Password Validation
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // 3. Department validation for students
    if (role === 'student' && !form.department) {
        toast.error('Please select your department');
        return;
    }

    setLoading(true);
    
    // Using the AuthController we built earlier
    const { profile, error } = await AuthController.register(
      form.name,
      form.email,
      form.password,
      role, // Dynamic role based on toggle
      role === 'staff' ? 'Canteen Management' : form.department // Default dept for staff
    );
    
    setLoading(false);

    if (error || !profile) {
      toast.error(error ?? 'Registration failed');
      return;
    }

    toast.success(`Welcome, ${profile.name}! Account created as ${role}.`);
    
    // Redirect based on role
    if (role === 'staff') {
      navigate('/staff', { replace: true });
    } else {
      navigate('/menu', { replace: true });
    }
  };

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Business Administration',
    'Mathematics',
    'Physics',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-1">Join the university e-canteen system</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          
          {/* ROLE TOGGLE BUTTONS */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                role === 'student' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap className="w-5 h-5" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                role === 'staff' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheck className="w-5 h-5" /> Staff
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Conditional Staff Access Key Input */}
            {role === 'staff' && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-black text-emerald-700 uppercase tracking-widest mb-1.5">Staff Access Key</label>
                <input
                  type="password"
                  required
                  value={staffKey}
                  onChange={(e) => setStaffKey(e.target.value)}
                  placeholder="Enter secret staff code"
                  className="w-full px-4 py-2 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Ali Hassan"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">University Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@university.edu"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Only show Department if role is student */}
            {role === 'student' && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <select
                  required
                  value={form.department}
                  onChange={set('department')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white"
                >
                  <option value="">Select your department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Creating account...' : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register as {role}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
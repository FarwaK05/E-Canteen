export type UserRole = 'student' | 'staff';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  created_at: string;
}

export type FoodCategory = 'main_course' | 'fast_food' | 'beverages' | 'desserts' | 'snacks' | 'other';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  availability: boolean;
  image_url: string;
  prep_time: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verification'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'rejected';

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  pickup_time: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  screenshot_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
  food_items?: FoodItem;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

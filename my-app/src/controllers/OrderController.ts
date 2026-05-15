// MVC PATTERN — Controller for order lifecycle management

import supabase from '../supabase/supabaseClient';
import { getOrderState } from '../states/OrderStates';
import { NotificationFactory } from '../factories/NotificationFactory';
import type { Order, OrderItem, CartItem, OrderStatus } from '../types';

export class OrderController {
  static async createOrder(
    userId: string,
    cartItems: CartItem[],
    pickupTime: string,
    notes: string
  ): Promise<Order> {
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.food.price * item.quantity,
      0
    );

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_price: totalPrice,
        pickup_time: pickupTime,
        status: 'pending_payment',
        payment_status: 'unpaid',
        notes,
      })
      .select()
      .single();

    if (error || !order) throw new Error(error?.message ?? 'Failed to create order');

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      food_id: item.food.id,
      quantity: item.quantity,
      price_at_time: item.food.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw new Error(itemsError.message);

    return order;
  }

  static async uploadScreenshot(orderId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${orderId}.${ext}`;

    const { error } = await supabase.storage
      .from('payment-screenshots')
      .upload(path, file, { upsert: true });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('payment-screenshots').getPublicUrl(path);

    await supabase
      .from('orders')
      .update({
        screenshot_url: data.publicUrl,
        status: 'payment_verification',
        payment_status: 'pending',
      })
      .eq('id', orderId);

    // Notify student
    const { data: orderData } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .maybeSingle();

    if (orderData) {
      const notif = NotificationFactory.paymentReceived(orderData.user_id, orderId);
      await supabase.from('notifications').insert(notif);
    }

    return data.publicUrl;
  }

  static async getOrdersForUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, food_items(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(name, email, department), order_items(*, food_items(*))')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async updateStatus(
    orderId: string,
    currentStatus: OrderStatus,
    nextStatus: OrderStatus
  ): Promise<void> {
    const state = getOrderState(currentStatus);
    if (!state.canTransitionTo(nextStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${nextStatus}`);
    }

    const updates: Partial<Order> = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    } as Partial<Order>;

    if (nextStatus === 'confirmed') updates.payment_status = 'paid';
    if (nextStatus === 'pending_payment') updates.payment_status = 'unpaid';

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) throw new Error(error.message);

    // Notify student
    const { data: orderData } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .maybeSingle();

    if (orderData) {
      let notif;
      if (nextStatus === 'confirmed') {
        notif = NotificationFactory.paymentConfirmed(orderData.user_id, orderId);
      } else if (nextStatus === 'ready') {
        notif = NotificationFactory.orderReady(orderData.user_id, orderId);
      } else if (nextStatus === 'pending_payment') {
        notif = NotificationFactory.paymentRejected(orderData.user_id, orderId);
      } else {
        notif = NotificationFactory.statusUpdate(orderData.user_id, orderId, nextStatus);
      }
      await supabase.from('notifications').insert(notif);
    }
  }

  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*, food_items(*)')
      .eq('order_id', orderId);

    if (error) throw new Error(error.message);
    return data ?? [];
  }
}

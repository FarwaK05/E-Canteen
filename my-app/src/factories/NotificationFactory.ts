// FACTORY PATTERN — creates typed notification messages

import type { Notification, OrderStatus } from '../types';

type NotificationInput = Omit<Notification, 'id' | 'created_at' | 'is_read'>;

export class NotificationFactory {
  static paymentReceived(userId: string, orderId: string): NotificationInput {
    return {
      user_id: userId,
      message: `Payment screenshot received for order #${orderId.slice(-6).toUpperCase()}. Awaiting verification.`,
      type: 'info',
    };
  }

  static paymentConfirmed(userId: string, orderId: string): NotificationInput {
    return {
      user_id: userId,
      message: `Payment confirmed for order #${orderId.slice(-6).toUpperCase()}. Your order is now being prepared.`,
      type: 'success',
    };
  }

  static paymentRejected(userId: string, orderId: string): NotificationInput {
    return {
      user_id: userId,
      message: `Payment could not be verified for order #${orderId.slice(-6).toUpperCase()}. Please re-upload your screenshot.`,
      type: 'error',
    };
  }

  static orderReady(userId: string, orderId: string): NotificationInput {
    return {
      user_id: userId,
      message: `Your order #${orderId.slice(-6).toUpperCase()} is ready for pickup! Please collect it from the counter.`,
      type: 'success',
    };
  }

  static statusUpdate(userId: string, orderId: string, status: OrderStatus): NotificationInput {
    const labels: Record<OrderStatus, string> = {
      pending_payment: 'pending payment',
      payment_verification: 'under payment verification',
      confirmed: 'confirmed',
      preparing: 'being prepared',
      ready: 'ready for pickup',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    return {
      user_id: userId,
      message: `Order #${orderId.slice(-6).toUpperCase()} is now ${labels[status]}.`,
      type: status === 'cancelled' ? 'error' : 'info',
    };
  }

  static newOrderAlert(staffUserId: string, orderId: string, studentName: string): NotificationInput {
    return {
      user_id: staffUserId,
      message: `New order #${orderId.slice(-6).toUpperCase()} from ${studentName} requires payment verification.`,
      type: 'warning',
    };
  }
}

// OBSERVER PATTERN — Fixed to prevent "subscribe after subscribe" errors
import supabase from '../supabase/supabaseClient';
import type { Order, Notification } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type OrderChangeCallback = (order: Order) => void;
type NotificationCallback = (notification: Notification) => void;

export class OrderObserver {
  private channel: RealtimeChannel | null = null;

  async subscribe(userId: string, onOrderChange: OrderChangeCallback): Promise<void> {
    await this.unsubscribe(); // Ensure old channel is gone
    
    this.channel = supabase.channel(`orders_user_${userId}`);
    
    this.channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) onOrderChange(payload.new as Order);
        }
      )
      .subscribe();
  }

  async subscribeAll(onOrderChange: OrderChangeCallback): Promise<void> {
    await this.unsubscribe(); // Crucial: await the cleanup
    
    this.channel = supabase.channel('orders_staff_all');
    
    this.channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new) onOrderChange(payload.new as Order);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('Staff channel active');
      });
  }

  async unsubscribe(): Promise<void> {
    if (this.channel) {
      const channelToExtra = this.channel;
      this.channel = null; // Immediately clear state
      await supabase.removeChannel(channelToExtra);
    }
  }
}

export class NotificationObserver {
  private channel: RealtimeChannel | null = null;

  async subscribe(userId: string, onNotification: NotificationCallback): Promise<void> {
    await this.unsubscribe();
    
    this.channel = supabase.channel(`notifs_user_${userId}`);
    
    this.channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) onNotification(payload.new as Notification);
        }
      )
      .subscribe();
  }

  async unsubscribe(): Promise<void> {
    if (this.channel) {
      const channelToExtra = this.channel;
      this.channel = null;
      await supabase.removeChannel(channelToExtra);
    }
  }
}
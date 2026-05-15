// STATE PATTERN — each class represents a valid order state with allowed transitions

import type { OrderStatus } from '../types';

interface IOrderState {
  getStatus(): OrderStatus;
  getLabel(): string;
  getColor(): string;
  getAllowedTransitions(): OrderStatus[];
  canTransitionTo(next: OrderStatus): boolean;
}

abstract class BaseOrderState implements IOrderState {
  abstract getStatus(): OrderStatus;
  abstract getLabel(): string;
  abstract getColor(): string;
  abstract getAllowedTransitions(): OrderStatus[];

  canTransitionTo(next: OrderStatus): boolean {
    return this.getAllowedTransitions().includes(next);
  }
}

export class PendingPaymentState extends BaseOrderState {
  getStatus(): OrderStatus { return 'pending_payment'; }
  getLabel(): string { return 'Pending Payment'; }
  getColor(): string { return 'amber'; }
  getAllowedTransitions(): OrderStatus[] { return ['payment_verification', 'cancelled']; }
}

export class PaymentVerificationState extends BaseOrderState {
  getStatus(): OrderStatus { return 'payment_verification'; }
  getLabel(): string { return 'Verifying Payment'; }
  getColor(): string { return 'blue'; }
  getAllowedTransitions(): OrderStatus[] { return ['confirmed', 'pending_payment', 'cancelled']; }
}

export class ConfirmedState extends BaseOrderState {
  getStatus(): OrderStatus { return 'confirmed'; }
  getLabel(): string { return 'Confirmed'; }
  getColor(): string { return 'green'; }
  getAllowedTransitions(): OrderStatus[] { return ['preparing', 'cancelled']; }
}

export class PreparingState extends BaseOrderState {
  getStatus(): OrderStatus { return 'preparing'; }
  getLabel(): string { return 'Preparing'; }
  getColor(): string { return 'orange'; }
  getAllowedTransitions(): OrderStatus[] { return ['ready']; }
}

export class ReadyState extends BaseOrderState {
  getStatus(): OrderStatus { return 'ready'; }
  getLabel(): string { return 'Ready for Pickup'; }
  getColor(): string { return 'teal'; }
  getAllowedTransitions(): OrderStatus[] { return ['completed']; }
}

export class CompletedState extends BaseOrderState {
  getStatus(): OrderStatus { return 'completed'; }
  getLabel(): string { return 'Completed'; }
  getColor(): string { return 'gray'; }
  getAllowedTransitions(): OrderStatus[] { return []; }
}

export class CancelledState extends BaseOrderState {
  getStatus(): OrderStatus { return 'cancelled'; }
  getLabel(): string { return 'Cancelled'; }
  getColor(): string { return 'red'; }
  getAllowedTransitions(): OrderStatus[] { return []; }
}

// Factory method to get state instance from string
export function getOrderState(status: OrderStatus): IOrderState {
  switch (status) {
    case 'pending_payment':       return new PendingPaymentState();
    case 'payment_verification':  return new PaymentVerificationState();
    case 'confirmed':             return new ConfirmedState();
    case 'preparing':             return new PreparingState();
    case 'ready':                 return new ReadyState();
    case 'completed':             return new CompletedState();
    case 'cancelled':             return new CancelledState();
  }
}

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'pending_payment',
  'payment_verification',
  'confirmed',
  'preparing',
  'ready',
  'completed',
];

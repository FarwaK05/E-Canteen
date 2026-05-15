import { getOrderState } from '../states/OrderStates.ts'; 
import type { OrderStatus } from '../types';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  red: 'bg-red-100 text-red-800 border-red-200',
};

export default function OrderStatusBadge({ status, size = 'md' }: Props) {
  const state = getOrderState(status);
  const colors = colorMap[state.getColor()] ?? colorMap.gray;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${colors} ${padding}`}>
      {state.getLabel()}
    </span>
  );
}

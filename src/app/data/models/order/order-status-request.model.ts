import { OrderStatus } from './order-status.enum';

export interface OrderStatusRequest {
  estado: OrderStatus;
}

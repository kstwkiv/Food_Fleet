export interface OrderItemDto {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  customizations?: string;
}

export interface OrderDto {
  id: string;
  customerId: string;
  restaurantId: string;
  deliveryAddress: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface PlaceOrderRequest {
  restaurantId: string;
  deliveryAddress: string;
  paymentMethod: number;
  items: { menuItemId: string; quantity: number; unitPrice: number; customizations?: string }[];
}

export interface OrderStats {
  total: number;
  placed: number;
  confirmed: number;
  preparing: number;
  ready: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

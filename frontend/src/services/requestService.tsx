import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
}

export interface CropRequest {
  id: string;
  crop_id: string;
  buyer_id: number;
  farmer_id: number;
  quantity_kg: number;
  requested_price?: number;
  message?: string;
  status: RequestStatus;
  farmer_response?: string;
  counter_offer_price?: number;
  final_price?: number;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  crop_name?: string;
  crop_image?: string;
}

export interface Order {
  id: string;
  request_id: string;
  crop_id: string;
  buyer_id: number;
  farmer_id: number;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  delivery_notes?: string;
  status: OrderStatus;
  expected_delivery_date?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
  paid_at?: string;
}

export const requestsApi = {
  // Create request
  createRequest: async (data: {
    crop_id: string;
    quantity_kg: number;
    requested_price?: number;
    message?: string;
  }): Promise<CropRequest> => {
    const response = await apiClient.post('/requests', data);
    return response.data;
  },

  // Get buyer requests
  getBuyerRequests: async (status?: string): Promise<CropRequest[]> => {
    const response = await apiClient.get('/requests/buyer', {
      params: { status },
    });
    return response.data;
  },

  // Get farmer requests
  getFarmerRequests: async (status?: string): Promise<CropRequest[]> => {
    const response = await apiClient.get('/requests/farmer', {
      params: { status },
    });
    return response.data;
  },

  // Get request details
  getRequestDetails: async (requestId: string): Promise<CropRequest> => {
    const response = await apiClient.get(`/requests/${requestId}`);
    return response.data;
  },

  // Farmer respond to request
  respondToRequest: async (
    requestId: string,
    data: {
      action: 'accept' | 'reject' | 'counter';
      response_message?: string;
      counter_offer_price?: number;
    }
  ): Promise<CropRequest> => {
    const response = await apiClient.put(`/requests/${requestId}/respond`, data);
    return response.data;
  },

  // Buyer accept counter offer
  acceptCounterOffer: async (requestId: string): Promise<CropRequest> => {
    const response = await apiClient.put(`/requests/${requestId}/accept-counter`);
    return response.data;
  },

  // Cancel request
  cancelRequest: async (requestId: string): Promise<void> => {
    await apiClient.delete(`/requests/${requestId}`);
  },
};

export const ordersApi = {
  // Create order
  createOrder: async (data: {
    request_id: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes?: string;
  }): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  // Get buyer orders
  getBuyerOrders: async (status?: string): Promise<Order[]> => {
    const response = await apiClient.get('/orders/buyer', {
      params: { status },
    });
    return response.data;
  },

  // Get farmer orders
  getFarmerOrders: async (status?: string): Promise<Order[]> => {
    const response = await apiClient.get('/orders/farmer', {
      params: { status },
    });
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<{ message: string; order: Order }> => {
    const response = await apiClient.put(`/orders/${orderId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}`);
  },
};

export const paymentsApi = {
  // Create payment
  createPayment: async (data: {
    order_id: string;
    payment_method: PaymentMethod;
    transaction_id?: string;
  }): Promise<Payment> => {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (
    paymentId: string,
    transactionId: string
  ): Promise<{ message: string; payment: Payment }> => {
    const response = await apiClient.put(`/payments/${paymentId}/confirm`, null, {
      params: { transaction_id: transactionId },
    });
    return response.data;
  },

  // Get payment by order
  getPaymentByOrder: async (orderId: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/order/${orderId}`);
    return response.data;
  },

  // Get buyer payments
  getBuyerPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get('/payments/buyer');
    return response.data;
  },
};
'use client';

import { paymentsApi, requestsApi, ordersApi } from '@component/services/requestService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const requestKeys = {
  buyerRequests: (status?: string) => ['buyer-requests', status] as const,
  farmerRequests: (status?: string) => ['farmer-requests', status] as const,
  requestDetails: (id: string) => ['request-details', id] as const,
};

export const orderKeys = {
  buyerOrders: (status?: string) => ['buyer-orders', status] as const,
  farmerOrders: (status?: string) => ['farmer-orders', status] as const,
  orderDetails: (id: string) => ['order-details', id] as const,
};

export const paymentKeys = {
  paymentByOrder: (orderId: string) => ['payment', orderId] as const,
  buyerPayments: ['buyer-payments'] as const,
};

// Request Hooks
export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-requests'] });
    }
  });
};

export const useGetBuyerRequests = (status?: string) => {
  return useQuery({
    queryKey: requestKeys.buyerRequests(status),
    queryFn: () => requestsApi.getBuyerRequests(status),
  });
};

export const useGetFarmerRequests = (status?: string) => {
  return useQuery({
    queryKey: requestKeys.farmerRequests(status),
    queryFn: () => requestsApi.getFarmerRequests(status),
  });
};

export const useGetRequestDetails = (requestId: string) => {
  return useQuery({
    queryKey: requestKeys.requestDetails(requestId),
    queryFn: () => requestsApi.getRequestDetails(requestId),
    enabled: !!requestId,
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: {
        action: 'accept' | 'reject' | 'counter';
        response_message?: string;
        counter_offer_price?: number;
      };
    }) => requestsApi.respondToRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-requests'] });
    }
  });
};

export const useAcceptCounterOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => requestsApi.acceptCounterOffer(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-requests'] });
    },
  });
};

export const useCancelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => requestsApi.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-requests'] });
    },
  });
};

// Order Hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });
};

export const useGetBuyerOrders = (status?: string) => {
  return useQuery({
    queryKey: orderKeys.buyerOrders(status),
    queryFn: () => ordersApi.getBuyerOrders(status),
  });
};

export const useGetFarmerOrders = (status?: string) => {
  return useQuery({
    queryKey: orderKeys.farmerOrders(status),
    queryFn: () => ordersApi.getFarmerOrders(status),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: any }) =>
      ordersApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-orders'] });
    },
  });
};

// Payment Hooks
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-payments'] });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      transactionId,
    }: {
      paymentId: string;
      transactionId: string;
    }) => paymentsApi.confirmPayment(paymentId, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-payments'] });
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });
};

export const useGetPaymentByOrder = (orderId: string) => {
  return useQuery({
    queryKey: paymentKeys.paymentByOrder(orderId),
    queryFn: () => paymentsApi.getPaymentByOrder(orderId),
    enabled: !!orderId,
  });
};
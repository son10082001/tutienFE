import { axiosInstance } from '../axios';
import type { CreateTicketConversionInput, TicketExchangeHistoryResponse, TicketExchangeMetaResponse } from './types';

export const getTicketExchangeMeta = async (): Promise<TicketExchangeMetaResponse> => {
  const { data } = await axiosInstance.get<TicketExchangeMetaResponse>('/ticket-exchange/meta');
  return data;
};

export const createTicketConversion = async (
  payload: CreateTicketConversionInput
): Promise<{ ticketBalanceAfter: number; balanceAfter: number }> => {
  const { data } = await axiosInstance.post('/ticket-exchange/convert', payload);
  return data;
};

export const getTicketExchangeHistory = async (page = 1, limit = 10): Promise<TicketExchangeHistoryResponse> => {
  const { data } = await axiosInstance.get<TicketExchangeHistoryResponse>('/ticket-exchange/history', {
    params: { page, limit },
  });
  return data;
};

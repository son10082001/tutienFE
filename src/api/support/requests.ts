import { axiosInstance } from '../axios';
import { normalizeApiMediaUrl } from '../media-url';
import type { CreateSupportTicketInput, MySupportTicketsResponse, SupportChannel, SupportMetaResponse } from './types';

function normalizeSupportChannel(channel: SupportChannel): SupportChannel {
  return {
    ...channel,
    icon: normalizeApiMediaUrl(channel.icon),
  };
}

export const getSupportMeta = async (): Promise<SupportMetaResponse> => {
  const { data } = await axiosInstance.get<SupportMetaResponse>('/support/meta');
  return {
    ...data,
    channels: Array.isArray(data?.channels) ? data.channels.map(normalizeSupportChannel) : [],
  };
};

export const createSupportTicket = async (payload: CreateSupportTicketInput) => {
  const { data } = await axiosInstance.post('/support/tickets', payload);
  return data;
};

export const getMySupportTickets = async (page = 1, limit = 10): Promise<MySupportTicketsResponse> => {
  const { data } = await axiosInstance.get<MySupportTicketsResponse>('/support/tickets/my', {
    params: { page, limit },
  });
  return data;
};

export const getAdminSupportChannels = async (): Promise<{ items: SupportChannel[] }> => {
  const { data } = await axiosInstance.get<{ items: SupportChannel[] }>('/admin/support/channels');
  return {
    ...data,
    items: Array.isArray(data?.items) ? data.items.map(normalizeSupportChannel) : [],
  };
};

export const createAdminSupportChannel = async (payload: {
  code: string;
  name: string;
  url: string;
  icon?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}) => {
  const { data } = await axiosInstance.post('/admin/support/channels', payload);
  return data;
};

export const uploadAdminSupportIcon = async (file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await axiosInstance.post<{ imageUrl: string }>('/admin/support/upload-icon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    ...data,
    imageUrl: normalizeApiMediaUrl(data?.imageUrl) ?? '',
  };
};

export const updateAdminSupportChannel = async (
  id: string,
  payload: { name?: string; url?: string; icon?: string | null; isActive?: boolean; sortOrder?: number }
) => {
  const { data } = await axiosInstance.patch(`/admin/support/channels/${encodeURIComponent(id)}`, payload);
  if (data && typeof data === 'object' && 'icon' in (data as Record<string, unknown>)) {
    const typed = data as SupportChannel;
    return normalizeSupportChannel(typed);
  }
  return data;
};

export const deleteAdminSupportChannel = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/support/channels/${encodeURIComponent(id)}`);
};

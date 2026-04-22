export interface SupportChannel {
  id: string;
  code: string;
  name: string;
  url: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMetaResponse {
  channels: SupportChannel[];
  statusOptions: Array<{ value: string; label: string }>;
}

export interface CreateSupportTicketInput {
  characterName?: string | null;
  serverName?: string | null;
  title: string;
  content: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  characterName: string | null;
  serverName: string | null;
  title: string;
  content: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MySupportTicketsResponse {
  items: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}

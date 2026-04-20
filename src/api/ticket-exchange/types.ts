export interface TicketExchangeMetaResponse {
  rate: number;
  balance: number;
  ticketBalance: number;
  servers: {
    id: number;
    name: string;
  }[];
  characters: {
    serverId: number;
    uid: string;
    name: string;
    level: number | null;
  }[];
}

export interface CreateTicketConversionInput {
  serverId: number;
  amount: number;
}

export interface CreateTicketExchangeInput {
  serverId: number;
  tickets: number;
}

export interface TicketExchangeRow {
  id: string;
  userId: string;
  serverId: number;
  playerUid: string;
  playerName: string;
  amount: number;
  tickets: number;
  conversionRate: number;
  createdAt: string;
}

export interface TicketExchangeHistoryResponse {
  items: TicketExchangeRow[];
  total: number;
  page: number;
  limit: number;
}

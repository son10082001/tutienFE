import { createMutation, createQuery } from 'react-query-kit';
import { createTicketConversion, getTicketExchangeHistory, getTicketExchangeMeta } from './requests';

export const useTicketExchangeMeta = createQuery({
  primaryKey: 'ticket-exchange-meta',
  queryFn: () => getTicketExchangeMeta(),
});

export const useTicketExchangeHistory = createQuery<
  Awaited<ReturnType<typeof getTicketExchangeHistory>>,
  { page?: number; limit?: number },
  Error
>({
  primaryKey: 'ticket-exchange-history',
  queryFn: ({ queryKey: [, variables] }) => getTicketExchangeHistory(variables.page, variables.limit),
});

export const useCreateTicketConversion = createMutation({
  mutationFn: createTicketConversion,
});

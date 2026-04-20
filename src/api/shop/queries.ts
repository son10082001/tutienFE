import { createMutation, createQuery } from 'react-query-kit';
import {
  adminCreateShopItem,
  adminDeleteShopItem,
  adminListExternalItems,
  adminListShopItems,
  adminUpdateShopItem,
  buyShopItem,
  getShopMeta,
  listShopItems,
} from './requests';
import type { CreateShopItemInput, ShopItemsQuery, UpdateShopItemInput } from './types';

export const useAdminShopItems = createQuery({
  primaryKey: 'admin-shop-items',
  queryFn: () => adminListShopItems(),
});

export const useAdminExternalItems = createQuery({
  primaryKey: 'admin-external-items',
  queryFn: () => adminListExternalItems(),
});

export const useAdminCreateShopItem = createMutation({
  mutationFn: (payload: CreateShopItemInput) => adminCreateShopItem(payload),
});

export const useAdminUpdateShopItem = createMutation({
  mutationFn: ({ id, payload }: { id: string; payload: UpdateShopItemInput }) =>
    adminUpdateShopItem(id, payload),
});

export const useAdminDeleteShopItem = createMutation({
  mutationFn: (id: string) => adminDeleteShopItem(id),
});

export const useShopItems = createQuery<
  Awaited<ReturnType<typeof listShopItems>>,
  ShopItemsQuery,
  Error
>({
  primaryKey: 'shop-items',
  queryFn: ({ queryKey: [, variables] }) => listShopItems(variables),
});

export const useShopMeta = createQuery({
  primaryKey: 'shop-meta',
  queryFn: () => getShopMeta(),
});

export const useBuyShopItem = createMutation({
  mutationFn: buyShopItem,
});

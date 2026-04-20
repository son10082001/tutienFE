export interface ExternalItem {
  id: string;
  name: string;
}

export interface ShopItem {
  id: string;
  externalItemId: number;
  itemName: string;
  itemQuantity: number;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShopItemPriceRank = 'all' | 'low' | 'mid' | 'high' | 'vip';
export type ShopItemSort = 'latest' | 'price-asc' | 'price-desc';

export interface ShopItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  priceRank?: ShopItemPriceRank;
  sort?: ShopItemSort;
  minPrice?: number;
  maxPrice?: number;
}

export interface ShopItemsResponse {
  items: ShopItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShopCharacter {
  serverId: number;
  uid: string;
  name: string;
  level: number | null;
}

export interface ShopServer {
  id: number;
  name: string;
}

export interface ShopMeta {
  servers: ShopServer[];
  characters: ShopCharacter[];
  balance: number;
}

export interface CreateShopItemInput {
  externalItemId: number;
  itemName: string;
  itemQuantity: number;
  price: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateShopItemInput {
  externalItemId?: number;
  itemName?: string;
  itemQuantity?: number;
  price?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface BuyShopItemInput {
  shopItemId: string;
  serverId: number;
  buyQuantity: number;
}

export interface UploadShopImageResponse {
  url: string;
}

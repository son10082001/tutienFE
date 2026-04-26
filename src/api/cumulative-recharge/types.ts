export type CumulativeGiftEntry = {
  externalItemId: number;
  quantity: number;
  itemName?: string;
  imageUrl?: string;
};

export type CumulativeMilestoneAdmin = {
  id: string;
  thresholdAmount: number;
  title: string | null;
  gifts: CumulativeGiftEntry[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CumulativeRechargeServer = { id: number; name: string };
export type CumulativeRechargeCharacter = {
  serverId: number;
  uid: string;
  name: string;
  level: number | null;
};

export type CumulativeMilestoneUser = {
  id: string;
  thresholdAmount: number;
  title: string | null;
  sortOrder: number;
  gifts: CumulativeGiftEntry[];
  claimed: boolean;
  eligible: boolean;
  canClaim: boolean;
};

export type CumulativeRechargeStateResponse = {
  totalDeposited: number;
  milestones: CumulativeMilestoneUser[];
  servers: CumulativeRechargeServer[];
  characters: CumulativeRechargeCharacter[];
};

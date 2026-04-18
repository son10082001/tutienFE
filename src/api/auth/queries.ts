import { createQuery } from 'react-query-kit';
import { getKycInfo, userInfo } from './requests';
import type { KycInfoResponse, UserInfoResponse } from './types';

export const useMe = createQuery<UserInfoResponse>({
  primaryKey: 'me',
  queryFn: () => userInfo(),
});

export const useKycInfo = createQuery<KycInfoResponse>({
  primaryKey: 'kyc-info',
  queryFn: () => getKycInfo(),
});

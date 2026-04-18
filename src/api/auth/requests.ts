import { axiosInstance } from '../axios';
import type {
  KycInfoResponse,
  KycSubmissionRequest,
  RegisterAccountRequest,
  SignInRequest,
  SignInResponse,
  UserInfoResponse,
} from './types';

export const signIn = async (params: SignInRequest): Promise<SignInResponse> => {
  const { data } = await axiosInstance({
    url: '/auth/login',
    method: 'POST',
    data: params,
  });

  return data;
};

export const signOut = async (): Promise<void> => {
  await axiosInstance({
    url: '/auth/logout',
    method: 'POST',
  });
};

export const registerAccount = async (params: RegisterAccountRequest): Promise<void> => {
  await axiosInstance({
    url: '/auth/register',
    method: 'POST',
    data: params,
  });
};

export const forgotPassword = async (params: { email: string }): Promise<void> => {
  await axiosInstance({
    url: '/auth/forgot-password',
    method: 'POST',
    data: params,
  });
};

export const userInfo = async (): Promise<UserInfoResponse> => {
  const { data } = await axiosInstance({
    url: '/auth/me',
    method: 'GET',
  });

  return data;
};

export const submitKyc = async (params: KycSubmissionRequest): Promise<void> => {
  await axiosInstance({
    url: '/kyc',
    method: 'POST',
    data: params,
  });
};

export const getKycInfo = async (): Promise<KycInfoResponse> => {
  const { data } = await axiosInstance({
    url: '/kyc',
    method: 'GET',
  });

  return data;
};

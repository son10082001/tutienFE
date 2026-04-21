import type { UserInfoResponse } from '@/api/auth';
import { COOKIE_KEY, cookieStorage, removeAuthStorage } from '@/utils/auth';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { sessionSync } from '@/lib/sessionSync';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: Partial<UserInfoResponse> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setToken: (access_token: string, refresh_token: string) => void;
  setUser: (user: UserInfoResponse) => void;
  login: (access_token: string, refresh_token: string, user: UserInfoResponse) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  access_token: null,
  refresh_token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    immer<AuthStore>((set) => ({
      ...initialState,

      setToken: (access_token: string, refresh_token: string) =>
        set((state) => {
          state.access_token = access_token;
          state.isAuthenticated = !!access_token;
          state.refresh_token = refresh_token || null;
        }),

      setUser: (user: UserInfoResponse) =>
        set((state) => {
          state.user = user;
        }),

      login: (access_token: string, refresh_token: string, user: UserInfoResponse) =>
        set((state) => {
          state.access_token = access_token;
          state.refresh_token = refresh_token;
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
        }),

      logout: () =>
        set((state) => {
          sessionSync.reportLogout();
          removeAuthStorage();
          state.access_token = null;
          state.refresh_token = null;
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        }),

      setLoading: (loading: boolean) =>
        set((state) => {
          state.isLoading = loading;
        }),

      clearAuth: () =>
        set((state) => {
          sessionSync.reportLogout();
          removeAuthStorage();
          Object.assign(state, initialState);
        }),
    })),
    {
      name: COOKIE_KEY,
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

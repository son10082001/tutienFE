import { create } from 'zustand';

export type MessagePopupVariant = 'success' | 'error';

type MessagePopupState = {
  open: boolean;
  variant: MessagePopupVariant;
  title: string;
  description?: string;
};

type MessagePopupActions = {
  show: (payload: { variant: MessagePopupVariant; title: string; description?: string }) => void;
  close: () => void;
};

const initial: MessagePopupState = {
  open: false,
  variant: 'success',
  title: '',
  description: undefined,
};

export const useMessagePopupStore = create<MessagePopupState & MessagePopupActions>((set) => ({
  ...initial,
  show: ({ variant, title, description }) => set({ open: true, variant, title, description: description || undefined }),
  close: () => set({ open: false, description: undefined }),
}));

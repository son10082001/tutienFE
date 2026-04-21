import { useMessagePopupStore } from '@/stores/message-popup-store';
import { translateError } from './translate-error';

export function notifySuccess(title: string, description?: string) {
  useMessagePopupStore.getState().show({ variant: 'success', title, description });
}

export function notifyError(title: string, description?: string) {
  useMessagePopupStore.getState().show({ variant: 'error', title, description });
}

/** Lỗi từ API / mutation — tự dịch message */
export function notifyErrorFromUnknown(error: unknown) {
  const msg =
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (error as { data?: { message?: string } })?.data?.message ||
    (error as Error)?.message ||
    (error as { statusText?: string })?.statusText ||
    (error as { detail?: string })?.detail;
  const desc =
    typeof msg === 'string' && msg.trim() ? translateError(msg.trim()) : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  notifyError('Thất bại', desc);
}

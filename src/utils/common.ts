import { toast } from 'sonner';
import { translateError } from './translate-error';

export const isNonEmptyArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

export const onMutateError = (error: any) => {
  const msg =
    error?.response?.data?.message || error?.data?.message || error?.message || error?.statusText || error?.detail;
  return toast.error(translateError(msg));
};

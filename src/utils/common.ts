import { notifyErrorFromUnknown } from './notify';

export const isNonEmptyArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

export const onMutateError = (error: unknown) => {
  notifyErrorFromUnknown(error);
};

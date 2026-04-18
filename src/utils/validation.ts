import z from 'zod';

export enum ValidationType {
  REQUIRED = 'required',
  MIN = 'min',
  MAX = 'max',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
}

export const getValidationMessage = (type: ValidationType, fieldName?: string, numberValue?: number) => {
  switch (type) {
    case ValidationType.REQUIRED:
      return `Trường này là bắt buộc`;
    case ValidationType.MAX:
      return `${fieldName} không thể vượt quá ${numberValue}`;
    case ValidationType.MIN:
      return `${fieldName} phải lớn hơn ${numberValue}`;
    case ValidationType.MIN_LENGTH:
      return `${fieldName} phải ít nhất ${numberValue} kí tự`;
    case ValidationType.MAX_LENGTH:
      return `${fieldName} không thể vượt quá ${numberValue} kí tự`;
    default:
      return `Please fill out this field`;
  }
};

// Reusable validation schemas
export const emailSchema = z
  .string(getValidationMessage(ValidationType.REQUIRED))
  .min(1, getValidationMessage(ValidationType.REQUIRED))
  .email('Định dạng email không hợp lệ.')
  .max(254, 'Email không thể vượt quá 254 kí tự.');

export const phoneNumberSchema = z
  .string(getValidationMessage(ValidationType.REQUIRED))
  .min(1, getValidationMessage(ValidationType.REQUIRED))
  .regex(/^\+?[0-9]+$/, 'Số điện thoại chỉ được chứa chữ số và có thể bắt đầu bằng dấu +')
  .refine(
    (val) => {
      const digitsOnly = val.startsWith('+') ? val.slice(1) : val;
      return digitsOnly.length >= 9 && digitsOnly.length <= 15;
    },
    {
      message: 'Số điện thoại phải có độ dài từ 9 đến 15 chữ số',
    }
  );

export const passwordSchema = z
  .string()
  .nonempty(getValidationMessage(ValidationType.REQUIRED))
  .min(8, getValidationMessage(ValidationType.MIN_LENGTH, 'Mật khẩu', 8))
  .refine((value) => !/\s/.test(value), 'Mật khẩu không được chứa khoảng trắng')
  .refine((value) => /\d/.test(value), 'Mật khẩu phải chứa ít nhất một chữ số')
  .refine((value) => /[A-Z]/.test(value), 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
  .refine((value) => /[a-z]/.test(value), 'Mật khẩu phải chứa ít nhất một chữ cái viết thường')
  .refine((value) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value), 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt');

export const urlSchema = z.string().refine(
  (value) => {
    if (!value || value.trim() === '') return true; // Allow empty strings
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: 'Please enter a valid URL (e.g., https://example.com)',
  }
);

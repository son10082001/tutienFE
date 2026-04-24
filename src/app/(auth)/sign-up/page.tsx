'use client';

import { registerAccount } from '@/api/auth';
import { PasswordField, TextField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ROUTES } from '@/lib/routes';
import { onMutateError } from '@/utils/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
  .object({
    userId: z.string().trim().min(1, 'Vui lòng nhập tài khoản').max(128, 'Tài khoản tối đa 128 ký tự'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      userId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: registerAccount,
    onSuccess: () => {
      router.push(ROUTES.LOGIN);
    },
    onError: onMutateError,
  });

  const onSubmit = (data: FormData) => {
    registerMutation({
      userId: data.userId.trim(),
      password: data.password,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
        <div
          className='flex min-h-screen w-full items-center justify-center py-6'
          style={{
            background:
              "linear-gradient(310deg, rgba(33, 34, 41, 0.6), rgba(33, 37, 41, 0.6)) center center / cover no-repeat, url('/images/bg.png') transparent",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className='relative w-[500px]'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-400 to-yellow-400 opacity-30 blur-2xl' />

            <div className='relative rounded-2xl bg-gradient-to-r from-yellow-300 via-white to-yellow-400 p-[2px]'>
              <div className='flex flex-col items-center gap-5 rounded-2xl bg-[linear-gradient(180deg,rgba(15,15,25,0.95),rgba(5,5,15,0.95))] px-10 py-10 text-white'>
                <button
                  type='button'
                  onClick={() => router.push('/')}
                  className='flex items-center gap-2 text-gray-400 transition hover:text-yellow-300'
                >
                  <ArrowLeft className='size-5 transition' />
                  <span className='text-sm'>Quay lại</span>
                </button>

                <div className='flex flex-col items-center gap-2'>
                  <Image
                    src={'/images/logo-header.png'}
                    width={288.48}
                    height={192.27}
                    alt='logo'
                    className='w-[288.48px] cursor-pointer'
                    onClick={() => router.push('/')}
                  />
                  <h2 className='bg-gradient-to-r from-yellow-200 via-white to-yellow-400 bg-clip-text font-bold text-2xl text-transparent tracking-widest'>
                    NGƯ TIÊN KÝ
                  </h2>
                </div>

                <div className='space-y-1 text-center'>
                  <h1 className='font-semibold text-white text-xl'>Khai mở linh căn</h1>
                  <p className='text-gray-400 text-sm'>Tạo tài khoản mới</p>
                </div>

                <div className='w-full space-y-5'>
                  <TextField
                    control={form.control}
                    name='userId'
                    label='Tài khoản'
                    placeholder='Nhập tên đăng nhập'
                    required
                    preIcon={<User className='size-5' />}
                    disabled={isPending}
                    labelClassName='font-medium text-gray-300'
                    className='h-12 rounded-lg border border-yellow-500/20 bg-black/40 text-white placeholder:text-gray-500 focus:border-yellow-400 focus:bg-black/60'
                  />

                  <PasswordField
                    control={form.control}
                    name='password'
                    label='Mật khẩu'
                    placeholder='••••••••'
                    required
                    disabled={isPending}
                    labelClassName='font-medium text-gray-300'
                    className='h-12 rounded-lg border border-yellow-500/20 bg-black/40 text-white placeholder:text-gray-500 focus:border-yellow-400 focus:bg-black/60'
                  />

                  <PasswordField
                    control={form.control}
                    name='confirmPassword'
                    label='Nhập lại mật khẩu'
                    placeholder='••••••••'
                    required
                    disabled={isPending}
                    labelClassName='font-medium text-gray-300'
                    className='h-12 rounded-lg border border-yellow-500/20 bg-black/40 text-white placeholder:text-gray-500 focus:border-yellow-400 focus:bg-black/60'
                  />

                  <Button
                    type='submit'
                    className='mt-4 h-12 w-full rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 font-bold text-black transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-yellow-400/40'
                    loading={isPending}
                  >
                    Tạo tài khoản
                  </Button>
                </div>

                <div className='text-center text-sm'>
                  <span className='text-gray-400'>Đã có tài khoản? </span>
                  <button
                    type='button'
                    onClick={() => router.push(ROUTES.LOGIN)}
                    className='text-yellow-400 underline hover:text-yellow-300'
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { type UserInfoResponse, signIn } from '@/api/auth';
import { PasswordField, TextField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/auth-store';
import { savePortalGameLoginSession, setPortalGameHandoff } from '@/utils/game-handoff';
import { API_URL } from '@/utils/const';
import { onMutateError } from '@/utils/common';
import { sessionSync } from '@/lib/sessionSync';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  userId: z.string().min(1, 'Vui lòng nhập tài khoản'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type FormData = z.infer<typeof formSchema>;

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const { mutate: signInMutation, isPending: isSignInPending } = useMutation({
    mutationFn: signIn,
    onSuccess: (data, variables) => {
      setPortalGameHandoff(variables.userId, variables.password, data.accessToken, API_URL);
      savePortalGameLoginSession(variables.userId, variables.password);
      sessionSync.reportLogin(variables.userId, variables.password);

      const userInfo = {
        id: data?.user?.id,
        userId: data?.user?.userId,
        email: data?.user?.email,
        name: data?.user?.name,
        role: data?.user?.role,
        type: data?.user?.type,
        kycStatus: data?.user?.kycStatus ?? 'none',
      } as UserInfoResponse;

      login(data.accessToken, '', userInfo);

      toast.success('Đăng nhập thành công.');

      if (data?.user?.role === 'ADMIN') {
        router.push(ROUTES.ADMIN_DASHBOARD);
        return;
      }

      router.push(ROUTES.HOME);
    },
    onError: onMutateError,
  });

  const onSubmit = (data: FormData) => {
    signInMutation({ userId: data.userId, password: data.password });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
        <div
          className='flex h-screen w-full items-center justify-center'
          style={{
            background:
              "linear-gradient(310deg, rgba(33, 34, 41, 0.6), rgba(33, 37, 41, 0.6)) center center / cover no-repeat, url('/images/bg.png') transparent",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className='relative w-[500px]'>
            {/* glow */}
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-400 to-yellow-400 opacity-30 blur-2xl' />

            <div className='relative rounded-2xl bg-gradient-to-r from-yellow-300 via-white to-yellow-400 p-[2px]'>
              <div className='flex flex-col items-center gap-5 rounded-2xl bg-[linear-gradient(180deg,rgba(15,15,25,0.95),rgba(5,5,15,0.95))] px-10 py-10 text-white'>
                {/* Back */}
                <button
                  type='button'
                  onClick={() => router.push('/')}
                  className='flex items-center gap-2 text-gray-400 transition hover:text-yellow-300'
                >
                  <ArrowLeft className='group-hover:-translate-x-1 size-5 transition' />
                  <span className='text-sm'>Quay lại</span>
                </button>

                {/* Logo */}
                <div className='flex flex-col items-center gap-2'>
                  <div className='flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl shadow-lg shadow-yellow-400/40'>
                    🗡️
                  </div>

                  <h2 className='bg-gradient-to-r from-yellow-200 via-white to-yellow-400 bg-clip-text font-bold text-2xl text-transparent tracking-widest'>
                    TU TIÊN KIẾM HIỆP
                  </h2>
                </div>

                {/* Header */}
                <div className='space-y-1 text-center'>
                  <h1 className='font-semibold text-white text-xl'>Trở lại Tiên Giới</h1>
                  <p className='text-gray-400 text-sm'>Đăng nhập để tiếp tục tu luyện</p>
                </div>

                {/* Form */}
                <div className='w-full space-y-5'>
                  <TextField
                    control={form.control}
                    name='userId'
                    label='Tài khoản'
                    placeholder='Nhập userId'
                    required
                    preIcon={<User className='size-5' />}
                    disabled={isSignInPending}
                    labelClassName='text-gray-300 font-medium'
                    className='h-12 rounded-lg border border-yellow-500/20 bg-black/40 text-white transition-all placeholder:text-gray-500 focus:border-yellow-400 focus:bg-black/60'
                  />

                  <div className='space-y-2'>
                    <PasswordField
                      control={form.control}
                      name='password'
                      label='Mật khẩu'
                      placeholder='••••••••'
                      required
                      disabled={isSignInPending}
                      labelClassName='text-gray-300 font-medium'
                      className='h-12 rounded-lg border border-yellow-500/20 bg-black/40 text-white transition-all placeholder:text-gray-500 focus:border-yellow-400 focus:bg-black/60'
                    />

                    <div className='flex justify-end'>
                      <button
                        type='button'
                        onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}
                        className='text-sm text-yellow-400 hover:underline'
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                  </div>

                  <Button
                    type='submit'
                    className='mt-4 h-12 w-full rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 font-bold text-black transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-yellow-400/40'
                    loading={isSignInPending}
                  >
                    Đột Phá Cảnh Giới
                  </Button>
                </div>

                {/* Divider */}
                <div className='flex w-full items-center gap-3'>
                  <div className='h-px flex-1 bg-white/10' />
                  <span className='text-gray-500 text-sm'>hoặc</span>
                  <div className='h-px flex-1 bg-white/10' />
                </div>

                {/* Signup */}
                <div className='text-center text-sm'>
                  <span className='text-gray-400'>Chưa nhập môn? </span>
                  <button
                    type='button'
                    onClick={() => router.push(ROUTES.SIGN_UP)}
                    className='text-yellow-400 underline hover:text-yellow-300'
                  >
                    Gia nhập môn phái
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default LoginPage;

'use client';

import { Icons } from '@/assets/icons';
import { PortalGameSessionBridge } from '@/components/PortalGameSessionBridge';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { type ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 1000,
      retry: false,
    },
  },
});

export interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <HeroUIProvider>
        <QueryClientProvider client={queryClient}>
          <PortalGameSessionBridge />
          <Toaster
            position='bottom-right'
            closeButton
            toastOptions={{
              classNames: {
                icon: '!w-[38px] !h-[38px]',
                title: '!text-base',
                toast: 'toast',
                closeButton: '!top-1 !right-2 !left-auto !transform-none !bg-transparent !text-white !border-none',
              },
            }}
            icons={{
              success: <Icons.success_circle />,
              error: <Icons.error_circle />,
            }}
          />
          <>{isMounted ? children : <></>}</>
        </QueryClientProvider>
      </HeroUIProvider>
      <ProgressBar height='4px' color='#fffd00' options={{ showSpinner: false }} shallowRouting />
    </>
  );
}

export default Providers;

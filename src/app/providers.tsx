'use client';

import { MessagePopupHost } from '@/components/ui/message-popup-host';
import { PortalGameSessionBridge } from '@/components/PortalGameSessionBridge';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { type ReactNode, useEffect, useState } from 'react';

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

import { Toaster } from 'sonner';

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
          <MessagePopupHost />
          <>{isMounted ? children : <></>}</>
          <Toaster 
            position="top-right" 
            richColors 
            expand={false} 
            theme="dark"
            toastOptions={{
              className: 'border-white/10 bg-[#0C111D] text-white',
            }}
          />
        </QueryClientProvider>
      </HeroUIProvider>
      <ProgressBar height='4px' color='#fffd00' options={{ showSpinner: false }} shallowRouting />
    </>
  );
}

export default Providers;

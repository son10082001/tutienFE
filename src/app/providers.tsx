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
        </QueryClientProvider>
      </HeroUIProvider>
      <ProgressBar height='4px' color='#fffd00' options={{ showSpinner: false }} shallowRouting />
    </>
  );
}

export default Providers;

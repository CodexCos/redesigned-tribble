'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ToastProvider } from '@/context/ToastContext';
import { ConfirmProvider } from '@/context/ConfirmContext';

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0,
                gcTime: 5 * 60 * 1000,
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <ConfirmProvider>
                    {children}
                </ConfirmProvider>
            </ToastProvider>
        </QueryClientProvider>
    );
}


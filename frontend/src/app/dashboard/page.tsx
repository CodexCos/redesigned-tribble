'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else {
                router.push(`/${user.role}/dashboard`);
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-gray-500">Redirecting to your dashboard...</p>
        </div>
    );
}

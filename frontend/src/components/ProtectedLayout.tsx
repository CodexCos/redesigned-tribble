'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface ProtectedLayoutProps {
    children: React.ReactNode;
    allowedRoles: ('admin' | 'teacher' | 'student')[];
}

export default function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (!isLoading && user && !allowedRoles.includes(user.role)) {
            // Redirect to their own dashboard if they try to access unauthorized roles
            router.push(`/${user.role}/dashboard`);
        }
    }, [user, isLoading, router, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-gray-500 font-medium">Verifying Session...</p>
                </div>
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 ml-64 pt-16 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: Record<string, string>) => void;
    logout: () => void;
    isError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    // Query to get current user info using the httpOnly cookie
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            try {
                const res = await api.get('/auth/me');
                return res.data.data;
            } catch {
                return null;
            }
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Login Mutation
    const loginMutation = useMutation({
        mutationFn: (credentials: Record<string, string>) => api.post('/auth/login', credentials),
        onSuccess: (res: { data: { user: User } }) => {
            const userData = res.data.user;
            queryClient.setQueryData(['me'], userData);
            router.push(`/${userData.role}/dashboard`);
        },
    });

    // Logout Mutation
    const logoutMutation = useMutation({
        mutationFn: () => api.get('/auth/logout'),
        onSuccess: () => {
            queryClient.setQueryData(['me'], null);
            router.push('/login');
        },
    });

    return (
        <AuthContext.Provider value={{
            user: user || null,
            isLoading,
            isError,
            login: loginMutation.mutateAsync,
            logout: logoutMutation.mutateAsync
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

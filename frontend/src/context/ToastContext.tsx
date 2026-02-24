'use client';

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    toast: (type: ToastType, title: string, message?: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Styles per type ──────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, {
    icon: React.ElementType;
    bar: string;
    iconColor: string;
    bg: string;
    border: string;
    title: string;
}> = {
    success: {
        icon: CheckCircle2,
        bar: 'bg-emerald-500',
        iconColor: 'text-emerald-500',
        bg: 'bg-white',
        border: 'border-emerald-100',
        title: 'text-emerald-800'
    },
    error: {
        icon: XCircle,
        bar: 'bg-red-500',
        iconColor: 'text-red-500',
        bg: 'bg-white',
        border: 'border-red-100',
        title: 'text-red-800'
    },
    warning: {
        icon: AlertTriangle,
        bar: 'bg-amber-500',
        iconColor: 'text-amber-500',
        bg: 'bg-white',
        border: 'border-amber-100',
        title: 'text-amber-800'
    },
    info: {
        icon: Info,
        bar: 'bg-blue-500',
        iconColor: 'text-blue-500',
        bg: 'bg-white',
        border: 'border-blue-100',
        title: 'text-blue-800'
    },
};

// ─── Toast Item ───────────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const config = TOAST_CONFIG[toast.type];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'relative flex items-start gap-3 w-80 p-4 rounded-2xl shadow-2xl border overflow-hidden',
                'animate-in slide-in-from-right-full duration-300',
                config.bg,
                config.border
            )}
            role="alert"
        >
            {/* Left accent bar */}
            <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl', config.bar)} />

            {/* Icon */}
            <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-bold', config.title)}>{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
            </div>

            {/* Close button */}
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Auto-dismiss progress bar */}
            <div className={cn(
                'absolute bottom-0 left-0 right-0 h-0.5 animate-shrink',
                config.bar,
                'opacity-30'
            )} />
        </div>
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev.slice(-4), { id, type, title, message }]); // max 5 toasts
        setTimeout(() => removeToast(id), 4500);
    }, [removeToast]);

    const value: ToastContextType = {
        toast: addToast,
        success: (title, msg) => addToast('success', title, msg),
        error: (title, msg) => addToast('error', title, msg),
        warning: (title, msg) => addToast('warning', title, msg),
        info: (title, msg) => addToast('info', title, msg),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}

// ─── Error parser helper ──────────────────────────────────────────────────────

/**
 * Converts raw API/Axios errors into a clean, human-readable message.
 * Call this in onError handlers: parseError(err)
 */
export function parseError(err: unknown): string {
    if (!err || typeof err !== 'object') return 'Something went wrong. Please try again.';
    const e = err as {
        response?: { data?: { message?: string; errors?: Array<{ msg: string }> } };
        message?: string;
    };

    // Validation array from express-validator
    if (e.response?.data?.errors?.length) {
        return e.response.data.errors.map(v => v.msg).join('. ');
    }

    const msg = e.response?.data?.message || e.message || '';

    // Human-readable translations for common Mongoose/Mongo errors
    if (msg.includes('duplicate key') || msg.includes('E11000')) {
        if (msg.includes('email')) return 'This email address is already registered.';
        if (msg.includes('enrollmentId')) return 'This enrollment ID is already in use.';
        return 'This record already exists. Please use a unique value.';
    }
    if (msg.includes('Cast to ObjectId failed')) return 'Invalid ID format. Please check your input.';
    if (msg.includes('validation failed')) {
        // Extract field name from validation error
        const match = msg.match(/validation failed: (\w+):/);
        if (match) return `Invalid value for field: ${match[1]}.`;
        return 'Some fields have invalid values. Please check your input.';
    }
    if (msg.includes('jwt expired') || msg.includes('Unauthorized')) return 'Your session has expired. Please log in again.';
    if (msg.includes('not found') || msg.includes('Not found')) return 'The requested item was not found.';
    if (msg.includes('Network Error') || msg.includes('ECONNREFUSED')) return 'Cannot reach the server. Please check your connection.';

    return msg || 'An unexpected error occurred. Please try again.';
}

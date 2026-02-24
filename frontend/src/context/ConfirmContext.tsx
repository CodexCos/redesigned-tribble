'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((val: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setResolver(() => resolve);
        });
    }, []);

    const handleResponse = (value: boolean) => {
        resolver?.(value);
        setOptions(null);
        setResolver(null);
    };

    const VARIANT = {
        danger: {
            icon: 'bg-red-100',
            iconColor: 'text-red-600',
            btn: 'bg-red-600 hover:bg-red-700 shadow-red-100',
        },
        warning: {
            icon: 'bg-amber-100',
            iconColor: 'text-amber-600',
            btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
        },
        info: {
            icon: 'bg-blue-100',
            iconColor: 'text-blue-600',
            btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
        },
    };

    const v = VARIANT[options?.variant || 'danger'];

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {options && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 pb-4">
                            <div className={`p-3 rounded-2xl ${v.icon} flex-shrink-0`}>
                                <AlertTriangle className={`w-6 h-6 ${v.iconColor}`} />
                            </div>
                            <button
                                onClick={() => handleResponse(false)}
                                className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-6">
                            {options.title && (
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{options.title}</h3>
                            )}
                            <p className="text-sm text-gray-500 leading-relaxed">{options.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => handleResponse(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                {options.cancelLabel || 'Cancel'}
                            </button>
                            <button
                                onClick={() => handleResponse(true)}
                                className={`flex-1 py-3 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 ${v.btn}`}
                            >
                                {options.confirmLabel || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
    return ctx.confirm;
}

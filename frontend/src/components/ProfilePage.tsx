'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    User,
    Lock,
    Mail,
    Shield,
    CheckCircle2,
    AlertCircle,
    KeyRound
} from 'lucide-react';
import { useToast, parseError } from '@/context/ToastContext';

export default function ProfilePage() {
    const { user } = useAuth();
    const toast = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put('/auth/updatepassword', data),
        onSuccess: () => {
            toast.success('Security Updated', 'Your password has been successfully changed.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        },
        onError: (err: any) => {
            toast.error('Update Failed', parseError(err));
        }
    });

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Mismatch Detected', 'New passwords do not match.');
            return;
        }
        updateMutation.mutate({ currentPassword, newPassword });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity & Security</h1>
                    <p className="text-sm font-medium text-gray-500">Manage your credentials and account parameters.</p>
                </div>
                <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 border-4 border-white">
                    <User className="w-8 h-8" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center pt-4">
                                <div className="h-24 w-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-4 border-4 border-white shadow-inner">
                                    <span className="text-3xl font-black text-indigo-600">{user?.name?.charAt(0).toUpperCase()}</span>
                                </div>
                                <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
                                <span className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl mt-2 shadow-lg shadow-indigo-100">
                                    {user?.role}
                                </span>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Identifier</p>
                                    <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                        <Mail className="w-4 h-4 text-indigo-600 mr-3 opacity-60" />
                                        <span className="text-xs font-bold text-gray-700 truncate">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Tier</p>
                                    <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                        <Shield className="w-4 h-4 text-indigo-600 mr-3 opacity-60" />
                                        <span className="text-xs font-bold text-gray-700 capitalize">{user?.role} Access</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Update Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/30 overflow-hidden">
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Authentication Protocol</span>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Update security credentials</p>
                            </div>
                            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                                <KeyRound className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center ml-1">
                                        <Lock className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Current Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl p-5 text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
                                        placeholder="Verify existing credentials"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center ml-1">
                                            <KeyRound className="w-3.5 h-3.5 mr-2 text-indigo-600" /> New Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl p-5 text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
                                            placeholder="Min 6 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center ml-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Confirm New
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl p-5 text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
                                            placeholder="Match new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center text-[10px] font-bold text-gray-400 italic">
                                    <AlertCircle className="w-3.5 h-3.5 mr-2" />
                                    Requires existing session verification
                                </div>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center active:scale-[0.98]"
                                >
                                    {updateMutation.isPending ? 'Syncing...' : 'Update Security'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

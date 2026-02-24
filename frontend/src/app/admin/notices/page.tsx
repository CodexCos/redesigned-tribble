'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Bell, Plus, Trash2, Edit, X, Tag, Calendar, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notice, ApiResponse } from '@/lib/types';
import { useToast, parseError } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

const TYPE_STYLES = {
    general: 'bg-blue-50 text-blue-700 border-blue-200',
    exam: 'bg-red-50 text-red-700 border-red-200',
    holiday: 'bg-green-50 text-green-700 border-green-200',
    event: 'bg-purple-50 text-purple-700 border-purple-200',
};

const EMPTY_FORM = { title: '', content: '', type: 'general' as Notice['type'], targetSemester: '' };

export default function NoticeManagement() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const confirm = useConfirm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [formData, setFormData] = useState<typeof EMPTY_FORM>(EMPTY_FORM);

    const { data, isLoading } = useQuery<ApiResponse<Notice[]>>({
        queryKey: ['notices'],
        queryFn: async () => {
            const res = await api.get('/notices');
            return res.data;
        }
    });

    const notices = data?.data ?? [];

    const createMutation = useMutation({
        mutationFn: (payload: object) => api.post('/notices', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'], refetchType: 'all' });
            closeModal();
            toast.success('Notice Published', 'The announcement is now visible to the target audience.');
        },
        onError: (err: unknown) => toast.error('Publication Failed', parseError(err))
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: object }) => api.put(`/notices/${id}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'], refetchType: 'all' });
            closeModal();
            toast.success('Notice Updated', 'Changes have been saved and broadcasted.');
        },
        onError: (err: unknown) => toast.error('Update Failed', parseError(err))
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/notices/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'], refetchType: 'all' });
            toast.success('Notice Removed', 'The announcement has been permanently deleted.');
        },
        onError: (err: unknown) => toast.error('Deletion Failed', parseError(err))
    });

    const openCreate = () => {
        setEditingNotice(null);
        setFormData(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEdit = (notice: Notice) => {
        setEditingNotice(notice);
        setFormData({
            title: notice.title,
            content: notice.content,
            type: notice.type,
            targetSemester: notice.targetSemester ? String(notice.targetSemester) : ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setEditingNotice(null); setFormData(EMPTY_FORM); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: formData.title,
            content: formData.content,
            type: formData.type,
            ...(formData.targetSemester ? { targetSemester: Number(formData.targetSemester) } : {})
        };
        if (editingNotice) {
            updateMutation.mutate({ id: editingNotice._id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
                    <p className="text-gray-500 text-sm">Broadcast announcements to students and faculty.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-semibold"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Notice
                </button>
            </div>

            {/* Notice Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3">
                            <div className="h-4 w-3/4 bg-gray-100 rounded" />
                            <div className="h-3 w-1/3 bg-gray-50 rounded" />
                            <div className="h-16 bg-gray-50 rounded" />
                        </div>
                    ))}
                </div>
            ) : notices.length === 0 ? (
                <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                    <Bell className="w-14 h-14 mb-4 mx-auto opacity-20" />
                    <p className="font-bold uppercase tracking-wider text-sm">No notices yet.</p>
                    <p className="text-xs mt-1">Create the first notice to broadcast it to students.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {notices.map((notice: Notice) => (
                        <div key={notice._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", TYPE_STYLES[notice.type])}>
                                        <Tag className="w-3 h-3 mr-1" />{notice.type}
                                    </span>
                                    {notice.targetSemester && (
                                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                                            Sem {notice.targetSemester}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors">{notice.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{notice.content}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-xs text-gray-400">
                                    <span className="flex items-center"><User2 className="w-3 h-3 mr-1" />{notice.postedBy?.name}</span>
                                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEdit(notice)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const ok = await confirm({
                                                title: 'Permanently Delete Notice?',
                                                message: 'This action will remove the announcement from all associated student boards. This cannot be undone.',
                                                confirmLabel: 'Delete Notice',
                                                variant: 'danger'
                                            });
                                            if (ok) deleteMutation.mutate(notice._id);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 bg-indigo-600 text-white">
                            <div>
                                <h2 className="text-lg font-black">{editingNotice ? 'Edit Notice' : 'New Notice'}</h2>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Notice Board Management</p>
                            </div>
                            <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Title</label>
                                <input
                                    type="text" required
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Mid-term Exam Schedule"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Content</label>
                                <textarea
                                    required rows={4}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Detailed notice content..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Type</label>
                                    <select
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as Notice['type'] })}
                                    >
                                        <option value="general">General</option>
                                        <option value="exam">Exam</option>
                                        <option value="holiday">Holiday</option>
                                        <option value="event">Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Target Semester (optional)</label>
                                    <select
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.targetSemester}
                                        onChange={e => setFormData({ ...formData, targetSemester: e.target.value })}
                                    >
                                        <option value="">All Students</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit" disabled={isPending}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
                            >
                                {isPending ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editingNotice ? 'Update Notice' : 'Publish Notice')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

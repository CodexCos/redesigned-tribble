'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { BookOpen, Plus, Trash2, Edit, Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Subject, User, ApiResponse } from '@/lib/types';
import { useToast, parseError } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';


interface SubjectForm {
    name: string;
    semester: string;
    teacher: string;
}

const EMPTY_FORM: SubjectForm = { name: '', semester: '', teacher: '' };

export default function SubjectManagement() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const confirm = useConfirm();

    const [searchTerm, setSearchTerm] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState<SubjectForm>(EMPTY_FORM);
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: subjectsData, isLoading: subjectsLoading } = useQuery<ApiResponse<Subject[]>>({
        queryKey: ['subjects', page, searchTerm, semesterFilter],
        queryFn: async () => {
            const res = await api.get(`/subjects?page=${page}&limit=${limit}&semester=${semesterFilter === 'all' ? '' : semesterFilter}`);
            return res.data;
        }
    });

    const subjects = subjectsData?.data;
    const pagination = subjectsData?.pagination;

    const { data: teachersData } = useQuery<ApiResponse<User[]>>({
        queryKey: ['teachers'],
        queryFn: async () => {
            const res = await api.get('/users?role=teacher&limit=100');
            return res.data;
        }
    });

    const teachers = teachersData?.data;

    const createMutation = useMutation({
        mutationFn: (newSubject: { name: string; semester: number; teacher: string }) => api.post('/subjects', newSubject),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'], refetchType: 'all' });
            closeModal();
            toast.success('Subject Created', 'The new subject has been added to the curriculum.');
        },
        onError: (err: unknown) => toast.error('Failed to Create Subject', parseError(err))
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string; semester: number; teacher: string } }) =>
            api.put(`/subjects/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'], refetchType: 'all' });
            closeModal();
            toast.success('Subject Updated', 'Changes have been saved successfully.');
        },
        onError: (err: unknown) => toast.error('Failed to Update Subject', parseError(err))
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/subjects/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'], refetchType: 'all' });
            toast.success('Subject Removed', 'The subject has been deleted from the curriculum.');
        },
        onError: (err: unknown) => toast.error('Failed to Delete Subject', parseError(err))
    });

    const handleDelete = async (sub: Subject) => {
        const ok = await confirm({
            title: 'Delete Subject?',
            message: `"${sub.name}" will be permanently removed along with all its attendance records. This cannot be undone.`,
            confirmLabel: 'Delete Subject',
            variant: 'danger'
        });
        if (ok) deleteMutation.mutate(sub._id);
    };


    const openCreate = () => {
        setEditingSubject(null);
        setFormData(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEdit = (subject: Subject) => {
        setEditingSubject(subject);
        setFormData({
            name: subject.name,
            semester: String(subject.semester),
            teacher: typeof subject.teacher === 'object' ? subject.teacher._id : subject.teacher
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
        setFormData(EMPTY_FORM);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            semester: Number(formData.semester),
            teacher: formData.teacher
        };
        if (editingSubject) {
            updateMutation.mutate({ id: editingSubject._id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
            <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-100 rounded-full" /></td>
            <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-100 rounded" /></td>
            <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded ml-auto" /></td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
                    <p className="text-gray-500 text-sm">Assign subjects to teachers and semesters.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-semibold"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Subject
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                        value={semesterFilter}
                        onChange={(e) => { setSemesterFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Subject Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Subject Name</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Semester</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Assigned Teacher</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subjectsLoading ? (
                                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : subjects?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 flex flex-col items-center">
                                        <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                                        <p>No subjects found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : subjects?.map((sub: Subject) => (
                                <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{sub.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            SEM {sub.semester}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm font-semibold text-gray-600">
                                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold mr-2">
                                                {sub.teacher?.name?.charAt(0) || '?'}
                                            </div>
                                            {sub.teacher?.name || 'Unassigned'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEdit(sub)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Page <span className="text-indigo-600">{page}</span> of {pagination.pages}
                        </p>
                        <div className="flex space-x-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-white disabled:opacity-30 transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-sm shadow-indigo-100"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-white/20">
                        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-indigo-600 text-white">
                            <div>
                                <h2 className="text-lg font-black tracking-tight">{editingSubject ? 'Edit Subject' : 'New Subject'}</h2>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Curriculum Builder</p>
                            </div>
                            <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Subject Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Advanced Mathematics"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Semester</label>
                                        <select
                                            required
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        >
                                            <option value="">Choose...</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Teacher</label>
                                        <select
                                            required
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                            value={formData.teacher}
                                            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {teachers?.map((t: User) => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                            >
                                {isPending ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (editingSubject ? 'Update Subject' : 'Deploy Subject Domain')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

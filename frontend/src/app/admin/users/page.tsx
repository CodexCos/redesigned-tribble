'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Users,
    UserPlus,
    Trash2,
    Edit,
    Search,
    Filter,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User, ApiResponse } from '@/lib/types';
import { useToast, parseError } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';


type UserRole = 'admin' | 'teacher' | 'student';

interface FormState {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    semester: string;
    semesters: string;
    enrollmentId: string;
}

const EMPTY_FORM: FormState = {
    name: '',
    email: '',
    password: '',
    role: 'student',
    semester: '',
    semesters: '',
    enrollmentId: ''
};

export default function UserManagement() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const confirm = useConfirm();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
    const [page, setPage] = useState(1);
    const limit = 10;


    const { data: usersData, isLoading } = useQuery<ApiResponse<User[]>>({
        queryKey: ['users', page, searchTerm, roleFilter],
        queryFn: async () => {
            const roleQuery = roleFilter === 'all' ? '' : `&role=${roleFilter}`;
            const searchQuery = searchTerm ? `&enrollmentId=${searchTerm}` : ''; // Using searchTerm for enrollmentId as primary search
            const res = await api.get(`/users?page=${page}&limit=${limit}${roleQuery}${searchQuery}`);
            return res.data;
        }
    });

    const users = usersData?.data;
    const pagination = usersData?.pagination;

    const createMutation = useMutation({
        mutationFn: (newUser: Partial<User> & { password?: string }) => api.post('/users', newUser),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' });
            closeModal();
            toast.success('User Created', 'The new account has been set up successfully.');
        },
        onError: (err: unknown) => toast.error('Failed to Create User', parseError(err))
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => api.put(`/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' });
            closeModal();
            toast.success('User Updated', 'The account details have been saved.');
        },
        onError: (err: unknown) => toast.error('Failed to Update User', parseError(err))
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: string) => api.delete(`/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' });
            toast.success('User Removed', 'The account has been deleted.');
        },
        onError: (err: unknown) => toast.error('Failed to Delete User', parseError(err))
    });

    const handleDelete = async (u: User) => {
        const ok = await confirm({
            title: 'Delete User Account?',
            message: `This will permanently remove ${u.name}'s account and all associated data. This action cannot be undone.`,
            confirmLabel: 'Delete Account',
            variant: 'danger'
        });
        if (ok) deleteMutation.mutate(u._id);
    };

    const openCreate = () => {
        setEditingUser(null);
        setFormData(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            semester: user.semester ? String(user.semester) : '',
            semesters: user.semesters ? user.semesters.join(', ') : '',
            enrollmentId: user.enrollmentId || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData(EMPTY_FORM);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Partial<User> & { password?: string } = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            enrollmentId: formData.enrollmentId
        };
        if (formData.password) payload.password = formData.password;
        if (formData.role === 'student') payload.semester = Number(formData.semester);
        else if (formData.role === 'teacher') {
            payload.semesters = formData.semesters.split(',').map(s => Number(s.trim())).filter(s => !isNaN(s));
        }

        if (editingUser) {
            updateMutation.mutate({ id: editingUser._id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-gray-100 mr-3" />
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-100 rounded" />
                        <div className="h-3 w-32 bg-gray-50 rounded" />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-100 rounded-full" /></td>
            <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
            <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded ml-auto" /></td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 text-sm">Create and manage students, teachers, and admins.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-semibold"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="teacher">Teachers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">User Details</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Semester/Info</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : users?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 flex flex-col items-center">
                                        <Users className="w-12 h-12 mb-2 opacity-20" />
                                        <p>No users found matching your search.</p>
                                    </td>
                                </tr>
                            ) : users?.map((u: User) => (
                                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 group-hover:scale-110 transition-transform">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-bold text-gray-900">{u.name}</div>
                                                <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">{u.enrollmentId || 'No ID'}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            u.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                u.role === 'teacher' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                    "bg-green-50 text-green-700 border-green-100"
                                        )}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-600">
                                            {u.role === 'student' ? (
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">SEM {u.semester}</span>
                                            ) : u.role === 'teacher' ? (
                                                <span className="text-xs truncate max-w-[150px] inline-block">
                                                    Sems: {u.semesters?.join(', ')}
                                                </span>
                                            ) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEdit(u)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u)}
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
                                <h2 className="text-lg font-black tracking-tight">{editingUser ? 'Edit User' : 'New User Registration'}</h2>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">System Access Control</p>
                            </div>
                            <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                {formData.role === 'student' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Enrollment ID (Unique)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                            value={formData.enrollmentId}
                                            onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
                                            placeholder="e.g. STU-2024-001"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Password {editingUser && <span className="normal-case font-medium text-gray-300">(leave blank to keep current)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingUser ? '••••••••' : ''}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role Type</label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        >
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    {formData.role === 'student' && (
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
                                    )}
                                </div>

                                {formData.role === 'teacher' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Semesters (Comma-separated)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 1, 3, 5"
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                            value={formData.semesters}
                                            onChange={(e) => setFormData({ ...formData, semesters: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 space-y-3">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                                >
                                    {isPending ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            {editingUser ? 'Update User' : 'Initialize User'}
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center space-x-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Verified Academic Credential</span>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

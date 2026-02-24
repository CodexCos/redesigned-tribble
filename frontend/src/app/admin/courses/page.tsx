'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    GraduationCap,
    Plus,
    Trash2,
    Edit,
    X,
    CheckCircle2,
    Clock,
    Hash,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast, parseError } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

interface Course {
    _id: string;
    name: string;
    code: string;
    description: string;
    durationYears: number;
}

export default function CourseManagement() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const confirm = useConfirm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        durationYears: 4
    });

    const { data: coursesData, isLoading } = useQuery<{ data: Course[] }>({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await api.get('/courses');
            return res.data;
        }
    });

    const courses = coursesData?.data || [];

    const createMutation = useMutation({
        mutationFn: (newCourse: any) => api.post('/courses', newCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            closeModal();
            toast.success('Course Initialized', 'Academic program has been successfully cataloged.');
        },
        onError: (err: any) => toast.error('Creation Failed', parseError(err))
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/courses/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            closeModal();
            toast.success('Course Updated', 'Program parameters have been successfully modified.');
        },
        onError: (err: any) => toast.error('Update Failed', parseError(err))
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/courses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success('Course Removed', 'Academic program has been decommissioned.');
        },
        onError: (err: any) => toast.error('Deletion Failed', parseError(err))
    });

    const handleDelete = async (course: Course) => {
        const ok = await confirm({
            title: 'Decommission Program?',
            message: `Are you sure you want to remove the ${course.name} program? This may affect linked curriculum domains.`,
            confirmLabel: 'Decommission',
            variant: 'danger'
        });
        if (ok) deleteMutation.mutate(course._id);
    };

    const openCreate = () => {
        setEditingCourse(null);
        setFormData({ name: '', code: '', description: '', durationYears: 4 });
        setIsModalOpen(true);
    };

    const openEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            code: course.code,
            description: course.description || '',
            durationYears: course.durationYears
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCourse) {
            updateMutation.mutate({ id: editingCourse._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Program Registry</h1>
                    <p className="text-sm font-medium text-gray-500">System-wide academic courses and department configuration.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="p-5 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center group active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">New Program</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-gray-100 shadow-xl shadow-gray-100/50" />
                    ))
                ) : courses.length === 0 ? (
                    <div className="col-span-full bg-white p-20 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-6">
                        <GraduationCap className="w-20 h-20 text-gray-100" />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No academic programs registered.</p>
                    </div>
                ) : courses.map((course) => (
                    <div key={course._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/30 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-start bg-gradient-to-br from-indigo-50/10 to-transparent">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="px-2.5 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-lg tracking-widest leading-none">
                                        {course.code}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{course.durationYears} Years</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight uppercase italic">{course.name}</h3>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-inner">
                                <GraduationCap className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3 min-h-[4.5em]">
                                {course.description || "Experimental program parameters pending definitive documentation."}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex -space-x-2">
                                    <div className="h-8 w-8 rounded-xl bg-gray-50 border-2 border-white flex items-center justify-center">
                                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                    <div className="h-8 w-8 rounded-xl bg-gray-50 border-2 border-white flex items-center justify-center">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEdit(course)}
                                        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course)}
                                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[70] p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border border-white/20 overflow-hidden scale-in-center transition-all">
                        <div className="p-10 border-b border-gray-50 bg-indigo-600 flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight italic">{editingCourse ? 'Update Program' : 'Establish Program'}</h2>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Foundational Academic Parameters</p>
                            </div>
                            <button onClick={closeModal} className="bg-white/10 hover:bg-white/20 p-4 rounded-[1.5rem] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                                        <FileText className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Program Designation
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Computer Science and Engineering"
                                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                                        <Hash className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Identifier Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. CSE-24"
                                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                                        <Clock className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Duration (Years)
                                    </label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner appearance-none"
                                        value={formData.durationYears}
                                        onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>{y} {y === 1 ? 'Year' : 'Years'}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Program Abstract</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Outline the core objective of this academic track..."
                                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 disabled:opacity-50 transition-all flex items-center justify-center group active:scale-[0.98]"
                            >
                                <CheckCircle2 className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />
                                {editingCourse ? 'Commit Program Updates' : 'Initialize Program Protocol'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

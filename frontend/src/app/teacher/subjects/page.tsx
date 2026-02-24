'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    BookOpen,
    UserPlus,
    Users,
    ClipboardCheck,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Subject, User, ApiResponse } from '@/lib/types';
import { useToast, parseError } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export default function MySubjects() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [studentId, setStudentId] = useState('');
    const [searchStudentTerm, setSearchStudentTerm] = useState('');

    const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
        queryKey: ['my-subjects'],
        queryFn: async () => {
            const res = await api.get('/subjects');
            return res.data.data;
        }
    });

    const enrollMutation = useMutation({
        mutationFn: (data: { subjectId: string, studentId: string }) =>
            api.post(`/subjects/${data.subjectId}/enroll`, { studentId: data.studentId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-subjects'] });
            setIsEnrollModalOpen(false);
            setStudentId('');
            toast.success('Enrollment Confirmed', 'The student has been successfully added to this subject domain.');
        },
        onError: (err: unknown) => {
            toast.error('Enrollment Denied', parseError(err));
        }
    });

    const { data: semesterStudentsData, isLoading: semesterStudentsLoading } = useQuery<ApiResponse<User[]>>({
        queryKey: ['students-semester', selectedSubject?.semester],
        enabled: !!selectedSubject,
        queryFn: async () => {
            const res = await api.get(`/users?role=student&semester=${selectedSubject?.semester}&limit=50`);
            return res.data;
        }
    });

    const semesterStudents = semesterStudentsData?.data || [];

    const handleEnroll = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSubject && studentId) {
            enrollMutation.mutate({ subjectId: selectedSubject._id, studentId });
        }
    };

    const SubjectSkeleton = () => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="h-6 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-4 w-20 bg-gray-50 rounded-lg" />
                </div>
                <div className="h-10 w-10 bg-gray-50 rounded-xl" />
            </div>
            <div className="flex justify-between items-center py-2">
                <div className="h-4 w-24 bg-gray-50 rounded-lg" />
                <div className="h-4 w-8 bg-gray-100 rounded-lg" />
            </div>
            <div className="flex gap-3 pt-2">
                <div className="h-12 flex-1 bg-gray-50 rounded-2xl" />
                <div className="h-12 flex-1 bg-gray-100 rounded-2xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Academic Domains</h1>
                <p className="text-sm font-medium text-gray-500">Manage your assigned subjects and student enrollments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjectsLoading ? (
                    Array(6).fill(0).map((_, i) => <SubjectSkeleton key={i} />)
                ) : subjects?.length === 0 ? (
                    <div className="col-span-full bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
                        <BookOpen className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">No subjects assigned to your profile yet.</p>
                    </div>
                ) : subjects?.map((subject: Subject) => (
                    <div key={subject._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-start bg-gradient-to-br from-white via-white to-indigo-50/20">
                            <div>
                                <h3 className="font-black text-gray-900 text-lg group-hover:text-indigo-600 transition-colors tracking-tight">{subject.name}</h3>
                                <div className="flex items-center mt-3">
                                    <span className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-xl tracking-widest shadow-lg shadow-indigo-100">
                                        SEM {subject.semester}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                <Users className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled Students</span>
                                <span className="font-black text-gray-900 bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-100 text-xs">{subject.enrolledStudents?.length || 0} Members</span>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setSelectedSubject(subject);
                                        setIsEnrollModalOpen(true);
                                    }}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-4 border-2 border-indigo-600 text-indigo-600 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Enroll
                                </button>
                                <Link
                                    href={`/teacher/attendance?subject=${subject._id}`}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-4 bg-indigo-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                                >
                                    <ClipboardCheck className="w-4 h-4 mr-2" />
                                    Mark
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enrollment Modal */}
            {isEnrollModalOpen && selectedSubject && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-[60] p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/20 overflow-hidden scale-in-center transition-all">
                        <div className="p-10 border-b border-gray-50 bg-indigo-600 flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">Enroll Member</h2>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Domain: {selectedSubject.name}</p>
                            </div>
                            <button onClick={() => { setIsEnrollModalOpen(false); }} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-10 overflow-y-auto max-h-[60vh]">
                            {/* Suggested Students Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cohort Members (Sem {selectedSubject.semester})</h3>
                                    <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                        <Users className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                                        <span className="text-[9px] font-black text-indigo-600">{semesterStudents.length} Available</span>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {semesterStudentsLoading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
                                        ))
                                    ) : semesterStudents.length === 0 ? (
                                        <p className="text-[10px] text-center py-8 text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-2xl border border-dashed border-gray-200">No members found in this cohort.</p>
                                    ) : (
                                        semesterStudents.map((student: any) => {
                                            const isEnrolled = selectedSubject.enrolledStudents?.some(id =>
                                                (typeof id === 'string' ? id === student._id : (id as any)._id === student._id)
                                            );

                                            return (
                                                <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                                                    <div className="flex items-center min-w-0">
                                                        <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-indigo-600 text-xs shadow-sm mr-4 shrink-0">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-xs font-black text-gray-900 truncate tracking-tight">{student.name}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{student.enrollmentId || 'NO-ID'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => enrollMutation.mutate({ subjectId: selectedSubject._id, studentId: student._id })}
                                                        disabled={isEnrolled || enrollMutation.isPending}
                                                        className={cn(
                                                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
                                                            isEnrolled
                                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95"
                                                        )}
                                                    >
                                                        {isEnrolled ? 'Enrolled' : 'Enroll'}
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="bg-white px-4 text-gray-300">OR MANUALLY OVERRIDE</span>
                                </div>
                            </div>

                            <form onSubmit={handleEnroll} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Manual Authorization Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter system unique ID"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-300 shadow-inner"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={enrollMutation.isPending}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 disabled:opacity-50 transition-all flex items-center justify-center active:scale-[0.98]"
                                >
                                    {enrollMutation.isPending ? 'Processing Authorization...' : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 mr-3" />
                                            Authorize Enrollment
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

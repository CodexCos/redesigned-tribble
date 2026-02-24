'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import {
    Users,
    ChevronLeft,
    Share2,
    CalendarDays,
    CheckCircle,
    XCircle,
    Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Subject, User } from '@/lib/types';
import { useToast, parseError } from '@/context/ToastContext';

interface AttendanceEntry {
    studentId: string;
    name: string;
    enrollmentId?: string;
    status: 'present' | 'absent';
}

export default function MarkAttendance() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subject') || '');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);

    // Fetch Teacher's Subjects
    const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
        queryKey: ['my-subjects'],
        queryFn: async () => {
            const res = await api.get('/subjects');
            return res.data.data;
        }
    });

    // Find the current selected subject data
    const currentSubject = subjects?.find((s: Subject) => s._id === selectedSubjectId);

    // Initialize attendance entries when subject changes
    useEffect(() => {
        if (currentSubject && currentSubject.enrolledStudents) {
            const initialEntries: AttendanceEntry[] = currentSubject.enrolledStudents.map((student: User) => ({
                studentId: student._id,
                name: student.name,
                enrollmentId: student.enrollmentId,
                status: 'present'
            }));
            setAttendanceEntries(initialEntries);
        } else {
            setAttendanceEntries([]);
        }
    }, [currentSubject]);

    const markMutation = useMutation({
        mutationFn: (payload: any) => api.post('/attendance', payload),
        onSuccess: () => {
            toast.success('Attendance Recorded', 'Student participation has been successfully logged in the system.');
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        },
        onError: (err: any) => {
            toast.error('Submission Failed', parseError(err));
        }
    });

    const toggleStatus = (studentId: string) => {
        setAttendanceEntries(prev => prev.map(entry =>
            entry.studentId === studentId
                ? { ...entry, status: entry.status === 'present' ? 'absent' : 'present' }
                : entry
        ));
    };

    const handleSave = () => {
        if (!selectedSubjectId) return;

        markMutation.mutate({
            subjectId: selectedSubjectId,
            date: attendanceDate,
            entries: attendanceEntries
        });
    };

    const RowSkeleton = () => (
        <div className="px-8 py-5 flex items-center justify-between animate-pulse border-b border-gray-50">
            <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 mr-5" />
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                    <div className="h-3 w-20 bg-gray-50 rounded" />
                </div>
            </div>
            <div className="h-10 w-24 bg-gray-100 rounded-xl" />
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="flex items-center space-x-6">
                <Link href="/teacher/subjects" className="p-3 bg-white hover:bg-indigo-50 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm border border-gray-100">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Attendance Protocol</h1>
                    <p className="text-sm font-medium text-gray-500 italic">Executing daily participation audit for active cohorts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8 sticky top-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center ml-1">
                                <Share2 className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Subject Domain
                            </label>
                            <select
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer shadow-inner appearance-none"
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                            >
                                <option value="">Select Domain...</option>
                                {subjects?.map((s: Subject) => (
                                    <option key={s._id} value={s._id}>{s.name} (Sem {s.semester})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center ml-1">
                                <CalendarDays className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Audit Date
                            </label>
                            <input
                                type="date"
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <button
                                onClick={handleSave}
                                disabled={!selectedSubjectId || attendanceEntries.length === 0 || markMutation.isPending}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center justify-center active:scale-[0.98]"
                            >
                                <Save className="w-5 h-5 mr-3" />
                                {markMutation.isPending ? 'Committing...' : 'Commit Attendance'}
                            </button>
                            <p className="text-center text-[9px] font-bold text-gray-400 mt-4 uppercase tracking-[0.1em]">Verified by Academic Council</p>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="lg:col-span-3">
                    {subjectsLoading ? (
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            {Array(5).fill(0).map((_, i) => <RowSkeleton key={i} />)}
                        </div>
                    ) : !selectedSubjectId ? (
                        <div className="bg-gray-50 h-96 border-4 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 group transition-all hover:bg-indigo-50/30">
                            <Share2 className="w-20 h-20 mb-6 opacity-10 group-hover:rotate-12 transition-transform" />
                            <p className="font-black uppercase tracking-[0.2em] text-xs">Awaiting Domain Selection</p>
                            <p className="text-[10px] font-bold mt-2 italic">Select a subject from the panel to initiate the audit.</p>
                        </div>
                    ) : attendanceEntries.length === 0 ? (
                        <div className="bg-white p-16 rounded-[2.5rem] border-2 border-indigo-50 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="bg-indigo-50 p-6 rounded-[2.5rem] mb-8">
                                <Users className="w-12 h-12 text-indigo-600 opacity-40" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Cohort Vacancy Detected</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-xs mb-8 italic">No students are currently enrolled in this subject domain.</p>
                            <Link
                                href="/teacher/subjects"
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                            >
                                Manage Enrollments
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/30 overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white">
                                <div>
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{currentSubject?.name} Audit</span>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">{attendanceEntries.length} Enrolled Members</p>
                                </div>
                                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Syncing</span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {attendanceEntries.map((entry) => (
                                    <div
                                        key={entry.studentId}
                                        className={cn(
                                            "px-10 py-6 flex items-center justify-between transition-all duration-500",
                                            entry.status === 'absent' ? "bg-red-50/40" : "hover:bg-indigo-50/20"
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <div className={cn(
                                                "h-14 w-14 rounded-[1.25rem] flex items-center justify-center mr-6 text-base font-black border-4 border-white shadow-xl transition-all duration-500",
                                                entry.status === 'absent' ? "bg-red-600 text-white rotate-6 scale-110" : "bg-indigo-600 text-white"
                                            )}>
                                                {entry.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 tracking-tight">{entry.name}</p>
                                                <div className="flex items-center mt-1.5 space-x-3">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">ID: {entry.enrollmentId || 'N/A'}</p>
                                                    <span className="h-1 w-1 rounded-full bg-gray-200" />
                                                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Status: {entry.status}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleStatus(entry.studentId)}
                                            className={cn(
                                                "flex items-center space-x-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border-2 active:scale-95 shadow-lg",
                                                entry.status === 'present'
                                                    ? "bg-white text-emerald-600 border-emerald-50 hover:border-emerald-200 shadow-emerald-50"
                                                    : "bg-red-600 text-white border-red-600 shadow-red-200 scale-110"
                                            )}
                                        >
                                            {entry.status === 'present' ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Present</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    <span>Absent</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Calendar,
    BookOpen,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecord, ApiResponse } from '@/lib/types';

interface SubjectStat {
    _id: string;
    presentCount: number;
    totalClasses: number;
    percentage: number;
    subjectInfo: {
        name: string;
        semester: number;
    };
}

export default function StudentAttendance() {
    const [page, setPage] = useState(1);
    const limit = 10;

    // 1. Get Subject-wise Stats (Percentage)
    const { data: stats, isLoading: statsLoading } = useQuery<SubjectStat[]>({
        queryKey: ['student-stats'],
        queryFn: async () => {
            const res = await api.get('/attendance/stats');
            return res.data.data;
        }
    });

    // 2. Get Recent Attendance Logs with Pagination
    const { data: recordsData, isLoading: logsLoading } = useQuery<ApiResponse<AttendanceRecord[]>>({
        queryKey: ['student-logs', page],
        queryFn: async () => {
            const res = await api.get(`/attendance?page=${page}&limit=${limit}`);
            return res.data;
        }
    });

    const records = recordsData?.data;
    const pagination = recordsData?.pagination;

    // Skeleton for Stats Card
    const StatSkeleton = () => (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
            <div className="flex justify-between mb-6">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                    <div className="h-2 w-16 bg-gray-50 rounded" />
                </div>
                <div className="h-8 w-8 bg-gray-50 rounded-xl" />
            </div>
            <div className="h-10 w-20 bg-gray-100 rounded mb-4" />
            <div className="h-3 w-full bg-gray-50 rounded-full" />
        </div>
    );

    // Skeleton for History Row
    const RowSkeleton = () => (
        <tr className="animate-pulse">
            <td className="px-8 py-5"><div className="h-4 w-24 bg-gray-50 rounded" /></td>
            <td className="px-8 py-5"><div className="h-4 w-40 bg-gray-50 rounded" /></td>
            <td className="px-8 py-5"><div className="h-6 w-20 bg-gray-50 rounded-full" /></td>
            <td className="px-8 py-5"><div className="h-4 w-12 bg-gray-50 rounded" /></td>
        </tr>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Attendance Portfolio</h1>
                    <p className="text-sm font-medium text-gray-500">Analyze your academic participation and consistency.</p>
                </div>
                <div className="bg-indigo-600 px-4 py-2.5 rounded-2xl flex items-center shadow-lg shadow-indigo-200">
                    <Info className="w-4 h-4 text-indigo-100 mr-2" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Target: 75% Academic Threshold</span>
                </div>
            </div>

            {/* Subject-wise Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statsLoading ? (
                    Array(3).fill(0).map((_, i) => <StatSkeleton key={i} />)
                ) : stats?.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                        <BookOpen className="w-12 h-12 mb-3 mx-auto opacity-20" />
                        <p className="font-bold">No academic records found in current semester.</p>
                    </div>
                ) : (stats || []).map((item: SubjectStat) => {
                    const isBelowThreshold = Number(item.percentage) < 75;
                    return (
                        <div key={item._id} className={cn(
                            "bg-white rounded-3xl border-none p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group",
                            isBelowThreshold ? "bg-red-50/30" : "bg-white"
                        )}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />

                            <div className="flex justify-between items-start mb-6 relative">
                                <div>
                                    <h3 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{item.subjectInfo.name}</h3>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">SEM {item.subjectInfo.semester}</p>
                                </div>
                                {isBelowThreshold && (
                                    <div className="bg-red-600 p-2 rounded-xl border-4 border-white shadow-lg animate-bounce">
                                        <AlertTriangle className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-end justify-between mb-3 relative">
                                <span className={cn(
                                    "text-4xl font-black tracking-tighter",
                                    isBelowThreshold ? "text-red-600" : "text-indigo-600"
                                )}>
                                    {Number(item.percentage).toFixed(1)}%
                                </span>
                                <div className="text-right">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Sessions</p>
                                    <p className="text-sm font-black text-gray-900">{item.presentCount} <span className="text-gray-300 mx-0.5">/</span> {item.totalClasses}</p>
                                </div>
                            </div>

                            <div className="w-full bg-gray-100/50 h-3 rounded-full overflow-hidden relative shadow-inner">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 ease-out rounded-full",
                                        isBelowThreshold ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                                    )}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>

                            {isBelowThreshold && (
                                <p className="mt-4 text-[10px] text-red-600 font-black uppercase tracking-widest flex items-center bg-white/50 w-fit px-2 py-1 rounded-lg">
                                    Critical Condition
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Detailed History Table */}
            <div className="bg-white rounded-3xl border-none shadow-sm overflow-hidden mt-8">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Attendance Archive</h2>
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1 uppercase">Historical Participation Ledger</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-2xl">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subject Domain</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Code</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cohort</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logsLoading ? (
                                Array(5).fill(0).map((_, i) => <RowSkeleton key={i} />)
                            ) : records?.length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-400 font-black uppercase text-xs tracking-widest">No activity logs recorded.</td></tr>
                            ) : records?.map((log: AttendanceRecord) => {
                                const subjectName = typeof log.subject === 'string' ? 'Unknown' : log.subject.name;
                                const subjectSem = typeof log.subject === 'string' ? '?' : log.subject.semester;
                                return (
                                    <tr key={log._id} className="hover:bg-indigo-50/20 transition-colors group">
                                        <td className="px-8 py-5 text-xs font-black text-gray-900 uppercase">
                                            {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                            {subjectName}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-transparent shadow-sm",
                                                log.status === 'present'
                                                    ? "bg-emerald-50 text-emerald-700 shadow-emerald-100/50"
                                                    : "bg-red-50 text-red-700 shadow-red-100/50"
                                            )}>
                                                {log.status === 'present' ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <XCircle className="w-3 h-3 mr-1.5" />}
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[9px] font-black text-indigo-400 bg-indigo-50/80 border border-indigo-100/50 px-2.5 py-1 rounded-lg">SEM {subjectSem}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page <span className="text-indigo-600 font-black underline decoration-2 underline-offset-4">{page}</span> of {pagination.pages}
                        </span>
                        <div className="flex gap-3">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-5 py-2.5 border-none bg-white rounded-2xl text-[10px] font-black text-gray-600 shadow-sm hover:shadow-md disabled:opacity-30 transition-all uppercase tracking-widest"
                            >
                                Back
                            </button>
                            <button
                                disabled={page === pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-5 py-2.5 border-none bg-indigo-600 rounded-2xl text-[10px] font-black text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-30 transition-all uppercase tracking-widest"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
    BookOpen,
    Calendar,
    CircleCheck,
    AlertCircle,
    ChevronRight,
    TrendingUp,
    LayoutDashboard,
    Zap,
    Target
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/lib/types";

interface StudentSummary {
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    overallPercentage: number;
}

interface StudentStat {
    _id: string;
    presentCount: number;
    totalClasses: number;
    percentage: number;
    subjectInfo: {
        name: string;
        semester: number;
    };
}

export default function StudentDashboard() {
    const { user } = useAuth();

    // Fetch Summary
    const { data: summaryData, isLoading: summaryLoading } = useQuery<ApiResponse<StudentSummary>>({
        queryKey: ['student-summary'],
        queryFn: async () => {
            const res = await api.get('/attendance/summary');
            return res.data;
        }
    });

    const summary = summaryData?.data;

    // Fetch Subject Breakdown
    const { data: statsData, isLoading: statsLoading } = useQuery<ApiResponse<StudentStat[]>>({
        queryKey: ['student-stats'],
        queryFn: async () => {
            const res = await api.get('/attendance/stats');
            return res.data;
        }
    });

    const stats = statsData?.data;

    const isBelowGoal = (summary?.overallPercentage || 0) < 75;

    const cards = [
        {
            label: 'Consistency Score',
            value: `${Number(summary?.overallPercentage || 0).toFixed(1)}%`,
            icon: TrendingUp,
            color: isBelowGoal ? 'text-red-600' : 'text-indigo-600',
            bg: isBelowGoal ? 'bg-red-50' : 'bg-indigo-50',
            subtitle: 'Overall Attendance'
        },
        {
            label: 'Active Sessions',
            value: summary?.totalClasses || 0,
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            subtitle: 'Semester Timeline'
        },
        {
            label: 'Incident Log',
            value: summary?.absentCount || 0,
            icon: AlertCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            subtitle: 'Missing Records'
        },
    ];

    const StatSkeleton = () => (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse flex items-center space-x-6">
            <div className="bg-gray-50 h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-50 rounded" />
                <div className="h-6 w-12 bg-gray-100 rounded" />
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center italic">
                        <LayoutDashboard className="w-6 h-6 mr-3 text-indigo-600" />
                        Scholar Hub
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                        Academic Profile: {user?.name || 'Authorized Member'}
                    </p>
                </div>
                <Link
                    href="/student/attendance"
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 group"
                >
                    Full Activity Ledger
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {summaryLoading ? (
                    Array(3).fill(0).map((_, i) => <StatSkeleton key={i} />)
                ) : cards.map((card) => (
                    <div key={card.label} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/30 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn(card.bg, card.color, "p-4 rounded-2xl group-hover:rotate-6 transition-all shadow-lg shadow-current/5")}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg">{card.subtitle}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter italic">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {isBelowGoal && (
                <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-rose-200 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-6 duration-700 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="flex items-center relative z-10">
                        <div className="bg-white/20 p-4 rounded-2xl mr-6">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Compliance Alert</h3>
                            <p className="text-xs font-medium text-rose-100 mt-1 max-w-lg">Your overall participation metric is below the 75% threshold. Examination eligibility protocol may be invoked if consistency does not improve.</p>
                        </div>
                    </div>
                    <button className="bg-white text-rose-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-50 transition-all active:scale-95 flex-shrink-0 relative z-10">
                        Review Records
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Subject Progress */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center italic">
                                <Zap className="w-4 h-4 mr-2 text-indigo-600" />
                                Portfolio Breakdown
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Subject-Specific Engagement</p>
                        </div>
                        <div className="bg-indigo-50 p-2.5 rounded-xl">
                            <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>

                    <div className="space-y-8 flex-1">
                        {statsLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-3 w-32 bg-gray-50 rounded" />
                                        <div className="h-3 w-8 bg-gray-50 rounded" />
                                    </div>
                                    <div className="h-2 w-full bg-gray-50 rounded-full" />
                                </div>
                            ))
                        ) : stats?.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                                <BookOpen className="w-16 h-16 mb-4" />
                                <p className="text-xs font-black uppercase tracking-tighter">No enrollment logs</p>
                            </div>
                        ) : stats?.map((item: StudentStat) => (
                            <div key={item._id} className="group">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                    <span className="text-gray-400 group-hover:text-gray-900 transition-colors">{item.subjectInfo.name}</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md",
                                        item.percentage < 75 ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                                    )}>{Number(item.percentage).toFixed(0)}% Cap</span>
                                </div>
                                <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 ease-out",
                                            item.percentage < 75 ? "bg-rose-600" : "bg-indigo-600"
                                        )}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-12 text-white relative overflow-hidden flex flex-col justify-end min-h-[400px] shadow-2xl shadow-indigo-900/20 group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-700">
                        <CircleCheck className="w-64 h-64" />
                    </div>
                    <div className="absolute top-12 right-12 opacity-40">
                        <div className="h-24 w-24 bg-indigo-500 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10">
                        <div className="h-1 w-12 bg-indigo-500 mb-8" />
                        <h3 className="text-4xl font-black mb-6 leading-[1.1] tracking-tighter uppercase italic">Dominance through <br />Consistency.</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs italic">
                            High-frequency attendance correlates directly with cognitive retention and academic sovereignty. Sustain your metrics.
                        </p>

                        <div className="mt-12 flex gap-4">
                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                            <div className="h-2 w-2 rounded-full bg-gray-800" />
                            <div className="h-2 w-2 rounded-full bg-gray-800" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

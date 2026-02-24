'use client';

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { BookOpen, ClipboardCheck, GraduationCap, LayoutDashboard, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Subject, ApiResponse } from "@/lib/types";

export default function TeacherDashboard() {
    const { user } = useAuth();

    const { data: subjectsData, isLoading } = useQuery<ApiResponse<Subject[]>>({
        queryKey: ['my-subjects-dashboard'],
        queryFn: async () => {
            const res = await api.get('/subjects?limit=100');
            return res.data;
        }
    });

    const subjects = subjectsData?.data;

    const totalStudents = subjects?.reduce((acc: number, sub: Subject) => acc + (sub.enrolledStudents?.length || 0), 0) || 0;

    const stats = [
        {
            label: 'Assigned Domains',
            value: isLoading ? '...' : subjects?.length || 0,
            icon: BookOpen,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            trend: 'Active Curriculum'
        },
        {
            label: 'Total Cohort',
            value: isLoading ? '...' : totalStudents,
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'Verified Members'
        },
        {
            label: 'Daily Audits',
            value: isLoading ? '...' : subjects?.length || 0,
            icon: ClipboardCheck,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            trend: 'Pending Submission'
        },
    ];

    const StatSkeleton = () => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse flex items-center space-x-6">
            <div className="bg-gray-50 h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-50 rounded" />
                <div className="h-6 w-12 bg-gray-100 rounded" />
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                        <LayoutDashboard className="w-6 h-6 mr-3 text-indigo-600" />
                        Instructor Console
                    </h1>
                    <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest italic">
                        Authorized deployment for {user?.name || 'Academic Faculty'}
                    </p>
                </div>
                <div className="flex items-center bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100">
                    <Calendar className="w-4 h-4 text-indigo-600 mr-2" />
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <StatSkeleton key={i} />)
                ) : stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/30 group hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn(stat.bg, stat.color, "p-4 rounded-2xl group-hover:rotate-6 transition-all shadow-lg shadow-current/5")}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg">{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8 lg:p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">Active Domain Audit</h2>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Immediate Attention Required</p>
                        </div>
                        <Link href="/teacher/subjects" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center">
                            View All Domains <ArrowRight className="w-3 h-3 ml-1.5" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
                            ))
                        ) : subjects?.length === 0 ? (
                            <div className="p-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No active domains assigned.</p>
                            </div>
                        ) : subjects?.slice(0, 4).map((sub: Subject) => (
                            <div key={sub._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all border border-transparent hover:border-indigo-100 rounded-3xl group">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {sub.name.charAt(0)}
                                    </div>
                                    <div className="ml-5">
                                        <p className="font-black text-gray-900 tracking-tight text-sm uppercase">{sub.name}</p>
                                        <div className="flex items-center mt-1 space-x-3">
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">SEM {sub.semester}</span>
                                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{sub.enrolledStudents?.length || 0} Members</span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/teacher/attendance?subject=${sub._id}`}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                                >
                                    Initiate Audit
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />

                    <div className="relative">
                        <div className="bg-white/20 p-3 rounded-2xl w-fit mb-8">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight mb-4 uppercase">Academic Support</h2>
                        <p className="text-sm font-medium text-indigo-100 italic leading-relaxed">
                            Need assistance managing your cohorts or marking attendance for specific events?
                        </p>
                    </div>

                    <button className="relative w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95">
                        Internal Protocol Wiki
                    </button>
                </div>
            </div>
        </div>
    );
}

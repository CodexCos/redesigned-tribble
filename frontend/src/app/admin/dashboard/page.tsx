'use client';

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
    Users,
    BookOpen,
    GraduationCap,
    ShieldCheck,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Settings,
    Bell
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ApiResponse, User, Subject } from "@/lib/types";

export default function AdminDashboard() {
    const { user } = useAuth();

    // Fetch counts using existing endpoints
    const { data: teachersData, isLoading: teachersLoading } = useQuery<ApiResponse<User[]>>({
        queryKey: ['count-teachers'],
        queryFn: () => api.get('/users?role=teacher&limit=1').then(res => res.data)
    });

    const { data: studentsData, isLoading: studentsLoading } = useQuery<ApiResponse<User[]>>({
        queryKey: ['count-students'],
        queryFn: () => api.get('/users?role=student&limit=1').then(res => res.data)
    });

    const { data: subjectsData, isLoading: subjectsLoading } = useQuery<ApiResponse<Subject[]>>({
        queryKey: ['count-subjects'],
        queryFn: () => api.get('/subjects?limit=1').then(res => res.data)
    });

    const stats = [
        {
            label: 'Faculty Members',
            value: teachersLoading ? '...' : teachersData?.pagination?.total || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            description: 'Active Instructors'
        },
        {
            label: 'Student Cohort',
            value: studentsLoading ? '...' : studentsData?.pagination?.total || 0,
            icon: GraduationCap,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            description: 'Verified Scholars'
        },
        {
            label: 'Curriculum Assets',
            value: subjectsLoading ? '...' : subjectsData?.pagination?.total || 0,
            icon: BookOpen,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            description: 'Subject Domains'
        },
    ];

    const StatSkeleton = () => (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse flex items-center space-x-6">
            <div className="bg-gray-50 h-16 w-16 rounded-2xl" />
            <div className="space-y-3">
                <div className="h-3 w-24 bg-gray-50 rounded" />
                <div className="h-8 w-16 bg-gray-100 rounded" />
            </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center italic">
                        <ShieldCheck className="w-8 h-8 mr-4 text-indigo-600" />
                        Executive Oversight
                    </h1>
                    <p className="text-[11px] font-black text-gray-400 mt-2 uppercase tracking-[0.25em] flex items-center">
                        Secure Access Protocol <span className="mx-2 text-indigo-200">|</span> Authorized: {user?.name || 'Administrator'}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="h-10 w-px bg-gray-100 mx-2 hidden md:block" />
                    <div className="hidden md:flex items-center bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl shadow-gray-200">
                        <Calendar className="w-4 h-4 mr-3 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {teachersLoading || studentsLoading || subjectsLoading ? (
                    Array(3).fill(0).map((_, i) => <StatSkeleton key={i} />)
                ) : stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                        <div className="flex items-center justify-between mb-10 relative">
                            <div className={cn(stat.bg, stat.color, "p-5 rounded-2xl group-hover:rotate-12 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]")}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.description}</span>
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                        <div className="relative">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <p className="text-5xl font-black text-gray-900 tracking-tighter italic">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 lg:p-12">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">Administrative Modules</h2>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Rapid Command & Control</p>
                        </div>
                        <ArrowUpRight className="w-6 h-6 text-gray-200" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <Link href="/admin/users" className="group p-8 rounded-[2.5rem] bg-indigo-50/50 hover:bg-indigo-600 transition-all duration-500 border border-transparent hover:border-indigo-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-700 transition-colors" />
                            <Users className="w-10 h-10 text-indigo-600 group-hover:text-white mb-6 transition-colors relative z-10" />
                            <div className="relative z-10">
                                <h3 className="font-black text-gray-900 group-hover:text-white uppercase tracking-tight mb-2 transition-colors">Directory Management</h3>
                                <p className="text-xs font-medium text-gray-500 group-hover:text-indigo-100 transition-colors">Authorize faculty credentials and scholar registrations.</p>
                            </div>
                        </Link>

                        <Link href="/admin/subjects" className="group p-8 rounded-[2.5rem] bg-emerald-50/50 hover:bg-emerald-600 transition-all duration-500 border border-transparent hover:border-emerald-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600 rounded-full -mr-12 -mt-12 group-hover:bg-emerald-700 transition-colors" />
                            <BookOpen className="w-10 h-10 text-emerald-600 group-hover:text-white mb-6 transition-colors relative z-10" />
                            <div className="relative z-10">
                                <h3 className="font-black text-gray-900 group-hover:text-white uppercase tracking-tight mb-2 transition-colors">Curriculum Architect</h3>
                                <p className="text-xs font-medium text-gray-500 group-hover:text-emerald-100 transition-colors">Deploy subject domains and assign instructional faculty.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 via-gray-900 to-black rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-20" />

                    <div className="relative">
                        <div className="bg-white/10 p-4 rounded-2xl w-fit mb-10 backdrop-blur-md border border-white/10 shadow-xl">
                            <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-6 uppercase italic leading-tight">System Integrity <br />Protocol.</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                <span>Mainframe Active</span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                <span>DB Sync Optimized</span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                <span>API v1.0.4 Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-4">
                        <button className="w-full py-5 bg-white text-gray-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 transition-all active:scale-95">
                            Security Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

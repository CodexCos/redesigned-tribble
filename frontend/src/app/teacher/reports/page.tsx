'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    BarChart3,
    FileSpreadsheet,
    Filter,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TeacherReports() {
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // Fetch Teacher's Subjects
    const { data: subjects } = useQuery({
        queryKey: ['my-subjects'],
        queryFn: async () => {
            const res = await api.get('/subjects');
            return res.data.data;
        }
    });

    // Fetch attendance summary/report for the selected subject
    // We'll use the record list and group them manually or use the 
    // endpoint that returns subject-wise stats for all students
    const { data: records, isLoading } = useQuery({
        queryKey: ['attendance-report', selectedSubjectId],
        queryFn: async () => {
            if (!selectedSubjectId) return null;
            const res = await api.get(`/attendance?subject=${selectedSubjectId}`);
            return res.data.data;
        },
        enabled: !!selectedSubjectId
    });

    // Helper to process raw records into a student-wise percentage map
    const processStats = () => {
        if (!records) return [];

        const studentMap: Record<string, any> = {};

        records.forEach((record: any) => {
            const id = record.student._id;
            if (!studentMap[id]) {
                studentMap[id] = {
                    name: record.student.name,
                    id: record.student.enrollmentId,
                    total: 0,
                    present: 0
                };
            }
            studentMap[id].total += 1;
            if (record.status === 'present') {
                studentMap[id].present += 1;
            }
        });

        return Object.values(studentMap).map((s: any) => ({
            ...s,
            percentage: ((s.present / s.total) * 100).toFixed(1)
        })).sort((a, b) => Number(b.percentage) - Number(a.percentage));
    };

    const stats = processStats();

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Participation Intelligence</h1>
                    <p className="text-sm font-medium text-gray-500">Deep analytics and cohort attendance metrics.</p>
                </div>
                <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 border-4 border-white">
                    <BarChart3 className="w-8 h-8" />
                </div>
            </div>

            {/* Selector Panel */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <select
                        className="pl-12 pr-6 py-4 w-full bg-gray-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                        <option value="">Select Domain for Analytics...</option>
                        {subjects?.map((s: any) => (
                            <option key={s._id} value={s._id}>{s.name} (Semester {s.semester})</option>
                        ))}
                    </select>
                </div>
                {selectedSubjectId && (
                    <div className="flex items-center bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600 mr-3" />
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{stats.length} Active Records</span>
                    </div>
                )}
            </div>

            {/* Analytics Surface */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/30 overflow-hidden min-h-[500px]">
                {!selectedSubjectId ? (
                    <div className="flex flex-col items-center justify-center p-24 text-gray-400">
                        <div className="bg-gray-50 p-10 rounded-[3rem] mb-8 border-2 border-dashed border-gray-200">
                            <BarChart3 className="w-16 h-16 opacity-10" />
                        </div>
                        <p className="font-black uppercase tracking-[0.2em] text-xs">Awaiting Domain Input</p>
                        <p className="text-[10px] font-bold mt-2 italic text-gray-300">Select an instructional track to synthesize attendance data.</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center p-24">
                        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse">Synthesizing Metrics...</p>
                    </div>
                ) : stats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-24 text-gray-400">
                        <p className="font-black uppercase tracking-widest text-xs">No Data Points Detected</p>
                        <p className="text-[10px] font-bold mt-2">Attendance entries for this track have not been initialized.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-50">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Academic Profiling</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Engagement</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Scale</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Performance Meta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.map((student: any) => {
                                    const isLow = Number(student.percentage) < 75;
                                    return (
                                        <tr key={student.id} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center">
                                                    <div className="h-12 w-12 rounded-2xl bg-gray-50 border-2 border-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-sm mr-5 group-hover:scale-110 transition-transform">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase italic">{student.name}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">UID: {student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className={cn(
                                                    "inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black border",
                                                    isLow ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                )}>
                                                    {student.present} PRESENCES
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="text-xs font-black text-gray-400 tracking-widest">{student.total} SESSIONS</p>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-6">
                                                    <div className="text-right">
                                                        <p className={cn(
                                                            "text-lg font-black italic tracking-tighter",
                                                            isLow ? "text-red-600" : "text-emerald-600"
                                                        )}>
                                                            {student.percentage}%
                                                        </p>
                                                        <div className="h-1.5 w-32 bg-gray-100 rounded-full mt-1.5 overflow-hidden shadow-inner">
                                                            <div
                                                                className={cn(
                                                                    "h-full transition-all duration-1000 ease-out",
                                                                    isLow ? "bg-red-500" : "bg-emerald-500 shadow-lg shadow-emerald-200"
                                                                )}
                                                                style={{ width: `${student.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

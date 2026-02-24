'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Bell, Tag, Calendar, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notice, ApiResponse } from '@/lib/types';

const TYPE_STYLES: Record<Notice['type'], string> = {
    general: 'bg-blue-50 text-blue-700 border-blue-200',
    exam: 'bg-red-50 text-red-700 border-red-200',
    holiday: 'bg-green-50 text-green-700 border-green-200',
    event: 'bg-purple-50 text-purple-700 border-purple-200',
};

const TYPE_ACCENT: Record<Notice['type'], string> = {
    general: 'border-l-blue-500',
    exam: 'border-l-red-500',
    holiday: 'border-l-green-500',
    event: 'border-l-purple-500',
};

export default function StudentNotices() {
    const { data, isLoading } = useQuery<ApiResponse<Notice[]>>({
        queryKey: ['notices-student'],
        queryFn: async () => {
            const res = await api.get('/notices');
            return res.data;
        }
    });

    const notices = data?.data ?? [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notice Board</h1>
                    <p className="text-sm font-medium text-gray-500">Official announcements from administration and faculty.</p>
                </div>
                <div className="flex items-center bg-indigo-600 px-4 py-2.5 rounded-2xl shadow-lg shadow-indigo-200">
                    <Bell className="w-4 h-4 text-indigo-100 mr-2" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{notices.length} Active Notice{notices.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3">
                            <div className="h-4 w-3/4 bg-gray-100 rounded" />
                            <div className="h-3 w-1/3 bg-gray-50 rounded" />
                            <div className="h-16 bg-gray-50 rounded" />
                        </div>
                    ))}
                </div>
            ) : notices.length === 0 ? (
                <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                    <Bell className="w-14 h-14 mb-4 mx-auto opacity-20" />
                    <p className="font-bold uppercase tracking-wider text-sm">No notices at this time.</p>
                    <p className="text-xs mt-1">Check back later for announcements from your administration.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notices.map((notice: Notice) => (
                        <div
                            key={notice._id}
                            className={cn(
                                "bg-white rounded-2xl border border-gray-100 border-l-4 shadow-sm hover:shadow-md transition-all p-6",
                                TYPE_ACCENT[notice.type]
                            )}
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", TYPE_STYLES[notice.type])}>
                                        <Tag className="w-3 h-3 mr-1" />{notice.type}
                                    </span>
                                    {notice.targetSemester && (
                                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                                            Semester {notice.targetSemester}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                    {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2">{notice.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{notice.content}</p>
                            <div className="mt-4 flex items-center space-x-2 text-xs text-gray-400">
                                <User2 className="w-3.5 h-3.5" />
                                <span>Posted by <span className="font-semibold text-gray-600">{notice.postedBy?.name}</span></span>
                                <span className="text-gray-200">•</span>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

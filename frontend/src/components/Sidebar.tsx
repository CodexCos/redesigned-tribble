'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardCheck,
    LogOut,
    UserCircle,
    BarChart3,
    Bell,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Manage Courses', href: '/admin/courses', icon: GraduationCap },
    { name: 'Manage Subjects', href: '/admin/subjects', icon: BookOpen },
    { name: 'Notice Board', href: '/admin/notices', icon: Bell },
    { name: 'Profile Settings', href: '/admin/profile', icon: UserCircle },
];

const teacherLinks = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Mark Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
    { name: 'Attendance Reports', href: '/teacher/reports', icon: BarChart3 },
    { name: 'My Subjects', href: '/teacher/subjects', icon: BookOpen },
    { name: 'Profile Settings', href: '/teacher/profile', icon: UserCircle },
];

const studentLinks = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Attendance History', href: '/student/attendance', icon: ClipboardCheck },
    { name: 'Notice Board', href: '/student/notices', icon: Bell },
    { name: 'Profile Settings', href: '/student/profile', icon: UserCircle },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const links = user.role === 'admin'
        ? adminLinks
        : user.role === 'teacher'
            ? teacherLinks
            : studentLinks;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col pt-16 z-40">
            <div className="flex-1 px-4 space-y-2 py-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2 mb-4">
                    <UserCircle className="w-8 h-8 text-gray-400" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                    </div>
                </div>
                <button
                    onClick={() => logout()}
                    className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    semester?: number;
    semesters?: number[];
    enrollmentId?: string;
}

export interface Subject {
    _id: string;
    name: string;
    semester: number;
    teacher: User;
    enrolledStudents?: User[];
}

export interface AttendanceRecord {
    _id: string;
    student: User | string;
    subject: Subject | string;
    date: string;
    status: 'present' | 'absent';
}

export interface PaginationData {
    total: number;
    page: number;
    pages: number;
}

export interface Notice {
    _id: string;
    title: string;
    content: string;
    type: 'general' | 'exam' | 'holiday' | 'event';
    postedBy: User;
    targetSemester?: number;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    count?: number;
    pagination?: PaginationData;
    data: T;
}

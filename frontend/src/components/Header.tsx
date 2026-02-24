'use client';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-8 z-50">
            <h1 className="text-xl font-bold text-indigo-600">SRS COLLEGE</h1>
            <div className="ml-auto flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 text-xs font-bold">JD</span>
                </div>
            </div>
        </header>
    );
}

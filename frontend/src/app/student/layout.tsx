import ProtectedLayout from "@/components/ProtectedLayout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedLayout allowedRoles={['student']}>
            {children}
        </ProtectedLayout>
    );
}

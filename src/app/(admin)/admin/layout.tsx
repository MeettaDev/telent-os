import { AppHeader } from "@/common/components/AppHeader";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader variant="admin" />
        {children}
      </div>
    </div>
  );
}

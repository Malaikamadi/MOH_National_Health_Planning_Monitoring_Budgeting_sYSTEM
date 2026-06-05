import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { QueryProvider } from '@/lib/query-client';
import { AuthProvider } from '@/lib/auth-context';
import { RouteGuard } from '@/components/layout/route-guard';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouteGuard>
          <div className="flex min-h-screen bg-gradient-subtle dark:bg-none dark:bg-slate-950">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <main className="flex-1 p-6 lg:p-8">{children}</main>
            </div>
          </div>
        </RouteGuard>
      </AuthProvider>
    </QueryProvider>
  );
}

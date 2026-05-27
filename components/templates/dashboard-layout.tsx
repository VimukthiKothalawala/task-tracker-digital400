import { Navbar } from "@/components/organisms/navbar";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  onLogout?: () => void;
}

export function DashboardLayout({
  children,
  userEmail,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userEmail={userEmail} onLogout={onLogout || (() => {})} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

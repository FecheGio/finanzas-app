import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <div className="flex-1 pb-24 md:pb-0">
          <div className="w-full max-w-2xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

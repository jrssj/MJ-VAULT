import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { await requireAdmin(); return <div className="min-h-screen bg-[#f2efe9]"><AdminSidebar/><main className="min-h-screen px-4 py-16 lg:ml-64 lg:px-10 lg:py-10">{children}</main></div>; }

import { useState } from "react";
import { Navigate } from "react-router";
import { ShieldCheck, Users, Flag, Trash2, Lock, Unlock, Crown } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

type Tab = "overview" | "content" | "reports" | "users";

export default function AdminCenter() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [tab, setTab] = useState<Tab>("overview");
  const isAdmin = user?.role === "admin";
  const canModerate = isAdmin || user?.role === "moderator";
  const utils = trpc.useUtils();
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: canModerate });
  const content = trpc.admin.content.useQuery(undefined, { enabled: canModerate });
  const reports = trpc.admin.reports.useQuery(undefined, { enabled: canModerate });
  const users = trpc.admin.users.useQuery(undefined, { enabled: isAdmin });
  const deleteContent = trpc.admin.deleteContent.useMutation({ onSuccess: () => { void utils.admin.content.invalidate(); void utils.admin.overview.invalidate(); } });
  const resolveReport = trpc.admin.resolveReport.useMutation({ onSuccess: () => { void utils.admin.reports.invalidate(); void utils.admin.overview.invalidate(); } });
  const setStatus = trpc.admin.setUserStatus.useMutation({ onSuccess: () => { void utils.admin.users.invalidate(); } });
  const setRole = trpc.admin.setUserRole.useMutation({ onSuccess: () => { void utils.admin.users.invalidate(); } });

  if (isLoading) return null;
  if (!canModerate) return <Navigate to="/dashboard" replace />;

  const tabs: Array<{ id: Tab; label: string; icon: typeof ShieldCheck; adminOnly?: boolean }> = [
    { id: "overview", label: "Overview", icon: ShieldCheck },
    { id: "content", label: "Content queue", icon: Trash2 },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "users", label: "Users", icon: Users, adminOnly: true },
  ];

  return (
    <AppLayout>
      <main className="px-4 pt-6 pb-8">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#6366F1]/20 flex items-center justify-center"><Crown className="text-[#A5B4FC]" size={22} /></div>
            <div><p className="text-xs uppercase tracking-widest text-[#A5B4FC]">{isAdmin ? "Super admin" : "Trust & safety"}</p><h1 className="text-2xl font-bold">Control center</h1></div>
          </div>
          <p className="text-sm text-gray-400 mt-3">Keep the campus marketplace, conversations, and community healthy.</p>
        </header>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {tabs.filter((item) => !item.adminOnly || isAdmin).map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${tab === item.id ? "border-[#6366F1] bg-[#6366F1]/15 text-white" : "border-white/10 text-gray-400"}`}>
              <item.icon size={15} />{item.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <section className="grid grid-cols-2 gap-3">
          {Object.entries(overview.data ?? {}).map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-[#151B2A] p-4"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500 capitalize mt-1">{label.replace(/([A-Z])/g, " $1")}</p></div>)}
          <div className="col-span-2 rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 p-4"><p className="text-sm font-semibold">{isAdmin ? "Full platform authority" : "Moderation scope"}</p><p className="text-xs text-gray-400 mt-1">{isAdmin ? "Manage roles, suspend accounts, resolve reports, and edit or remove platform content." : "Review reports, suspend unsafe accounts, and remove harmful content. Role management remains admin-only."}</p></div>
        </section>}

        {tab === "content" && <section className="space-y-2"><h2 className="text-sm font-semibold text-gray-300 mb-3">Recent platform activity</h2>{content.data?.map((item) => <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#151B2A] p-3"><div className="min-w-0 flex-1"><p className="text-sm truncate">{item.title}</p><p className="text-[11px] text-gray-500 capitalize">{item.type} · {item.createdAt.toLocaleDateString()}</p></div><button title="Remove content" onClick={() => deleteContent.mutate({ type: item.type, id: item.id, reason: "Removed by moderation" })} className="p-2 rounded-lg text-red-300 hover:bg-red-400/10"><Trash2 size={16} /></button></div>)}{!content.data?.length && <p className="text-sm text-gray-500">No content found.</p>}</section>}

        {tab === "reports" && <section className="space-y-2"><h2 className="text-sm font-semibold text-gray-300 mb-3">Report inbox</h2>{reports.data?.map((report) => <div key={report.id} className="rounded-xl border border-white/10 bg-[#151B2A] p-4"><div className="flex justify-between gap-3"><div><p className="text-sm font-medium capitalize">{report.targetType} #{report.targetId}</p><p className="text-xs text-gray-400 mt-1">{report.reason}</p></div><span className="text-[10px] uppercase text-amber-300">{report.status}</span></div>{report.status !== "resolved" && report.status !== "dismissed" && <div className="flex gap-2 mt-3"><button onClick={() => resolveReport.mutate({ reportId: report.id, status: "resolved", resolution: "Reviewed by campus safety" })} className="rounded-md bg-[#10B981]/15 px-3 py-1.5 text-xs text-[#6EE7B7]">Resolve</button><button onClick={() => resolveReport.mutate({ reportId: report.id, status: "dismissed" })} className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-gray-300">Dismiss</button></div>}</div>)}{!reports.data?.length && <p className="text-sm text-gray-500">No reports in the inbox.</p>}</section>}

        {tab === "users" && isAdmin && <section className="space-y-2"><h2 className="text-sm font-semibold text-gray-300 mb-3">Account administration</h2>{users.data?.map((managedUser) => <div key={managedUser.id} className="rounded-xl border border-white/10 bg-[#151B2A] p-3"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="text-sm truncate">{managedUser.name || managedUser.email}</p><p className="text-xs text-gray-500 truncate">{managedUser.email} · {managedUser.status}</p></div><select value={managedUser.role} disabled={managedUser.id === user.id} onChange={(event) => setRole.mutate({ userId: managedUser.id, role: event.target.value as "user" | "moderator" | "admin" })} className="rounded-md border border-white/10 bg-[#0B0F1A] px-2 py-1 text-xs"><option value="user">User</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select><button title={managedUser.status === "active" ? "Suspend account" : "Restore account"} disabled={managedUser.id === user.id} onClick={() => setStatus.mutate({ userId: managedUser.id, status: managedUser.status === "active" ? "suspended" : "active", note: managedUser.status === "active" ? "Suspended from control center" : "Account restored" })} className="p-2 rounded-lg text-gray-300 hover:bg-white/10">{managedUser.status === "active" ? <Lock size={16} /> : <Unlock size={16} />}</button></div></div>)}</section>}
      </main>
    </AppLayout>
  );
}
import { Layout } from "@/components/layout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey, useGetApplications, getGetApplicationsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Users, Building2, FileText, ArrowRight, Activity, Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-sky-100 text-sky-700",
  shortlisted: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() },
  });
  const { data: myApplications, isLoading: appsLoading } = useGetApplications({}, {
    query: { queryKey: getGetApplicationsQueryKey({}) },
  });

  return (
    <Layout>
      <div className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-teal-200 mt-1">Overview of Healthcare Launchpad activity</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : (
            <>
              <StatTile icon={Briefcase} label="Open Positions" value={stats?.totalJobs ?? 0} href="/jobs" color="text-teal-600" bg="bg-teal-50" />
              <StatTile icon={Users} label="Student Profiles" value={stats?.totalStudents ?? 0} href="/candidates" color="text-sky-600" bg="bg-sky-50" />
              <StatTile icon={Building2} label="Employers" value={stats?.totalEmployers ?? 0} href="/employers" color="text-indigo-600" bg="bg-indigo-50" />
              <StatTile icon={FileText} label="Applications" value={stats?.totalApplications ?? 0} href="/my-applications" color="text-emerald-600" bg="bg-emerald-50" />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Applications */}
          <div className="lg:col-span-2 bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 text-lg">My Applications</h2>
              <Link href="/my-applications">
                <Button variant="ghost" size="sm" className="text-teal-600" data-testid="button-view-my-applications">
                  View All <ArrowRight className="ml-1 w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            {appsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : !myApplications?.length ? (
              <div className="text-center py-10 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm text-slate-500">No applications yet</p>
                <Link href="/jobs">
                  <Button size="sm" className="mt-3 bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-find-jobs">
                    Find Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myApplications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100" data-testid={`row-application-${app.id}`}>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{app.job?.title ?? `Job #${app.jobId}`}</p>
                      <p className="text-xs text-slate-500">{app.job?.company}</p>
                    </div>
                    <Badge className={STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-600"}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-teal-600" />
              <h2 className="font-semibold text-slate-900 text-lg">Recent Activity</h2>
            </div>
            {activityLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            ) : !activity?.length ? (
              <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start" data-testid={`activity-item-${item.id}`}>
                    <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-snug">{item.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown charts */}
        {!statsLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            <BreakdownCard
              title="Jobs by Specialty"
              data={stats?.jobsBySpecialty ?? []}
              labelKey="specialty"
              countKey="count"
              labels={{ nursing: "Nursing", "medical-assistant": "Medical Asst.", emt: "EMT / EMS", radiology: "Radiology", pharmacy: "Pharmacy", administration: "Admin", other: "Other" }}
            />
            <BreakdownCard
              title="Applications by Status"
              data={stats?.applicationsByStatus ?? []}
              labelKey="status"
              countKey="count"
              labels={{ pending: "Pending", reviewed: "Reviewed", shortlisted: "Shortlisted", rejected: "Rejected", accepted: "Accepted" }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatTile({ icon: Icon, label, value, href, color, bg }: {
  icon: React.ElementType; label: string; value: number; href: string; color: string; bg: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white border border-border rounded-xl p-5 hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer" data-testid={`stat-tile-${label.toLowerCase().replace(/\s/g, "-")}`}>
        <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      </div>
    </Link>
  );
}

function BreakdownCard({ title, data, labelKey, countKey, labels }: {
  title: string;
  data: Record<string, string | number>[];
  labelKey: string;
  countKey: string;
  labels: Record<string, string>;
}) {
  const total = data.reduce((sum, d) => sum + Number(d[countKey]), 0);
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400">No data yet</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const pct = total > 0 ? Math.round((Number(item[countKey]) / total) * 100) : 0;
            return (
              <div key={String(item[labelKey])}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{labels[String(item[labelKey])] ?? item[labelKey]}</span>
                  <span className="font-medium text-slate-800">{item[countKey]}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

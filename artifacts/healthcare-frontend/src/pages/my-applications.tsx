import { Layout } from "@/components/layout";
import { useGetApplications, getGetApplicationsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Clock, ArrowRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-sky-100 text-sky-700",
  shortlisted: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
};

const SPECIALTY_LABELS: Record<string, string> = {
  nursing: "Nursing", "medical-assistant": "Medical Assistant", emt: "EMT / EMS",
  radiology: "Radiology", pharmacy: "Pharmacy", administration: "Administration", other: "Other",
};

export default function MyApplicationsPage() {
  const { data: applications, isLoading } = useGetApplications({}, {
    query: { queryKey: getGetApplicationsQueryKey({}) },
  });

  const groupedByStatus = {
    pending: applications?.filter((a) => a.status === "pending") ?? [],
    reviewed: applications?.filter((a) => a.status === "reviewed") ?? [],
    shortlisted: applications?.filter((a) => a.status === "shortlisted") ?? [],
    accepted: applications?.filter((a) => a.status === "accepted") ?? [],
    rejected: applications?.filter((a) => a.status === "rejected") ?? [],
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-teal-200 mt-1">Track your submitted applications and their status</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : !applications?.length ? (
          <div className="text-center py-16 bg-white border border-border rounded-xl">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">No applications yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-4">Browse open positions and apply to get started</p>
            <Link href="/jobs">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-browse-jobs">
                Browse Jobs <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Object.entries(groupedByStatus).map(([status, apps]) => (
                <div key={status} className="bg-white border border-border rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-slate-900">{apps.length}</div>
                  <Badge className={`${STATUS_COLORS[status]} text-xs mt-1`}>{status}</Badge>
                </div>
              ))}
            </div>

            {/* Application list */}
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-border rounded-xl p-5 hover:border-teal-200 transition-colors"
                  data-testid={`card-application-${app.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {app.job?.title ?? `Job #${app.jobId}`}
                        </h3>
                        <Badge className={STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-600"}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-sm">{app.job?.company}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-2">
                        {app.job?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {app.job.location}
                          </span>
                        )}
                        {app.job?.specialty && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {SPECIALTY_LABELS[app.job.specialty] ?? app.job.specialty}
                          </span>
                        )}
                        <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                      {app.coverLetter && (
                        <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">{app.coverLetter}</p>
                      )}
                    </div>
                    {app.jobId && (
                      <Link href={`/jobs/${app.jobId}`}>
                        <Button variant="ghost" size="sm" className="text-teal-600 shrink-0" data-testid={`button-view-job-${app.id}`}>
                          View Job <ArrowRight className="ml-1 w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

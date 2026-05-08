import { Layout } from "@/components/layout";
import { useGetJob, getGetJobQueryKey, useCreateApplication, getGetApplicationsQueryKey } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  MapPin, Clock, Building2, Stethoscope, ArrowLeft, CheckCircle, DollarSign,
} from "lucide-react";
import { useState } from "react";

const SPECIALTY_LABELS: Record<string, string> = {
  nursing: "Nursing", "medical-assistant": "Medical Assistant", emt: "EMT / EMS",
  radiology: "Radiology", pharmacy: "Pharmacy", administration: "Administration", other: "Other",
};
const TYPE_COLORS: Record<string, string> = {
  internship: "bg-teal-100 text-teal-700",
  "part-time": "bg-sky-100 text-sky-700",
  "full-time": "bg-indigo-100 text-indigo-700",
  clinical: "bg-emerald-100 text-emerald-700",
};

export default function JobDetailPage({ id }: { id: number }) {
  const { data: job, isLoading } = useGetJob(id, {
    query: { enabled: !!id, queryKey: getGetJobQueryKey(id) },
  });
  const { isSignedIn } = useUser();
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const applyMutation = useCreateApplication();

  function handleApply() {
    applyMutation.mutate(
      { data: { jobId: id, coverLetter: coverLetter || null } },
      {
        onSuccess: () => {
          setApplied(true);
          queryClient.invalidateQueries({ queryKey: getGetApplicationsQueryKey() });
          toast({ title: "Application submitted!", description: "We'll notify you of any updates." });
        },
        onError: () => {
          toast({ title: "Could not apply", description: "Please ensure your profile is complete.", variant: "destructive" });
        },
      },
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="mb-6 text-slate-500" data-testid="button-back-to-jobs">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Jobs
          </Button>
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : !job ? (
          <div className="text-center py-16 text-slate-400">
            <p className="font-medium text-slate-600">Job not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope className="w-7 h-7 text-teal-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900" data-testid="text-job-title">{job.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 font-medium">{job.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={TYPE_COLORS[job.type] ?? "bg-slate-100 text-slate-600"}>
                    {job.type}
                  </Badge>
                  {job.isFeatured && (
                    <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500 pt-4 border-t border-border">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> {SPECIALTY_LABELS[job.specialty] ?? job.specialty}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1.5 text-teal-600 font-medium">
                    <DollarSign className="w-4 h-4" /> {job.salary}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="font-semibold text-slate-900 text-lg mb-3">About This Position</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.requirements && (
              <div className="bg-white border border-border rounded-xl p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-3">Requirements</h2>
                <p className="text-slate-600 leading-relaxed">{job.requirements}</p>
              </div>
            )}

            <div className="bg-white border border-border rounded-xl p-6">
              {applied ? (
                <div className="flex items-center gap-3 text-teal-700">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Application submitted!</p>
                    <p className="text-sm text-teal-600">Track your status in My Applications.</p>
                  </div>
                </div>
              ) : isSignedIn ? (
                <div>
                  <h2 className="font-semibold text-slate-900 text-lg mb-3">Apply for This Position</h2>
                  <Textarea
                    placeholder="Add a brief cover letter (optional)..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    className="mb-4"
                    data-testid="textarea-cover-letter"
                  />
                  <Button
                    onClick={handleApply}
                    disabled={applyMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
                    data-testid="button-apply"
                  >
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-600 mb-4">Sign in to apply for this position</p>
                  <Link href="/sign-in">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-sign-in-to-apply">
                      Sign In to Apply
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

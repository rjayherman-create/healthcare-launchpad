import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetJobs, getGetJobsQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Search, Stethoscope, X } from "lucide-react";

const TYPE_OPTIONS = ["internship", "part-time", "full-time", "clinical"];
const SPECIALTY_OPTIONS = [
  "nursing", "medical-assistant", "emt", "radiology", "pharmacy", "administration", "other",
];
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

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("");

  const params = {
    ...(search ? { search } : {}),
    ...(type ? { type } : {}),
    ...(specialty ? { specialty } : {}),
  };

  const { data: jobs, isLoading } = useGetJobs(params, {
    query: { queryKey: getGetJobsQueryKey(params) },
  });

  const hasFilters = search || type || specialty;

  function clearFilters() {
    setSearch("");
    setType("");
    setSpecialty("");
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Healthcare Opportunities</h1>
          <p className="text-teal-200">Internships, clinical placements, and careers across Long Island</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white border border-border rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search jobs, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-jobs"
            />
          </div>
          <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? "" : v)}>
            <SelectTrigger className="w-40" data-testid="select-job-type">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={specialty || "all"} onValueChange={(v) => setSpecialty(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48" data-testid="select-specialty">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {SPECIALTY_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{SPECIALTY_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500" data-testid="button-clear-filters">
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-slate-500 mb-4" data-testid="text-job-count">
            {jobs?.length ?? 0} position{jobs?.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Job cards */}
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : jobs?.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">No positions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {(jobs ?? []).map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div
                  className="bg-white border border-border rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  data-testid={`card-job-${job.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors text-base">
                          {job.title}
                        </h3>
                        <p className="text-slate-500 text-sm">{job.company}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {SPECIALTY_LABELS[job.specialty] ?? job.specialty}
                          </span>
                          {job.salary && (
                            <span className="text-teal-600 font-medium">{job.salary}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={TYPE_COLORS[job.type] ?? "bg-slate-100 text-slate-600"}>
                        {job.type}
                      </Badge>
                      {job.isFeatured && (
                        <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

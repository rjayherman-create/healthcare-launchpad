import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout";
import { useGetFeaturedJobs, useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Clock,
  Stethoscope,
  Building2,
  Users,
  Briefcase,
  ArrowRight,
  Star,
  ShieldCheck,
  Zap,
} from "lucide-react";

const SPECIALTY_LABELS: Record<string, string> = {
  nursing: "Nursing",
  "medical-assistant": "Medical Assistant",
  emt: "EMT / EMS",
  radiology: "Radiology",
  pharmacy: "Pharmacy",
  administration: "Administration",
  other: "Other",
};

const TYPE_COLORS: Record<string, string> = {
  internship: "bg-teal-100 text-teal-700",
  "part-time": "bg-sky-100 text-sky-700",
  "full-time": "bg-indigo-100 text-indigo-700",
  clinical: "bg-emerald-100 text-emerald-700",
};

export default function LandingPage() {
  const { data: featuredJobs, isLoading: jobsLoading } = useGetFeaturedJobs();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge className="bg-teal-900/40 text-teal-100 border-teal-400/30 mb-4 px-3 py-1 text-sm">
              Long Island, NY Healthcare Careers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Launch Your
              <br />
              <span className="text-teal-200">Healthcare Career</span>
            </h1>
            <p className="text-lg md:text-xl text-teal-100 max-w-xl mb-8 leading-relaxed">
              Find internships, clinical placements, and healthcare jobs across Long Island.
              Built for students, powered by local hospitals and clinics.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/jobs">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-6" data-testid="button-browse-jobs">
                  Browse Opportunities
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-teal-600 font-semibold px-6" data-testid="button-for-employers">
                  For Employers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))
            ) : (
              <>
                <StatCard icon={Briefcase} label="Open Positions" value={stats?.totalJobs ?? 0} color="text-teal-600" />
                <StatCard icon={Users} label="Student Profiles" value={stats?.totalStudents ?? 0} color="text-sky-600" />
                <StatCard icon={Building2} label="Employers" value={stats?.totalEmployers ?? 0} color="text-indigo-600" />
                <StatCard icon={Stethoscope} label="Applications" value={stats?.totalApplications ?? 0} color="text-emerald-600" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
              <p className="text-slate-500 mt-1">Top positions from leading Long Island healthcare organizations</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="hidden sm:flex" data-testid="button-view-all-jobs">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(featuredJobs ?? []).map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div
                    className="bg-white rounded-xl border border-border p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200 cursor-pointer group h-full flex flex-col"
                    data-testid={`card-job-${job.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-teal-600" />
                      </div>
                      <Badge className={TYPE_COLORS[job.type] ?? "bg-slate-100 text-slate-600"}>
                        {job.type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors text-base mb-1 leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-3">{job.company}</p>
                    <div className="mt-auto flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {SPECIALTY_LABELS[job.specialty] ?? job.specialty}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Why Healthcare Launchpad?</h2>
            <p className="text-slate-500 mt-2">Purpose-built for the Long Island healthcare community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={Star}
              title="Specialized Platform"
              description="Every listing is healthcare-specific. Filter by specialty, location, and type to find exactly what you need."
              color="text-teal-600"
              bg="bg-teal-50"
            />
            <ValueCard
              icon={ShieldCheck}
              title="Verified Employers"
              description="Hospitals, clinics, and healthcare organizations post directly. No generic job boards or middlemen."
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
            <ValueCard
              icon={Zap}
              title="One-Click Apply"
              description="Build your profile once and apply to any position instantly. Track your applications in real time."
              color="text-sky-600"
              bg="bg-sky-50"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start your healthcare career?</h2>
          <p className="text-teal-200 mb-8 text-lg">
            Join hundreds of students and healthcare organizations on Long Island's dedicated healthcare career platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-semibold" data-testid="button-join-student">
                I'm a Student
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-teal-600 font-semibold" data-testid="button-join-employer">
                I'm an Employer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
  color,
  bg,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="text-center">
      <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

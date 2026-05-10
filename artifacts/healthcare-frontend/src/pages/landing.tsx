import type { ElementType } from "react";
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
  ShieldCheck,
  Zap,
  HeartPulse,
  Bookmark,
  Check,
  CircleUserRound,
  Search,
  Send,
  UserPlus,
  ClipboardList,
  BadgeCheck,
  MapPinned,
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
  internship: "bg-violet-100 text-violet-700 border-violet-200",
  "part-time": "bg-slate-100 text-slate-600 border-slate-200",
  "full-time": "bg-cyan-100 text-cyan-700 border-cyan-200",
  clinical: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

type LandingJob = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  type: string;
  specialty: string;
};

const SAMPLE_JOBS = [
  {
    id: "sample-patient-care",
    title: "Patient Care Assistant",
    company: "Northwell Health",
    location: "New Hyde Park, NY",
    type: "full-time",
    specialty: "medical-assistant",
  },
  {
    id: "sample-medical-office",
    title: "Medical Office Intern",
    company: "NYU Langone Health",
    location: "Mineola, NY",
    type: "internship",
    specialty: "administration",
  },
  {
    id: "sample-nursing-trainee",
    title: "Nursing Assistant Trainee",
    company: "Catholic Health",
    location: "Hicksville, NY",
    type: "clinical",
    specialty: "nursing",
  },
];

export default function LandingPage() {
  const { data: featuredJobs, isLoading: jobsLoading } = useGetFeaturedJobs();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const jobs = featuredJobs?.length ? featuredJobs.slice(0, 3) : SAMPLE_JOBS;
  const liveJobs = jobs.slice(0, 4);

  return (
    <Layout headerTone="dark">
      <section className="relative overflow-hidden bg-[#06131d] text-white">
        <img
          src="/healthcare-hero.png"
          alt=""
          className="absolute inset-y-0 left-[32%] hidden h-full w-[34%] object-cover object-center opacity-85 lg:block"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_30%,rgba(34,211,238,0.22),transparent_31%),linear-gradient(90deg,#06131d_0%,rgba(6,19,29,0.9)_31%,rgba(6,19,29,0.48)_47%,rgba(6,19,29,0.72)_63%,#06131d_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-20">
          <div className="flex min-h-[520px] flex-col justify-center">
            <Badge className="mb-5 w-fit border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
              Long Island, NY Healthcare Careers
            </Badge>
            <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-normal sm:text-6xl">
              Launch Your
              <span className="block text-cyan-300">Healthcare Career</span>
              on Long Island
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Find internships, clinical experiences, healthcare assistant roles, and entry-level opportunities with
              local hospitals, clinics, and medical offices.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/jobs">
                <Button size="lg" className="bg-cyan-300 px-6 font-bold text-slate-950 hover:bg-cyan-200" data-testid="button-browse-jobs">
                  Explore Opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/employers">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-300/45 bg-transparent px-6 font-bold text-white hover:bg-white/10 hover:text-white"
                  data-testid="button-for-employers"
                >
                  For Employers
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              {statsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg bg-white/10" />)
              ) : (
                <>
                  <HeroStat icon={Briefcase} value={formatStat(stats?.totalJobs, "500+")} label="Opportunities" />
                  <HeroStat icon={Building2} value={formatStat(stats?.totalEmployers, "120+")} label="Employers" />
                  <HeroStat icon={Users} value={formatStat(stats?.totalApplications, "2,400+")} label="Student Applications" />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-lg border border-cyan-200/25 bg-slate-950/58 p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-md">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Live Opportunities</h2>
                  <p className="text-sm text-slate-300">Long Island Healthcare Roles</p>
                </div>
                <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {["All Roles", "Nassau County", "Suffolk County", "Clinical"].map((filter, index) => (
                  <span
                    key={filter}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
                      index === 0 ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/15 bg-white/5 text-slate-200"
                    }`}
                  >
                    {filter}
                  </span>
                ))}
              </div>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {jobsLoading
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="my-4 h-16 rounded-lg bg-white/10" />)
                  : liveJobs.map((job) => <LiveJobRow key={job.id} job={job} />)}
              </div>
              <p className="pt-3 text-center text-xs font-medium text-slate-300">New opportunities added weekly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#071927] text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <TrustItem icon={HeartPulse} title="Healthcare-specific opportunities" text="Roles built for healthcare students" />
          <TrustItem icon={MapPinned} title="Local Long Island employers" text="Connect with hospitals, clinics, and offices" />
          <TrustItem icon={Zap} title="Fast student applications" text="Apply in minutes and hear back faster" />
          <TrustItem icon={ShieldCheck} title="Verified organizations" text="All employers are reviewed and trusted" />
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Featured Healthcare Opportunities</h2>
            </div>
            <Link href="/jobs" className="hidden items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-600 sm:inline-flex">
              Browse all opportunities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <FeaturedJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 pb-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <AudienceCard
            tone="student"
            title="For Students"
            image="/student-card.png"
            actions={["Build a quick healthcare profile", "Discover local opportunities", "Apply to internships and jobs", "Track your applications"]}
            button="Create Student Profile"
            href="/sign-up"
          />
          <AudienceCard
            tone="employer"
            title="For Employers"
            image="/employer-card.png"
            actions={["Post internships and openings", "Find qualified local candidates", "Review and manage applicants", "Build your future workforce"]}
            button="Post an Opportunity"
            href="/employers"
          />
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-950">How It Works</h2>
          <div className="grid gap-10 lg:grid-cols-2">
            <WorkflowGroup
              title="For Students"
              accent="text-teal-700"
              steps={[
                { icon: CircleUserRound, title: "Create Profile", text: "Build your profile in just a few minutes" },
                { icon: Search, title: "Explore Opportunities", text: "Find roles that match your interests" },
                { icon: Send, title: "Apply & Connect", text: "Apply quickly and connect with local employers" },
              ]}
            />
            <WorkflowGroup
              title="For Employers"
              accent="text-emerald-700"
              steps={[
                { icon: UserPlus, title: "Post Opportunity", text: "Create a listing in minutes" },
                { icon: ClipboardList, title: "Review Candidates", text: "Browse and connect with qualified students" },
                { icon: BadgeCheck, title: "Hire & Build", text: "Hire great talent and build your team" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-lg bg-[#06131d] px-6 py-7 text-white shadow-xl shadow-slate-200 sm:px-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
              <HeartPulse className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Ready to launch your healthcare career?</h3>
              <p className="mt-1 text-slate-300">Join students and healthcare organizations across Long Island.</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/jobs">
              <Button className="w-full bg-cyan-300 px-7 font-bold text-slate-950 hover:bg-cyan-200 sm:w-auto">
                Explore Opportunities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/employers">
              <Button variant="outline" className="w-full border-cyan-300/40 bg-transparent px-7 font-bold text-white hover:bg-white/10 hover:text-white sm:w-auto">
                Post Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function formatStat(value: number | undefined, fallback: string) {
  return value && value > 0 ? value.toLocaleString() : fallback;
}

function HeroStat({ icon: Icon, value, label }: { icon: ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 border-white/10 sm:border-r sm:pr-4 last:border-r-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10">
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-cyan-300">{value}</div>
        <div className="text-sm text-slate-200">{label}</div>
      </div>
    </div>
  );
}

function LiveJobRow({ job }: { job: LandingJob }) {
  return (
    <Link href={String(job.id).startsWith("sample-") ? "/jobs" : `/jobs/${job.id}`} className="block py-4">
      <div className="grid grid-cols-[56px_1fr_auto] items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-white text-xs font-bold text-teal-700">
          {companyInitials(job.company)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{job.title}</h3>
          <p className="truncate text-sm text-slate-300">{job.company}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <Badge className={TYPE_COLORS[job.type] ?? "border-slate-200 bg-slate-100 text-slate-600"}>
            {job.type}
          </Badge>
          <p className="mt-2 text-xs text-slate-300">{SPECIALTY_LABELS[job.specialty] ?? job.specialty}</p>
        </div>
      </div>
    </Link>
  );
}

function TrustItem({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <div className="flex items-center gap-4 lg:border-r lg:border-white/10 lg:pr-6 last:border-r-0">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-300/10 bg-cyan-300/10 shadow-lg shadow-cyan-950/30">
        <Icon className="h-7 w-7 text-cyan-300" />
      </div>
      <div>
        <h3 className="font-bold leading-snug text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function FeaturedJobCard({ job }: { job: LandingJob }) {
  return (
    <Link href={String(job.id).startsWith("sample-") ? "/jobs" : `/jobs/${job.id}`}>
      <article className="group flex h-full min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div className="text-sm font-extrabold text-teal-700">{job.company}</div>
          <Bookmark className="h-5 w-5 text-slate-400 transition group-hover:text-teal-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-950">{job.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{job.company}</p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          {job.location}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className={TYPE_COLORS[job.type] ?? "border-slate-200 bg-slate-100 text-slate-600"}>{job.type}</Badge>
          <Badge className="border-slate-200 bg-slate-100 text-slate-600">
            <Clock className="mr-1 h-3 w-3" />
            {SPECIALTY_LABELS[job.specialty] ?? job.specialty}
          </Badge>
        </div>
        <Button variant="outline" className="mt-auto border-cyan-300 text-teal-700 hover:bg-cyan-50">
          View & Apply
        </Button>
      </article>
    </Link>
  );
}

function AudienceCard({
  tone,
  title,
  image,
  actions,
  button,
  href,
}: {
  tone: "student" | "employer";
  title: string;
  image: string;
  actions: string[];
  button: string;
  href: string;
}) {
  const isStudent = tone === "student";

  return (
    <div className={`grid gap-6 rounded-lg border p-5 sm:grid-cols-[140px_1fr] ${isStudent ? "border-cyan-100 bg-cyan-50/70" : "border-emerald-100 bg-emerald-50/70"}`}>
      <img src={image} alt="" className="h-36 w-36 rounded-full object-cover" />
      <div>
        <h2 className={`text-2xl font-bold ${isStudent ? "text-teal-700" : "text-emerald-700"}`}>{title}</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {actions.map((action) => (
            <li key={action} className="flex items-center gap-3">
              <Check className={`h-4 w-4 ${isStudent ? "text-teal-700" : "text-emerald-700"}`} />
              {action}
            </li>
          ))}
        </ul>
        <Link href={href}>
          <Button className={`mt-5 font-bold ${isStudent ? "bg-teal-700 hover:bg-teal-800" : "bg-emerald-700 hover:bg-emerald-800"}`}>
            {button}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function WorkflowGroup({
  title,
  accent,
  steps,
}: {
  title: string;
  accent: string;
  steps: { icon: ElementType; title: string; text: string }[];
}) {
  return (
    <div>
      <h3 className={`mb-5 text-center font-bold ${accent}`}>{title}</h3>
      <div className="grid gap-5 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="relative text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-100 bg-white">
              <step.icon className={`h-8 w-8 ${accent}`} />
            </div>
            <div className="absolute left-1/2 top-0 flex h-7 w-7 -translate-x-12 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-teal-800">
              {index + 1}
            </div>
            <h4 className="font-bold text-slate-950">{step.title}</h4>
            <p className="mx-auto mt-1 max-w-40 text-xs leading-5 text-slate-600">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function companyInitials(company: string) {
  return company
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

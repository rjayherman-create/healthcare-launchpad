import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGetProfiles, getGetProfilesQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, Users, MapPin, GraduationCap, X } from "lucide-react";

const SPECIALTY_OPTIONS = [
  { value: "nursing", label: "Nursing" },
  { value: "medical-assistant", label: "Medical Assistant" },
  { value: "emt", label: "EMT / EMS" },
  { value: "radiology", label: "Radiology" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "administration", label: "Administration" },
  { value: "other", label: "Other" },
];

const SPECIALTY_LABELS: Record<string, string> = Object.fromEntries(SPECIALTY_OPTIONS.map((o) => [o.value, o.label]));

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");

  const params = {
    ...(search ? { search } : {}),
    ...(specialty ? { specialty } : {}),
  };

  const { data: profiles, isLoading } = useGetProfiles(params, {
    query: { queryKey: getGetProfilesQueryKey(params) },
  });

  const hasFilters = search || specialty;

  return (
    <Layout>
      <div className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Student Candidates</h1>
          <p className="text-teal-200 mt-1">Browse healthcare students looking for opportunities on Long Island</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-border rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-candidates"
            />
          </div>
          <Select value={specialty || "all"} onValueChange={(v) => setSpecialty(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48" data-testid="select-candidate-specialty">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {SPECIALTY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSpecialty(""); }} className="text-slate-500" data-testid="button-clear-filters">
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {!isLoading && (
          <p className="text-sm text-slate-500 mb-4" data-testid="text-candidate-count">
            {profiles?.length ?? 0} candidate{profiles?.length !== 1 ? "s" : ""} found
          </p>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : !profiles?.length ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">No candidates found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white border border-border rounded-xl p-5 hover:border-teal-200 hover:shadow-sm transition-all"
                data-testid={`card-candidate-${profile.id}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{profile.fullName}</p>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {profile.specialty && (
                    <Badge className="bg-teal-100 text-teal-700 mr-2">
                      {SPECIALTY_LABELS[profile.specialty] ?? profile.specialty}
                    </Badge>
                  )}
                  {profile.school && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span className="truncate">{profile.school}</span>
                      {profile.graduationYear && <span className="text-slate-400">{profile.graduationYear}</span>}
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{profile.bio}</p>
                )}

                {profile.certifications && (
                  <p className="text-xs text-teal-600 mt-2 font-medium">{profile.certifications}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

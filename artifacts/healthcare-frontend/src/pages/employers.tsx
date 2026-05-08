import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout";
import {
  useGetMyEmployer, getGetMyEmployerQueryKey,
  useUpsertMyEmployer,
  useGetJobs, getGetJobsQueryKey,
  useCreateJob, useDeleteJob,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, Trash2, MapPin } from "lucide-react";

const employerSchema = z.object({
  organizationName: z.string().min(1, "Organization name required"),
  contactEmail: z.string().email("Valid email required"),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  type: z.string().optional(),
});

const jobSchema = z.object({
  title: z.string().min(1, "Title required"),
  company: z.string().min(1, "Company required"),
  location: z.string().min(1, "Location required"),
  type: z.enum(["internship", "part-time", "full-time", "clinical"]),
  specialty: z.enum(["nursing", "medical-assistant", "emt", "radiology", "pharmacy", "administration", "other"]),
  description: z.string().min(10, "Description required"),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

const TYPE_COLORS: Record<string, string> = {
  internship: "bg-teal-100 text-teal-700",
  "part-time": "bg-sky-100 text-sky-700",
  "full-time": "bg-indigo-100 text-indigo-700",
  clinical: "bg-emerald-100 text-emerald-700",
};

export default function EmployersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: employer, isLoading: employerLoading } = useGetMyEmployer({
    query: { queryKey: getGetMyEmployerQueryKey() },
  });
  const { data: jobs, isLoading: jobsLoading } = useGetJobs({}, {
    query: { queryKey: getGetJobsQueryKey({}) },
  });
  const upsertEmployer = useUpsertMyEmployer();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();

  const empForm = useForm<z.infer<typeof employerSchema>>({
    resolver: zodResolver(employerSchema),
    defaultValues: { organizationName: "", contactEmail: "", location: "", website: "", description: "", type: "" },
  });

  const jobForm = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: { title: "", company: employer?.organizationName ?? "", location: "", type: "internship", specialty: "nursing", description: "", requirements: "", salary: "", isFeatured: false },
  });

  useEffect(() => {
    if (employer) {
      empForm.reset({
        organizationName: employer.organizationName || "",
        contactEmail: employer.contactEmail || "",
        location: employer.location || "",
        website: employer.website || "",
        description: employer.description || "",
        type: employer.type || "",
      });
      jobForm.setValue("company", employer.organizationName);
    }
  }, [employer]);

  function onSaveEmployer(values: z.infer<typeof employerSchema>) {
    upsertEmployer.mutate(
      { data: { organizationName: values.organizationName, contactEmail: values.contactEmail, location: values.location || null, website: values.website || null, description: values.description || null, type: values.type || null } },
      {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMyEmployerQueryKey() }); toast({ title: "Employer profile saved" }); },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      },
    );
  }

  function onPostJob(values: z.infer<typeof jobSchema>) {
    createJob.mutate(
      { data: { ...values, requirements: values.requirements || null, salary: values.salary || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetJobsQueryKey({}) });
          jobForm.reset({ ...jobForm.getValues(), title: "", description: "", requirements: "", salary: "" });
          toast({ title: "Job posted!", description: "Your listing is now live." });
        },
        onError: () => toast({ title: "Post failed", variant: "destructive" }),
      },
    );
  }

  function handleDelete(id: number) {
    deleteJob.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetJobsQueryKey({}) }); toast({ title: "Job deleted" }); },
    });
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-teal-200 mt-1">Post positions and manage your organization profile</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Employer profile */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="font-semibold text-slate-900 text-lg">Organization Profile</h2>
          </div>
          {employerLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
          ) : (
            <Form {...empForm}>
              <form onSubmit={empForm.handleSubmit(onSaveEmployer)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={empForm.control} name="organizationName" render={({ field }) => (
                    <FormItem><FormLabel>Organization Name *</FormLabel><FormControl><Input placeholder="Long Island Medical Center" {...field} data-testid="input-org-name" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={empForm.control} name="contactEmail" render={({ field }) => (
                    <FormItem><FormLabel>Contact Email *</FormLabel><FormControl><Input type="email" placeholder="hr@hospital.com" {...field} data-testid="input-contact-email" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={empForm.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Nassau County, NY" {...field} data-testid="input-employer-location" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={empForm.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Organization Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger data-testid="select-org-type"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["hospital", "clinic", "urgent-care", "nursing-home", "other"].map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</SelectItem>)}
                        </SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={empForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>About Your Organization</FormLabel><FormControl><Textarea placeholder="Describe your organization..." rows={3} {...field} data-testid="textarea-org-description" /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={upsertEmployer.isPending} className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-save-employer">
                  {upsertEmployer.isPending ? "Saving..." : "Save Organization Profile"}
                </Button>
              </form>
            </Form>
          )}
        </div>

        {/* Post a job */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="font-semibold text-slate-900 text-lg">Post a New Position</h2>
          </div>
          <Form {...jobForm}>
            <form onSubmit={jobForm.handleSubmit(onPostJob)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={jobForm.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Job Title *</FormLabel><FormControl><Input placeholder="Nursing Assistant Intern" {...field} data-testid="input-job-title" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={jobForm.control} name="company" render={({ field }) => (
                  <FormItem><FormLabel>Organization *</FormLabel><FormControl><Input placeholder="Organization name" {...field} data-testid="input-job-company" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={jobForm.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location *</FormLabel><FormControl><Input placeholder="Nassau County, NY" {...field} data-testid="input-job-location" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={jobForm.control} name="salary" render={({ field }) => (
                  <FormItem><FormLabel>Compensation</FormLabel><FormControl><Input placeholder="$18/hr or Unpaid / Credit" {...field} data-testid="input-job-salary" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={jobForm.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Position Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-job-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{["internship", "part-time", "full-time", "clinical"].map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={jobForm.control} name="specialty" render={({ field }) => (
                  <FormItem><FormLabel>Specialty *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-job-specialty"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {[["nursing", "Nursing"], ["medical-assistant", "Medical Assistant"], ["emt", "EMT / EMS"], ["radiology", "Radiology"], ["pharmacy", "Pharmacy"], ["administration", "Administration"], ["other", "Other"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={jobForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Job Description *</FormLabel><FormControl><Textarea placeholder="Describe the role, responsibilities, and what candidates will gain..." rows={4} {...field} data-testid="textarea-job-description" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={jobForm.control} name="requirements" render={({ field }) => (
                <FormItem><FormLabel>Requirements</FormLabel><FormControl><Textarea placeholder="Certifications, enrollment status, skills needed..." rows={2} {...field} data-testid="textarea-job-requirements" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={createJob.isPending} className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-post-job">
                <Plus className="w-4 h-4 mr-2" />
                {createJob.isPending ? "Posting..." : "Post Position"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Posted jobs */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 text-lg mb-4">All Posted Positions</h2>
          {jobsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : !jobs?.length ? (
            <p className="text-slate-400 text-sm text-center py-8">No positions posted yet. Use the form above to post your first opportunity.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 gap-4" data-testid={`row-job-${job.id}`}>
                  <div className="flex items-start gap-3 flex-1">
                    <div>
                      <p className="font-medium text-slate-800">{job.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[job.type] ?? "bg-slate-100 text-slate-600"}>
                      {job.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(job.id)}
                      data-testid={`button-delete-job-${job.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { useGetMyProfile, getGetMyProfileQueryKey, useUpsertMyProfile } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { User, CheckCircle } from "lucide-react";

const SPECIALTY_OPTIONS = [
  { value: "nursing", label: "Nursing" },
  { value: "medical-assistant", label: "Medical Assistant" },
  { value: "emt", label: "EMT / EMS" },
  { value: "radiology", label: "Radiology" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "administration", label: "Administration" },
  { value: "other", label: "Other" },
];

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required"),
  school: z.string().optional(),
  graduationYear: z.string().optional(),
  specialty: z.string().optional(),
  certifications: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useUser();
  const { data: profile, isLoading } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey() },
  });
  const upsertProfile = useUpsertMyProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      school: "",
      graduationYear: "",
      specialty: "",
      certifications: "",
      bio: "",
      location: "",
      resumeUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        school: profile.school || "",
        graduationYear: profile.graduationYear?.toString() || "",
        specialty: profile.specialty || "",
        certifications: profile.certifications || "",
        bio: profile.bio || "",
        location: profile.location || "",
        resumeUrl: profile.resumeUrl || "",
      });
    } else if (user) {
      form.reset({
        fullName: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      });
    }
  }, [profile, user, form]);

  function onSubmit(values: ProfileFormValues) {
    upsertProfile.mutate(
      {
        data: {
          fullName: values.fullName,
          email: values.email,
          school: values.school || null,
          graduationYear: values.graduationYear ? parseInt(values.graduationYear) : null,
          specialty: values.specialty || null,
          certifications: values.certifications || null,
          bio: values.bio || null,
          location: values.location || null,
          resumeUrl: values.resumeUrl || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
          toast({ title: "Profile saved", description: "Your profile has been updated." });
        },
        onError: () => {
          toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
        },
      },
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Student Profile</h1>
          <p className="text-teal-200 mt-1">Keep your profile up to date so employers can find you</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                {profile ? (
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                ) : (
                  <User className="w-6 h-6 text-teal-600" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  {profile ? "Update Your Profile" : "Create Your Profile"}
                </h2>
                <p className="text-sm text-slate-500">
                  {profile ? "Profile visible to employers" : "Complete your profile to apply for positions"}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} data-testid="input-full-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="school" render={({ field }) => (
                    <FormItem>
                      <FormLabel>School / University</FormLabel>
                      <FormControl>
                        <Input placeholder="Stony Brook University" {...field} data-testid="input-school" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="graduationYear" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2025" {...field} data-testid="input-graduation-year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="specialty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty / Focus Area</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-specialty">
                            <SelectValue placeholder="Select a specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPECIALTY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Nassau County, NY" {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="certifications" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Input placeholder="CPR, BLS, CNA, ACLS..." {...field} data-testid="input-certifications" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="resumeUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://drive.google.com/..." {...field} data-testid="input-resume-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>About You</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell employers about your experience, goals, and what makes you a great candidate..."
                        rows={5}
                        {...field}
                        data-testid="textarea-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  disabled={upsertProfile.isPending}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  data-testid="button-save-profile"
                >
                  {upsertProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </Layout>
  );
}

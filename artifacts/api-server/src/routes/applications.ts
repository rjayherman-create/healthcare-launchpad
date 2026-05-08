import { Router, type IRouter } from "express";
import { db, applicationsTable, jobsTable, studentProfilesTable } from "@workspace/db";
import { eq, and, type SQL } from "drizzle-orm";
import {
  GetApplicationsQueryParams,
  CreateApplicationBody,
  UpdateApplicationBody,
  UpdateApplicationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications", async (req, res) => {
  const clerkUserId = req.headers["x-clerk-user-id"] as string | undefined;
  if (!clerkUserId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const query = GetApplicationsQueryParams.parse(req.query);
    const conditions: SQL[] = [];

    if (query.jobId) conditions.push(eq(applicationsTable.jobId, query.jobId));
    if (query.status) conditions.push(eq(applicationsTable.status, query.status));

    const applications = conditions.length
      ? await db.select().from(applicationsTable).where(and(...conditions))
      : await db.select().from(applicationsTable);

    const enriched = await Promise.all(
      applications.map(async (app) => {
        const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
        const [profile] = await db
          .select()
          .from(studentProfilesTable)
          .where(eq(studentProfilesTable.id, app.profileId));
        return {
          ...formatApplication(app),
          job: job
            ? {
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                specialty: job.specialty,
                description: job.description,
                requirements: job.requirements ?? null,
                salary: job.salary ?? null,
                isFeatured: job.isFeatured,
                employerId: job.employerId ?? null,
                createdAt: job.createdAt.toISOString(),
              }
            : null,
          profile: profile
            ? {
                id: profile.id,
                clerkUserId: profile.clerkUserId,
                fullName: profile.fullName,
                email: profile.email,
                school: profile.school ?? null,
                graduationYear: profile.graduationYear ?? null,
                specialty: profile.specialty ?? null,
                certifications: profile.certifications ?? null,
                bio: profile.bio ?? null,
                location: profile.location ?? null,
                resumeUrl: profile.resumeUrl ?? null,
                createdAt: profile.createdAt.toISOString(),
              }
            : null,
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get applications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/applications", async (req, res) => {
  const clerkUserId = req.headers["x-clerk-user-id"] as string | undefined;
  if (!clerkUserId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const body = CreateApplicationBody.parse(req.body);

    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.clerkUserId, clerkUserId));
    if (!profile) return res.status(404).json({ error: "Student profile not found" });

    const [application] = await db
      .insert(applicationsTable)
      .values({
        jobId: body.jobId,
        profileId: profile.id,
        coverLetter: body.coverLetter ?? null,
        status: "pending",
      })
      .returning();

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, body.jobId));

    res.status(201).json({
      ...formatApplication(application),
      job: job
        ? {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            specialty: job.specialty,
            description: job.description,
            requirements: job.requirements ?? null,
            salary: job.salary ?? null,
            isFeatured: job.isFeatured,
            employerId: job.employerId ?? null,
            createdAt: job.createdAt.toISOString(),
          }
        : null,
      profile: {
        id: profile.id,
        clerkUserId: profile.clerkUserId,
        fullName: profile.fullName,
        email: profile.email,
        school: profile.school ?? null,
        graduationYear: profile.graduationYear ?? null,
        specialty: profile.specialty ?? null,
        certifications: profile.certifications ?? null,
        bio: profile.bio ?? null,
        location: profile.location ?? null,
        resumeUrl: profile.resumeUrl ?? null,
        createdAt: profile.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create application");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/applications/:id", async (req, res) => {
  try {
    const { id } = UpdateApplicationParams.parse({ id: Number(req.params.id) });
    const body = UpdateApplicationBody.parse(req.body);

    const [application] = await db
      .update(applicationsTable)
      .set({ status: body.status })
      .where(eq(applicationsTable.id, id))
      .returning();

    if (!application) return res.status(404).json({ error: "Application not found" });

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, application.jobId));
    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.id, application.profileId));

    res.json({
      ...formatApplication(application),
      job: job
        ? {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            specialty: job.specialty,
            description: job.description,
            requirements: job.requirements ?? null,
            salary: job.salary ?? null,
            isFeatured: job.isFeatured,
            employerId: job.employerId ?? null,
            createdAt: job.createdAt.toISOString(),
          }
        : null,
      profile: profile
        ? {
            id: profile.id,
            clerkUserId: profile.clerkUserId,
            fullName: profile.fullName,
            email: profile.email,
            school: profile.school ?? null,
            graduationYear: profile.graduationYear ?? null,
            specialty: profile.specialty ?? null,
            certifications: profile.certifications ?? null,
            bio: profile.bio ?? null,
            location: profile.location ?? null,
            resumeUrl: profile.resumeUrl ?? null,
            createdAt: profile.createdAt.toISOString(),
          }
        : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update application");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatApplication(app: typeof applicationsTable.$inferSelect) {
  return {
    id: app.id,
    jobId: app.jobId,
    profileId: app.profileId,
    status: app.status,
    coverLetter: app.coverLetter ?? null,
    createdAt: app.createdAt.toISOString(),
  };
}

export default router;

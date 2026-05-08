import { Router, type IRouter } from "express";
import { db, jobsTable } from "@workspace/db";
import { eq, ilike, and, or, type SQL } from "drizzle-orm";
import {
  GetJobsQueryParams,
  CreateJobBody,
  UpdateJobBody,
  GetJobParams,
  UpdateJobParams,
  DeleteJobParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs/featured", async (req, res) => {
  try {
    const jobs = await db.select().from(jobsTable).where(eq(jobsTable.isFeatured, true)).limit(6);
    res.json(jobs.map(formatJob));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured jobs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/jobs", async (req, res) => {
  try {
    const query = GetJobsQueryParams.parse(req.query);
    const conditions: SQL[] = [];

    if (query.location) conditions.push(ilike(jobsTable.location, `%${query.location}%`));
    if (query.type) conditions.push(eq(jobsTable.type, query.type));
    if (query.specialty) conditions.push(eq(jobsTable.specialty, query.specialty));
    if (query.search) {
      conditions.push(
        or(
          ilike(jobsTable.title, `%${query.search}%`),
          ilike(jobsTable.company, `%${query.search}%`),
          ilike(jobsTable.description, `%${query.search}%`),
        ) as SQL,
      );
    }

    const jobs = conditions.length
      ? await db.select().from(jobsTable).where(and(...conditions))
      : await db.select().from(jobsTable);

    res.json(jobs.map(formatJob));
  } catch (err) {
    req.log.error({ err }, "Failed to get jobs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/jobs", async (req, res) => {
  try {
    const body = CreateJobBody.parse(req.body);
    const [job] = await db
      .insert(jobsTable)
      .values({
        title: body.title,
        company: body.company,
        location: body.location,
        type: body.type,
        specialty: body.specialty,
        description: body.description,
        requirements: body.requirements ?? null,
        salary: body.salary ?? null,
        isFeatured: body.isFeatured,
      })
      .returning();
    res.status(201).json(formatJob(job));
  } catch (err) {
    req.log.error({ err }, "Failed to create job");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/jobs/:id", async (req, res) => {
  try {
    const { id } = GetJobParams.parse({ id: Number(req.params.id) });
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(formatJob(job));
  } catch (err) {
    req.log.error({ err }, "Failed to get job");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/jobs/:id", async (req, res) => {
  try {
    const { id } = UpdateJobParams.parse({ id: Number(req.params.id) });
    const body = UpdateJobBody.parse(req.body);
    const updates: Partial<typeof jobsTable.$inferInsert> = {};
    if (body.title != null) updates.title = body.title;
    if (body.company != null) updates.company = body.company;
    if (body.location != null) updates.location = body.location;
    if (body.type != null) updates.type = body.type;
    if (body.specialty != null) updates.specialty = body.specialty;
    if (body.description != null) updates.description = body.description;
    if (body.requirements !== undefined) updates.requirements = body.requirements;
    if (body.salary !== undefined) updates.salary = body.salary;
    if (body.isFeatured != null) updates.isFeatured = body.isFeatured;

    const [job] = await db.update(jobsTable).set(updates).where(eq(jobsTable.id, id)).returning();
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(formatJob(job));
  } catch (err) {
    req.log.error({ err }, "Failed to update job");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/jobs/:id", async (req, res) => {
  try {
    const { id } = DeleteJobParams.parse({ id: Number(req.params.id) });
    await db.delete(jobsTable).where(eq(jobsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete job");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatJob(job: typeof jobsTable.$inferSelect) {
  return {
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
  };
}

export default router;

import { Router, type IRouter } from "express";
import { db, jobsTable, studentProfilesTable, employersTable, applicationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [totalJobs] = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable);
    const [totalStudents] = await db.select({ count: sql<number>`count(*)::int` }).from(studentProfilesTable);
    const [totalApplications] = await db.select({ count: sql<number>`count(*)::int` }).from(applicationsTable);
    const [totalEmployers] = await db.select({ count: sql<number>`count(*)::int` }).from(employersTable);

    const jobsByType = await db
      .select({ type: jobsTable.type, count: sql<number>`count(*)::int` })
      .from(jobsTable)
      .groupBy(jobsTable.type);

    const applicationsByStatus = await db
      .select({ status: applicationsTable.status, count: sql<number>`count(*)::int` })
      .from(applicationsTable)
      .groupBy(applicationsTable.status);

    const jobsBySpecialty = await db
      .select({ specialty: jobsTable.specialty, count: sql<number>`count(*)::int` })
      .from(jobsTable)
      .groupBy(jobsTable.specialty);

    res.json({
      totalJobs: totalJobs?.count ?? 0,
      totalStudents: totalStudents?.count ?? 0,
      totalApplications: totalApplications?.count ?? 0,
      totalEmployers: totalEmployers?.count ?? 0,
      jobsByType: jobsByType.map((r) => ({ type: r.type, count: r.count })),
      applicationsByStatus: applicationsByStatus.map((r) => ({ status: r.status, count: r.count })),
      jobsBySpecialty: jobsBySpecialty.map((r) => ({ specialty: r.specialty, count: r.count })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-activity", async (req, res) => {
  try {
    const recentJobs = await db
      .select()
      .from(jobsTable)
      .orderBy(sql`${jobsTable.createdAt} desc`)
      .limit(3);

    const recentApplications = await db
      .select()
      .from(applicationsTable)
      .orderBy(sql`${applicationsTable.createdAt} desc`)
      .limit(3);

    const recentStudents = await db
      .select()
      .from(studentProfilesTable)
      .orderBy(sql`${studentProfilesTable.createdAt} desc`)
      .limit(2);

    const activity = [
      ...recentJobs.map((j) => ({
        id: j.id * 100,
        type: "new_job" as const,
        message: `New position posted: ${j.title} at ${j.company}`,
        createdAt: j.createdAt.toISOString(),
      })),
      ...recentApplications.map((a) => ({
        id: a.id * 100 + 1,
        type: "new_application" as const,
        message: `New application submitted for job #${a.jobId}`,
        createdAt: a.createdAt.toISOString(),
      })),
      ...recentStudents.map((s) => ({
        id: s.id * 100 + 2,
        type: "new_student" as const,
        message: `${s.fullName} joined as a student`,
        createdAt: s.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(activity.slice(0, 8));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db, studentProfilesTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import {
  UpsertMyProfileBody,
  GetProfileParams,
  GetProfilesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profiles/me", async (req, res) => {
  const clerkUserId = req.headers["x-clerk-user-id"] as string | undefined;
  if (!clerkUserId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.clerkUserId, clerkUserId));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(formatProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profiles/me", async (req, res) => {
  const clerkUserId = req.headers["x-clerk-user-id"] as string | undefined;
  if (!clerkUserId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const body = UpsertMyProfileBody.parse(req.body);
    const values = {
      clerkUserId,
      fullName: body.fullName,
      email: body.email,
      school: body.school ?? null,
      graduationYear: body.graduationYear ?? null,
      specialty: body.specialty ?? null,
      certifications: body.certifications ?? null,
      bio: body.bio ?? null,
      location: body.location ?? null,
      resumeUrl: body.resumeUrl ?? null,
    };
    const [profile] = await db
      .insert(studentProfilesTable)
      .values(values)
      .onConflictDoUpdate({ target: studentProfilesTable.clerkUserId, set: values })
      .returning();
    res.json(formatProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to upsert profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles", async (req, res) => {
  try {
    const query = GetProfilesQueryParams.parse(req.query);
    const conditions: SQL[] = [];
    if (query.specialty) conditions.push(eq(studentProfilesTable.specialty, query.specialty));
    if (query.location) conditions.push(ilike(studentProfilesTable.location, `%${query.location}%`));
    if (query.search) conditions.push(ilike(studentProfilesTable.fullName, `%${query.search}%`));

    const profiles = conditions.length
      ? await db.select().from(studentProfilesTable).where(and(...conditions))
      : await db.select().from(studentProfilesTable);

    res.json(profiles.map(formatProfile));
  } catch (err) {
    req.log.error({ err }, "Failed to get profiles");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/:id", async (req, res) => {
  try {
    const { id } = GetProfileParams.parse({ id: Number(req.params.id) });
    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.id, id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(formatProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatProfile(profile: typeof studentProfilesTable.$inferSelect) {
  return {
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
  };
}

export default router;

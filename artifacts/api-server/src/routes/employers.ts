import { Router, type IRouter } from "express";
import { db, employersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpsertMyEmployerBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/employers/me", async (req, res): Promise<void> => {
  const clerkUserId = req.headers["x-clerk-user-id"] as string | undefined;
  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [employer] = await db
      .select()
      .from(employersTable)
      .where(eq(employersTable.clerkUserId, clerkUserId));
    if (!employer) {
      res.status(404).json({ error: "Employer not found" });
      return;
    }
    res.json(formatEmployer(employer));
  } catch (err) {
    req.log.error({ err }, "Failed to get employer");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/employers/me", async (req, res): Promise<void> => {
  const clerkUserId = req.headers["x-clerk-user-id"] as string | undefined;
  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const body = UpsertMyEmployerBody.parse(req.body);
    const values = {
      clerkUserId,
      organizationName: body.organizationName,
      contactEmail: body.contactEmail,
      location: body.location ?? null,
      website: body.website ?? null,
      description: body.description ?? null,
      type: body.type ?? null,
    };
    const [employer] = await db
      .insert(employersTable)
      .values(values)
      .onConflictDoUpdate({ target: employersTable.clerkUserId, set: values })
      .returning();
    res.json(formatEmployer(employer));
  } catch (err) {
    req.log.error({ err }, "Failed to upsert employer");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatEmployer(employer: typeof employersTable.$inferSelect) {
  return {
    id: employer.id,
    clerkUserId: employer.clerkUserId,
    organizationName: employer.organizationName,
    contactEmail: employer.contactEmail,
    location: employer.location ?? null,
    website: employer.website ?? null,
    description: employer.description ?? null,
    type: employer.type ?? null,
    createdAt: employer.createdAt.toISOString(),
  };
}

export default router;

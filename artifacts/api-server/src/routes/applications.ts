import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { users, opportunityApplications, opportunities, employersTable, trades } from "@workspace/db";
import {
  TradeListApplicationsQueryParams,
  TradeListApplicationsResponse,
  TradeCreateApplicationBody,
  TradeUpdateApplicationParams,
  TradeUpdateApplicationBody,
  TradeUpdateApplicationResponse,
  TradeDeleteApplicationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getApplicationWithOpportunity(appId: number) {
  const [row] = await db
    .select({
      application: opportunityApplications,
      opportunity: opportunities,
      employer: employersTable,
      trade: trades,
    })
    .from(opportunityApplications)
    .leftJoin(opportunities, eq(opportunityApplications.opportunityId, opportunities.id))
    .leftJoin(employersTable, eq(opportunities.employerId, employersTable.id))
    .leftJoin(trades, eq(opportunities.tradeId, trades.id))
    .where(eq(opportunityApplications.id, appId));

  if (!row) return null;

  return {
    ...row.application,
    opportunity: row.opportunity
      ? {
          ...row.opportunity,
          employer: row.employer ?? undefined,
          trade: row.trade ?? undefined,
        }
      : null,
  };
}

router.get("/applications", async (req, res): Promise<void> => {
  const query = TradeListApplicationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { clerkUserId, status } = query.data;

  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  if (!user) {
    res.json([]);
    return;
  }

  const conditions = [eq(opportunityApplications.studentUserId, user.id)];
  if (status) conditions.push(eq(opportunityApplications.status, status));

  const rows = await db
    .select({
      application: opportunityApplications,
      opportunity: opportunities,
      employer: employersTable,
      trade: trades,
    })
    .from(opportunityApplications)
    .leftJoin(opportunities, eq(opportunityApplications.opportunityId, opportunities.id))
    .leftJoin(employersTable, eq(opportunities.employerId, employersTable.id))
    .leftJoin(trades, eq(opportunities.tradeId, trades.id))
    .where(and(...conditions))
    .orderBy(opportunityApplications.updatedAt);

  const results = rows.map((row) => ({
    ...row.application,
    opportunity: row.opportunity
      ? {
          ...row.opportunity,
          employer: row.employer ?? undefined,
          trade: row.trade ?? undefined,
        }
      : null,
  }));

  res.json(TradeListApplicationsResponse.parse(results));
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = TradeCreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clerkUserId, email, opportunityId, status, messageToEmployer, studentNotes } = parsed.data;

  let [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  if (!user) {
    [user] = await db
      .insert(users)
      .values({ clerkUserId, email, role: "student" })
      .returning();
  }

  const [existing] = await db
    .select()
    .from(opportunityApplications)
    .where(
      and(
        eq(opportunityApplications.studentUserId, user.id),
        eq(opportunityApplications.opportunityId, opportunityId),
      ),
    );

  if (existing) {
    res.status(400).json({ error: "Application already exists" });
    return;
  }

  const [app] = await db
    .insert(opportunityApplications)
    .values({
      studentUserId: user.id,
      opportunityId,
      status: status ?? "interested",
      messageToEmployer: messageToEmployer ?? null,
      studentNotes: studentNotes ?? null,
    })
    .returning();

  const result = await getApplicationWithOpportunity(app.id);
  res.status(201).json(result);
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const params = TradeUpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = TradeUpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.messageToEmployer != null)
    updateData.messageToEmployer = parsed.data.messageToEmployer;
  if (parsed.data.studentNotes != null) updateData.studentNotes = parsed.data.studentNotes;
  if (parsed.data.interviewDate != null) updateData.interviewDate = parsed.data.interviewDate;

  const [updated] = await db
    .update(opportunityApplications)
    .set(updateData)
    .where(eq(opportunityApplications.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const result = await getApplicationWithOpportunity(updated.id);
  res.json(TradeUpdateApplicationResponse.parse(result));
});

router.delete("/applications/:id", async (req, res): Promise<void> => {
  const params = TradeDeleteApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(opportunityApplications)
    .where(eq(opportunityApplications.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

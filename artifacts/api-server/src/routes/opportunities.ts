import { Router, type IRouter } from "express";
import { eq, and, ilike, type SQL } from "drizzle-orm";
import { db, opportunities, trades, employersTable } from "@workspace/db";
import {
  TradeListOpportunitiesQueryParams,
  TradeGetOpportunityParams,
  TradeCreateOpportunityBody,
  TradeUpdateOpportunityBody,
  TradeUpdateOpportunityParams,
  TradeDeleteOpportunityParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOpportunityWithRelations(id: number) {
  const [row] = await db
    .select({ opportunity: opportunities, trade: trades, employer: employersTable })
    .from(opportunities)
    .leftJoin(trades, eq(opportunities.tradeId, trades.id))
    .leftJoin(employersTable, eq(opportunities.employerId, employersTable.id))
    .where(eq(opportunities.id, id));

  if (!row) return null;

  return {
    ...row.opportunity,
    trade: row.trade ?? undefined,
    employer: row.employer ?? undefined,
  };
}

router.get("/opportunities", async (req, res): Promise<void> => {
  const query = TradeListOpportunitiesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (query.data.tradeId != null) {
    conditions.push(eq(opportunities.tradeId, query.data.tradeId));
  }
  if (query.data.employerId != null) {
    conditions.push(eq(opportunities.employerId, query.data.employerId));
  }
  if (query.data.location) {
    conditions.push(ilike(opportunities.location, `%${query.data.location}%`));
  }
  if (query.data.activeOnly ?? true) {
    conditions.push(eq(opportunities.isActive, true));
  }

  const rows = await (conditions.length
    ? db
        .select({ opportunity: opportunities, trade: trades, employer: employersTable })
        .from(opportunities)
        .leftJoin(trades, eq(opportunities.tradeId, trades.id))
        .leftJoin(employersTable, eq(opportunities.employerId, employersTable.id))
        .where(and(...conditions))
    : db
        .select({ opportunity: opportunities, trade: trades, employer: employersTable })
        .from(opportunities)
        .leftJoin(trades, eq(opportunities.tradeId, trades.id))
        .leftJoin(employersTable, eq(opportunities.employerId, employersTable.id)));

  res.json(
    rows.map((row) => ({
      ...row.opportunity,
      trade: row.trade ?? undefined,
      employer: row.employer ?? undefined,
    })),
  );
});

router.post("/opportunities", async (req, res): Promise<void> => {
  const body = TradeCreateOpportunityBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [created] = await db
    .insert(opportunities)
    .values({
      employerId: body.data.employerId ?? null,
      tradeId: body.data.tradeId ?? null,
      title: body.data.title,
      companyName: body.data.companyName ?? null,
      location: body.data.location ?? null,
      opportunityType: body.data.opportunityType ?? null,
      description: body.data.description ?? null,
      requirements: body.data.requirements ?? null,
      payRange: body.data.payRange ?? null,
      isActive: body.data.isActive ?? true,
    })
    .returning();

  const enriched = await getOpportunityWithRelations(created.id);
  res.status(201).json(enriched);
});

router.get("/opportunities/:id", async (req, res): Promise<void> => {
  const params = TradeGetOpportunityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await getOpportunityWithRelations(params.data.id);

  if (!row) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  res.json(row);
});

router.patch("/opportunities/:id", async (req, res): Promise<void> => {
  const params = TradeUpdateOpportunityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = TradeUpdateOpportunityBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.data.employerId !== undefined) updates.employerId = body.data.employerId;
  if (body.data.tradeId !== undefined) updates.tradeId = body.data.tradeId;
  if (body.data.title !== undefined) updates.title = body.data.title;
  if (body.data.companyName !== undefined) updates.companyName = body.data.companyName;
  if (body.data.location !== undefined) updates.location = body.data.location;
  if (body.data.opportunityType !== undefined) updates.opportunityType = body.data.opportunityType;
  if (body.data.description !== undefined) updates.description = body.data.description;
  if (body.data.requirements !== undefined) updates.requirements = body.data.requirements;
  if (body.data.payRange !== undefined) updates.payRange = body.data.payRange;
  if (body.data.isActive !== undefined) updates.isActive = body.data.isActive;

  const [updated] = await db
    .update(opportunities)
    .set(updates)
    .where(eq(opportunities.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  const enriched = await getOpportunityWithRelations(updated.id);
  res.json(enriched);
});

router.delete("/opportunities/:id", async (req, res): Promise<void> => {
  const params = TradeDeleteOpportunityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(opportunities)
    .where(eq(opportunities.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

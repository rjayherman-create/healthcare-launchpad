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
    ? db.select().from(opportunities).where(and(...conditions))
    : db.select().from(opportunities));

  const enriched = await Promise.all(
    rows.map(async (opp) => {
      const [trade] = opp.tradeId
        ? await db.select().from(trades).where(eq(trades.id, opp.tradeId))
        : [null];
      const [employer] = opp.employerId
        ? await db.select().from(employersTable).where(eq(employersTable.id, opp.employerId))
        : [null];
      return {
        ...opp,
        trade: trade ?? undefined,
        employer: employer ?? undefined,
      };
    }),
  );

  res.json(enriched);
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

  res.status(201).json(created);
});

router.get("/opportunities/:id", async (req, res): Promise<void> => {
  const params = TradeGetOpportunityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [opp] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, params.data.id));

  if (!opp) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  res.json(opp);
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
  if (body.data.employerId !== undefined && body.data.employerId !== null) updates.employerId = body.data.employerId;
  if (body.data.tradeId !== undefined && body.data.tradeId !== null) updates.tradeId = body.data.tradeId;
  if (body.data.title !== undefined) updates.title = body.data.title;
  if (body.data.companyName !== undefined) updates.companyName = body.data.companyName;
  if (body.data.location !== undefined) updates.location = body.data.location;
  if (body.data.opportunityType !== undefined) updates.opportunityType = body.data.opportunityType;
  if (body.data.description !== undefined) updates.description = body.data.description;
  if (body.data.requirements !== undefined) updates.requirements = body.data.requirements;
  if (body.data.payRange !== undefined) updates.payRange = body.data.payRange;
  if (body.data.isActive !== undefined && body.data.isActive !== null) updates.isActive = body.data.isActive;

  const [updated] = await db
    .update(opportunities)
    .set(updates)
    .where(eq(opportunities.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  res.json(updated);
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

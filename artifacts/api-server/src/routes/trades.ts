import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { trades } from "@workspace/db";
import {
  TradeListTradesQueryParams,
  TradeGetTradeParams,
  TradeGetTradeResponse,
  TradeListTradesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/trades", async (req, res): Promise<void> => {
  const query = TradeListTradesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, beginnerFriendly } = query.data;

  const conditions = [eq(trades.isActive, true)];
  if (category) conditions.push(eq(trades.category, category));
  if (beginnerFriendly != null)
    conditions.push(eq(trades.beginnerFriendly, beginnerFriendly));

  const rows = await db
    .select()
    .from(trades)
    .where(and(...conditions))
    .orderBy(trades.name);

  res.json(TradeListTradesResponse.parse(rows));
});

router.get("/trades/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ category: trades.category })
    .from(trades)
    .where(and(eq(trades.isActive, true)));

  const categories = rows
    .map((r) => r.category)
    .filter((c): c is string => c !== null && c !== undefined)
    .sort();

  res.json(categories);
});

router.get("/trades/:id", async (req, res): Promise<void> => {
  const params = TradeGetTradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [trade] = await db.select().from(trades).where(eq(trades.id, params.data.id));

  if (!trade) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }

  res.json(TradeGetTradeResponse.parse(trade));
});

export default router;

import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { licenseRoadmaps, trades } from "@workspace/db";
import {
  ListLicenseRoadmapsQueryParams,
  GetLicenseRoadmapParams,
  ListLicenseRoadmapsResponse,
  GetLicenseRoadmapResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/license-roadmaps", async (req, res): Promise<void> => {
  const query = ListLicenseRoadmapsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { tradeId, state } = query.data;

  const conditions = [eq(licenseRoadmaps.isActive, true)];
  if (tradeId != null) conditions.push(eq(licenseRoadmaps.tradeId, tradeId));
  if (state) conditions.push(eq(licenseRoadmaps.state, state));

  const rows = await db
    .select({
      id: licenseRoadmaps.id,
      tradeId: licenseRoadmaps.tradeId,
      state: licenseRoadmaps.state,
      county: licenseRoadmaps.county,
      licenseName: licenseRoadmaps.licenseName,
      requirementType: licenseRoadmaps.requirementType,
      canStartWithoutLicense: licenseRoadmaps.canStartWithoutLicense,
      plainEnglishSummary: licenseRoadmaps.plainEnglishSummary,
      stepsToLicense: licenseRoadmaps.stepsToLicense,
      requiredAge: licenseRoadmaps.requiredAge,
      requiredHours: licenseRoadmaps.requiredHours,
      examRequired: licenseRoadmaps.examRequired,
      examName: licenseRoadmaps.examName,
      apprenticeshipRequired: licenseRoadmaps.apprenticeshipRequired,
      issuingAgencyName: licenseRoadmaps.issuingAgencyName,
      issuingAgencyUrl: licenseRoadmaps.issuingAgencyUrl,
      disclaimer: licenseRoadmaps.disclaimer,
      isActive: licenseRoadmaps.isActive,
      createdAt: licenseRoadmaps.createdAt,
      updatedAt: licenseRoadmaps.updatedAt,
      tradeName: trades.name,
    })
    .from(licenseRoadmaps)
    .leftJoin(trades, eq(licenseRoadmaps.tradeId, trades.id))
    .where(and(...conditions))
    .orderBy(licenseRoadmaps.state, licenseRoadmaps.tradeId);

  res.json(ListLicenseRoadmapsResponse.parse(rows));
});

router.get("/license-roadmaps/:id", async (req, res): Promise<void> => {
  const params = GetLicenseRoadmapParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: licenseRoadmaps.id,
      tradeId: licenseRoadmaps.tradeId,
      state: licenseRoadmaps.state,
      county: licenseRoadmaps.county,
      licenseName: licenseRoadmaps.licenseName,
      requirementType: licenseRoadmaps.requirementType,
      canStartWithoutLicense: licenseRoadmaps.canStartWithoutLicense,
      plainEnglishSummary: licenseRoadmaps.plainEnglishSummary,
      stepsToLicense: licenseRoadmaps.stepsToLicense,
      requiredAge: licenseRoadmaps.requiredAge,
      requiredHours: licenseRoadmaps.requiredHours,
      examRequired: licenseRoadmaps.examRequired,
      examName: licenseRoadmaps.examName,
      apprenticeshipRequired: licenseRoadmaps.apprenticeshipRequired,
      issuingAgencyName: licenseRoadmaps.issuingAgencyName,
      issuingAgencyUrl: licenseRoadmaps.issuingAgencyUrl,
      disclaimer: licenseRoadmaps.disclaimer,
      isActive: licenseRoadmaps.isActive,
      createdAt: licenseRoadmaps.createdAt,
      updatedAt: licenseRoadmaps.updatedAt,
      tradeName: trades.name,
    })
    .from(licenseRoadmaps)
    .leftJoin(trades, eq(licenseRoadmaps.tradeId, trades.id))
    .where(eq(licenseRoadmaps.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "License roadmap not found" });
    return;
  }

  res.json(GetLicenseRoadmapResponse.parse(row));
});

export default router;

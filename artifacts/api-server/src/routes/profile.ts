import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { users, studentProfiles, studentTradeInterests, trades } from "@workspace/db";
import {
  TradeGetProfileQueryParams,
  TradeGetProfileResponse,
  TradeUpsertProfileBody,
  TradeUpsertProfileResponse,
  TradeListTradeInterestsQueryParams,
  TradeListTradeInterestsResponse,
  TradeAddTradeInterestBody,
  TradeRemoveTradeInterestParams,
  TradeRemoveTradeInterestQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  const query = TradeGetProfileQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { clerkUserId } = query.data;

  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));

  if (!user) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, user.id));

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(
    TradeGetProfileResponse.parse({
      ...profile,
      clerkUserId: user.clerkUserId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }),
  );
});

router.post("/profile", async (req, res): Promise<void> => {
  const parsed = TradeUpsertProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clerkUserId, email, firstName, lastName, ...profileData } = parsed.data;

  let [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        clerkUserId,
        email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        role: "student",
      })
      .returning();
  } else {
    [user] = await db
      .update(users)
      .set({
        email,
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
  }

  const [existingProfile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, user.id));

  let profile;
  if (!existingProfile) {
    [profile] = await db
      .insert(studentProfiles)
      .values({
        userId: user.id,
        graduationStatus: profileData.graduationStatus ?? "current_senior",
        graduationYear: profileData.graduationYear ?? null,
        age: profileData.age ?? null,
        zipCode: profileData.zipCode ?? null,
        city: profileData.city ?? null,
        state: profileData.state ?? null,
        hasDriversLicense: profileData.hasDriversLicense ?? false,
        hasTransportation: profileData.hasTransportation ?? false,
        willingToTravelMiles: profileData.willingToTravelMiles ?? 10,
        wantsPaidWorkNow: profileData.wantsPaidWorkNow ?? true,
        interestedInApprenticeship: profileData.interestedInApprenticeship ?? true,
        interestedInTradeSchool: profileData.interestedInTradeSchool ?? false,
        careerGoal: profileData.careerGoal ?? null,
        hasOsha10: profileData.hasOsha10 ?? false,
      })
      .returning();
  } else {
    [profile] = await db
      .update(studentProfiles)
      .set({
        graduationStatus: profileData.graduationStatus ?? existingProfile.graduationStatus,
        graduationYear: profileData.graduationYear ?? existingProfile.graduationYear,
        age: profileData.age ?? existingProfile.age,
        zipCode: profileData.zipCode ?? existingProfile.zipCode,
        city: profileData.city ?? existingProfile.city,
        state: profileData.state ?? existingProfile.state,
        hasDriversLicense: profileData.hasDriversLicense ?? existingProfile.hasDriversLicense,
        hasTransportation: profileData.hasTransportation ?? existingProfile.hasTransportation,
        willingToTravelMiles: profileData.willingToTravelMiles ?? existingProfile.willingToTravelMiles,
        wantsPaidWorkNow: profileData.wantsPaidWorkNow ?? existingProfile.wantsPaidWorkNow,
        interestedInApprenticeship:
          profileData.interestedInApprenticeship ?? existingProfile.interestedInApprenticeship,
        interestedInTradeSchool: profileData.interestedInTradeSchool ?? existingProfile.interestedInTradeSchool,
        careerGoal: profileData.careerGoal ?? existingProfile.careerGoal,
        hasOsha10: profileData.hasOsha10 ?? existingProfile.hasOsha10,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.id, existingProfile.id))
      .returning();
  }

  res.json(
    TradeUpsertProfileResponse.parse({
      ...profile,
      clerkUserId: user.clerkUserId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }),
  );
});

router.get("/profile/trade-interests", async (req, res): Promise<void> => {
  const query = TradeListTradeInterestsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { clerkUserId } = query.data;

  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  if (!user) {
    res.json([]);
    return;
  }

  const rows = await db
    .select({
      id: studentTradeInterests.id,
      studentUserId: studentTradeInterests.studentUserId,
      tradeId: studentTradeInterests.tradeId,
      interestLevel: studentTradeInterests.interestLevel,
      wantsPaidWork: studentTradeInterests.wantsPaidWork,
      wantsTraining: studentTradeInterests.wantsTraining,
      createdAt: studentTradeInterests.createdAt,
      trade: {
        id: trades.id,
        slug: trades.slug,
        name: trades.name,
        category: trades.category,
        description: trades.description,
        beginnerFriendly: trades.beginnerFriendly,
        typicalStartPayMin: trades.typicalStartPayMin,
        typicalStartPayMax: trades.typicalStartPayMax,
        longTermIncomePotential: trades.longTermIncomePotential,
        businessOwnerPotential: trades.businessOwnerPotential,
        commonStartingRoles: trades.commonStartingRoles,
        usefulCertifications: trades.usefulCertifications,
        commonToolsNeeded: trades.commonToolsNeeded,
        isActive: trades.isActive,
        createdAt: trades.createdAt,
        updatedAt: trades.updatedAt,
      },
    })
    .from(studentTradeInterests)
    .innerJoin(trades, eq(studentTradeInterests.tradeId, trades.id))
    .where(eq(studentTradeInterests.studentUserId, user.id));

  res.json(TradeListTradeInterestsResponse.parse(rows));
});

router.post("/profile/trade-interests", async (req, res): Promise<void> => {
  const parsed = TradeAddTradeInterestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clerkUserId, email, tradeId, interestLevel, wantsPaidWork, wantsTraining } = parsed.data;

  let [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  if (!user) {
    [user] = await db
      .insert(users)
      .values({ clerkUserId, email, role: "student" })
      .returning();
  }

  const [existing] = await db
    .select()
    .from(studentTradeInterests)
    .where(and(eq(studentTradeInterests.studentUserId, user.id), eq(studentTradeInterests.tradeId, tradeId)));

  if (existing) {
    res.status(400).json({ error: "Trade interest already exists" });
    return;
  }

  await db.insert(studentTradeInterests).values({
    studentUserId: user.id,
    tradeId,
    interestLevel: interestLevel ?? 3,
    wantsPaidWork: wantsPaidWork ?? true,
    wantsTraining: wantsTraining ?? true,
  });

  const [row] = await db
    .select({
      id: studentTradeInterests.id,
      studentUserId: studentTradeInterests.studentUserId,
      tradeId: studentTradeInterests.tradeId,
      interestLevel: studentTradeInterests.interestLevel,
      wantsPaidWork: studentTradeInterests.wantsPaidWork,
      wantsTraining: studentTradeInterests.wantsTraining,
      createdAt: studentTradeInterests.createdAt,
      trade: {
        id: trades.id,
        slug: trades.slug,
        name: trades.name,
        category: trades.category,
        description: trades.description,
        beginnerFriendly: trades.beginnerFriendly,
        typicalStartPayMin: trades.typicalStartPayMin,
        typicalStartPayMax: trades.typicalStartPayMax,
        longTermIncomePotential: trades.longTermIncomePotential,
        businessOwnerPotential: trades.businessOwnerPotential,
        commonStartingRoles: trades.commonStartingRoles,
        usefulCertifications: trades.usefulCertifications,
        commonToolsNeeded: trades.commonToolsNeeded,
        isActive: trades.isActive,
        createdAt: trades.createdAt,
        updatedAt: trades.updatedAt,
      },
    })
    .from(studentTradeInterests)
    .innerJoin(trades, eq(studentTradeInterests.tradeId, trades.id))
    .where(and(eq(studentTradeInterests.studentUserId, user.id), eq(studentTradeInterests.tradeId, tradeId)));

  res.status(201).json(row);
});

router.delete("/profile/trade-interests/:tradeId", async (req, res): Promise<void> => {
  const params = TradeRemoveTradeInterestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = TradeRemoveTradeInterestQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.clerkUserId, query.data.clerkUserId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [deleted] = await db
    .delete(studentTradeInterests)
    .where(and(eq(studentTradeInterests.studentUserId, user.id), eq(studentTradeInterests.tradeId, params.data.tradeId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Trade interest not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

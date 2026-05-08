import * as zod from "zod";

export const TradeListTradesQueryParams = zod.object({
  category: zod.coerce.string().nullish(),
  beginnerFriendly: zod.coerce.boolean().nullish(),
});

export const TradeGetTradeParams = zod.object({
  id: zod.coerce.number(),
});

export const TradeGetTradeResponse = zod.any();
export const TradeListTradesResponse = zod.array(zod.any());

export const TradeListLicenseRoadmapsQueryParams = zod.object({
  tradeId: zod.coerce.number().nullish(),
  state: zod.coerce.string().nullish(),
});

export const TradeGetLicenseRoadmapParams = zod.object({
  id: zod.coerce.number(),
});

export const TradeListLicenseRoadmapsResponse = zod.array(zod.any());
export const TradeGetLicenseRoadmapResponse = zod.any();

export const TradeGetProfileQueryParams = zod.object({
  clerkUserId: zod.coerce.string(),
});

export const TradeGetProfileResponse = zod.any();

export const TradeUpsertProfileBody = zod.object({
  clerkUserId: zod.string(),
  email: zod.string(),
  firstName: zod.string().nullish(),
  lastName: zod.string().nullish(),
  graduationStatus: zod.string().nullish(),
  graduationYear: zod.number().nullish(),
  age: zod.number().nullish(),
  zipCode: zod.string().nullish(),
  city: zod.string().nullish(),
  state: zod.string().nullish(),
  hasDriversLicense: zod.boolean().nullish(),
  hasTransportation: zod.boolean().nullish(),
  willingToTravelMiles: zod.number().nullish(),
  wantsPaidWorkNow: zod.boolean().nullish(),
  interestedInApprenticeship: zod.boolean().nullish(),
  interestedInTradeSchool: zod.boolean().nullish(),
  careerGoal: zod.string().nullish(),
  hasOsha10: zod.boolean().nullish(),
});

export const TradeUpsertProfileResponse = zod.any();

export const TradeListTradeInterestsQueryParams = zod.object({
  clerkUserId: zod.coerce.string(),
});

export const TradeListTradeInterestsResponse = zod.array(zod.any());

export const TradeAddTradeInterestBody = zod.object({
  clerkUserId: zod.string(),
  email: zod.string().email(),
  tradeId: zod.number(),
  interestLevel: zod.number().nullish(),
  wantsPaidWork: zod.boolean().nullish(),
  wantsTraining: zod.boolean().nullish(),
});

export const TradeRemoveTradeInterestParams = zod.object({
  tradeId: zod.coerce.number(),
});

export const TradeRemoveTradeInterestQueryParams = zod.object({
  clerkUserId: zod.coerce.string(),
});

export const TradeListApplicationsQueryParams = zod.object({
  clerkUserId: zod.coerce.string(),
  status: zod.coerce.string().nullish(),
});

export const TradeListApplicationsResponse = zod.array(zod.any());

export const TradeCreateApplicationBody = zod.object({
  clerkUserId: zod.string(),
  email: zod.string().email(),
  opportunityId: zod.number(),
  status: zod.string().nullish(),
  messageToEmployer: zod.string().nullish(),
  studentNotes: zod.string().nullish(),
});

export const TradeUpdateApplicationParams = zod.object({
  id: zod.coerce.number(),
});

export const TradeUpdateApplicationBody = zod.object({
  status: zod.string().nullish(),
  messageToEmployer: zod.string().nullish(),
  studentNotes: zod.string().nullish(),
  interviewDate: zod.coerce.date().nullish(),
});

export const TradeUpdateApplicationResponse = zod.any();

export const TradeDeleteApplicationParams = zod.object({
  id: zod.coerce.number(),
});

export const TradeListOpportunitiesQueryParams = zod.object({
  tradeId: zod.coerce.number().nullish(),
  employerId: zod.coerce.number().nullish(),
  location: zod.coerce.string().nullish(),
  activeOnly: zod.coerce.boolean().nullish(),
});

export const TradeGetOpportunityParams = zod.object({
  id: zod.coerce.number(),
});

export const TradeCreateOpportunityBody = zod.object({
  employerId: zod.number().nullish(),
  tradeId: zod.number().nullish(),
  title: zod.string(),
  companyName: zod.string().nullish(),
  location: zod.string().nullish(),
  opportunityType: zod.string().nullish(),
  description: zod.string().nullish(),
  requirements: zod.string().nullish(),
  payRange: zod.string().nullish(),
  isActive: zod.boolean().nullish(),
});

export const TradeUpdateOpportunityParams = zod.object({
  id: zod.coerce.number(),
});

export const TradeUpdateOpportunityBody = TradeCreateOpportunityBody.partial();

export const TradeDeleteOpportunityParams = zod.object({
  id: zod.coerce.number(),
});

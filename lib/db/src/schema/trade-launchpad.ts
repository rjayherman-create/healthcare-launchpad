import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category"),
  description: text("description"),
  beginnerFriendly: boolean("beginner_friendly").notNull().default(true),
  typicalStartPayMin: integer("typical_start_pay_min"),
  typicalStartPayMax: integer("typical_start_pay_max"),
  longTermIncomePotential: text("long_term_income_potential"),
  businessOwnerPotential: boolean("business_owner_potential")
    .notNull()
    .default(false),
  commonStartingRoles: text("common_starting_roles"),
  usefulCertifications: text("useful_certifications"),
  commonToolsNeeded: text("common_tools_needed"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id"),
  tradeId: integer("trade_id"),
  title: text("title").notNull(),
  companyName: text("company_name"),
  location: text("location"),
  opportunityType: text("opportunity_type"),
  description: text("description"),
  requirements: text("requirements"),
  payRange: text("pay_range"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const studentProfiles = pgTable("student_profiles_trade", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  graduationStatus: text("graduation_status").notNull().default("current_senior"),
  graduationYear: integer("graduation_year"),
  age: integer("age"),
  zipCode: text("zip_code"),
  city: text("city"),
  state: text("state"),
  hasDriversLicense: boolean("has_drivers_license").notNull().default(false),
  hasTransportation: boolean("has_transportation").notNull().default(false),
  willingToTravelMiles: integer("willing_to_travel_miles").notNull().default(10),
  wantsPaidWorkNow: boolean("wants_paid_work_now").notNull().default(true),
  interestedInApprenticeship: boolean("interested_in_apprenticeship")
    .notNull()
    .default(true),
  interestedInTradeSchool: boolean("interested_in_trade_school")
    .notNull()
    .default(false),
  careerGoal: text("career_goal"),
  hasOsha10: boolean("has_osha10").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const studentTradeInterests = pgTable("student_trade_interests", {
  id: serial("id").primaryKey(),
  studentUserId: integer("student_user_id").notNull(),
  tradeId: integer("trade_id").notNull(),
  interestLevel: integer("interest_level").notNull().default(3),
  wantsPaidWork: boolean("wants_paid_work").notNull().default(true),
  wantsTraining: boolean("wants_training").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const licenseRoadmaps = pgTable("license_roadmaps", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").notNull(),
  state: text("state").notNull(),
  county: text("county"),
  licenseName: text("license_name").notNull(),
  requirementType: text("requirement_type"),
  canStartWithoutLicense: boolean("can_start_without_license")
    .notNull()
    .default(false),
  plainEnglishSummary: text("plain_english_summary"),
  stepsToLicense: text("steps_to_license"),
  requiredAge: integer("required_age"),
  requiredHours: integer("required_hours"),
  examRequired: boolean("exam_required").notNull().default(false),
  examName: text("exam_name"),
  apprenticeshipRequired: boolean("apprenticeship_required")
    .notNull()
    .default(false),
  issuingAgencyName: text("issuing_agency_name"),
  issuingAgencyUrl: text("issuing_agency_url"),
  disclaimer: text("disclaimer"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const opportunityApplications = pgTable("opportunity_applications", {
  id: serial("id").primaryKey(),
  studentUserId: integer("student_user_id").notNull(),
  opportunityId: integer("opportunity_id").notNull(),
  status: text("status").notNull().default("interested"),
  messageToEmployer: text("message_to_employer"),
  studentNotes: text("student_notes"),
  interviewDate: timestamp("interview_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

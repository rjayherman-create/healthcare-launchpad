import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employersTable = pgTable("employers", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  organizationName: text("organization_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  location: text("location"),
  website: text("website"),
  description: text("description"),
  type: text("type"), // hospital | clinic | urgent-care | nursing-home | other
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEmployerSchema = createInsertSchema(employersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type Employer = typeof employersTable.$inferSelect;

import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentProfilesTable = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  school: text("school"),
  graduationYear: integer("graduation_year"),
  specialty: text("specialty"), // nursing | medical-assistant | emt | radiology | pharmacy | administration | other
  certifications: text("certifications"),
  bio: text("bio"),
  location: text("location"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfilesTable.$inferSelect;

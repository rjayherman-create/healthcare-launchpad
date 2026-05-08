CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"specialty" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"salary" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"employer_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"school" text,
	"graduation_year" integer,
	"specialty" text,
	"certifications" text,
	"bio" text,
	"location" text,
	"resume_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_profiles_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "employers" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"organization_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"location" text,
	"website" text,
	"description" text,
	"type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employers_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"cover_letter" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_roadmaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"trade_id" integer NOT NULL,
	"state" text NOT NULL,
	"county" text,
	"license_name" text NOT NULL,
	"requirement_type" text,
	"can_start_without_license" boolean DEFAULT false NOT NULL,
	"plain_english_summary" text,
	"steps_to_license" text,
	"required_age" integer,
	"required_hours" integer,
	"exam_required" boolean DEFAULT false NOT NULL,
	"exam_name" text,
	"apprenticeship_required" boolean DEFAULT false NOT NULL,
	"issuing_agency_name" text,
	"issuing_agency_url" text,
	"disclaimer" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer,
	"trade_id" integer,
	"title" text NOT NULL,
	"company_name" text,
	"location" text,
	"opportunity_type" text,
	"description" text,
	"requirements" text,
	"pay_range" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_user_id" integer NOT NULL,
	"opportunity_id" integer NOT NULL,
	"status" text DEFAULT 'interested' NOT NULL,
	"message_to_employer" text,
	"student_notes" text,
	"interview_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles_trade" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"graduation_status" text DEFAULT 'current_senior' NOT NULL,
	"graduation_year" integer,
	"age" integer,
	"zip_code" text,
	"city" text,
	"state" text,
	"has_drivers_license" boolean DEFAULT false NOT NULL,
	"has_transportation" boolean DEFAULT false NOT NULL,
	"willing_to_travel_miles" integer DEFAULT 10 NOT NULL,
	"wants_paid_work_now" boolean DEFAULT true NOT NULL,
	"interested_in_apprenticeship" boolean DEFAULT true NOT NULL,
	"interested_in_trade_school" boolean DEFAULT false NOT NULL,
	"career_goal" text,
	"has_osha10" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_trade_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_user_id" integer NOT NULL,
	"trade_id" integer NOT NULL,
	"interest_level" integer DEFAULT 3 NOT NULL,
	"wants_paid_work" boolean DEFAULT true NOT NULL,
	"wants_training" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"description" text,
	"beginner_friendly" boolean DEFAULT true NOT NULL,
	"typical_start_pay_min" integer,
	"typical_start_pay_max" integer,
	"long_term_income_potential" text,
	"business_owner_potential" boolean DEFAULT false NOT NULL,
	"common_starting_roles" text,
	"useful_certifications" text,
	"common_tools_needed" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trades_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'student' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);

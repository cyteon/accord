CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "friendships" (
	"userA" uuid NOT NULL,
	"userB" uuid NOT NULL,
	"requesterId" uuid NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"acceptedAt" timestamp with time zone,
	CONSTRAINT "friendships_userA_userB_pk" PRIMARY KEY("userA","userB")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userA_users_id_fk" FOREIGN KEY ("userA") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userB_users_id_fk" FOREIGN KEY ("userB") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesterId_users_id_fk" FOREIGN KEY ("requesterId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
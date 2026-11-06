CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"dmKey" text,
	CONSTRAINT "channels_dmKey_unique" UNIQUE("dmKey")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"channelId" uuid NOT NULL,
	"authorId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_channel_id_idx" ON "messages" USING btree ("channelId","id");
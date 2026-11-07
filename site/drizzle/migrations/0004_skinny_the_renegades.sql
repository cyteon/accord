CREATE TYPE "public"."channel_type" AS ENUM('dm', 'group', 'channel');--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "type" "channel_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "lastMessageId" uuid;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_lastMessageId_messages_id_fk" FOREIGN KEY ("lastMessageId") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;

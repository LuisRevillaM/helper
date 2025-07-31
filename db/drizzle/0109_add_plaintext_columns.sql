ALTER TABLE "conversations_conversation" ADD COLUMN "subject" text;
ALTER TABLE "messages" ADD COLUMN "body" text;
ALTER TABLE "messages" ADD COLUMN "cleaned_up_text" text;
ALTER TABLE "mailboxes_gmailsupportemail" ADD COLUMN "access_token" text;
ALTER TABLE "mailboxes_gmailsupportemail" ADD COLUMN "refresh_token" text;
ALTER TABLE "tool_apis" ADD COLUMN "authentication_token_plaintext" text;
ALTER TABLE "tools" ADD COLUMN "authentication_token_plaintext" text;

-- Create Contacts table
CREATE TABLE IF NOT EXISTS "Contacts" (
    "id" SERIAL PRIMARY KEY,
    "phoneNumber" VARCHAR(20),
    "email" VARCHAR(255),
    "linkedId" INTEGER,
    "linkPrecedence" VARCHAR(10) NOT NULL CHECK ("linkPrecedence" IN ('primary', 'secondary')),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_contacts_email" ON "Contacts" ("email") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_contacts_phone" ON "Contacts" ("phoneNumber") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_contacts_linked_id" ON "Contacts" ("linkedId") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_contacts_precedence" ON "Contacts" ("linkPrecedence") WHERE "deletedAt" IS NULL;

-- Add foreign key constraint
ALTER TABLE "Contacts" 
ADD CONSTRAINT "fk_contacts_linked_id" 
FOREIGN KEY ("linkedId") REFERENCES "Contacts"("id") ON DELETE SET NULL;

-- Add check constraint to ensure at least one identifier is present
ALTER TABLE "Contacts" 
ADD CONSTRAINT "chk_contacts_has_identifier" 
CHECK ("email" IS NOT NULL OR "phoneNumber" IS NOT NULL);

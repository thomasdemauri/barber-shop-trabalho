-- Every appointment now belongs to a barber ("first available" is resolved at booking time).
-- Legacy unassigned appointments are attached to the first barber so the column can become required.
UPDATE "Appointment"
SET "barberId" = (SELECT "id" FROM "Barber" ORDER BY "id" LIMIT 1)
WHERE "barberId" IS NULL;

ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_barberId_fkey";
ALTER TABLE "Appointment" ALTER COLUMN "barberId" SET NOT NULL;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Appointment_barberId_startsAt_idx" ON "Appointment"("barberId", "startsAt");

CREATE TABLE "PasswordResetToken" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("tokenHash")
);
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ShopSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

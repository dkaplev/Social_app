-- AlterTable
ALTER TABLE "Event" ADD COLUMN "templateId" TEXT;

-- AlterTable
ALTER TABLE "FriendPrefs" ADD COLUMN "weekdayEveningsOk" BOOLEAN;

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "friendId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proposedSlots" JSONB NOT NULL,
    "chosenSlot" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "durationMinutes" INTEGER NOT NULL DEFAULT 90,
    "templateId" TEXT,
    "recurringWanted" BOOLEAN NOT NULL DEFAULT false,
    "counterNote" TEXT,
    CONSTRAINT "Invite_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Friend" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Invite" ("chosenSlot", "createdAt", "friendId", "id", "proposedSlots", "status", "token") SELECT "chosenSlot", "createdAt", "friendId", "id", "proposedSlots", "status", "token" FROM "Invite";
DROP TABLE "Invite";
ALTER TABLE "new_Invite" RENAME TO "Invite";
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

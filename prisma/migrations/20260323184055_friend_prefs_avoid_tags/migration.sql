-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FriendPrefs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "friendId" TEXT NOT NULL,
    "vibeQuietLively" INTEGER NOT NULL DEFAULT 50,
    "maxTravelMinutes" INTEGER NOT NULL DEFAULT 30,
    "budgetBand" TEXT NOT NULL DEFAULT 'mid',
    "durationBand" TEXT NOT NULL DEFAULT '90m',
    "categories" JSONB NOT NULL DEFAULT [],
    "avoidTags" JSONB NOT NULL DEFAULT [],
    CONSTRAINT "FriendPrefs_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Friend" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FriendPrefs" ("budgetBand", "categories", "durationBand", "friendId", "id", "maxTravelMinutes", "vibeQuietLively") SELECT "budgetBand", "categories", "durationBand", "friendId", "id", "maxTravelMinutes", "vibeQuietLively" FROM "FriendPrefs";
DROP TABLE "FriendPrefs";
ALTER TABLE "new_FriendPrefs" RENAME TO "FriendPrefs";
CREATE UNIQUE INDEX "FriendPrefs_friendId_key" ON "FriendPrefs"("friendId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

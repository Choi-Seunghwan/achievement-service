/*
  Warnings:

  - A unique constraint covering the columns `[account_id,public_achievement_id,joined_at]` on the table `achievement_participant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "achievement_participant_account_id_public_achievement_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "achievement_participant_account_id_public_achievement_id_jo_key" ON "achievement_participant"("account_id", "public_achievement_id", "joined_at");

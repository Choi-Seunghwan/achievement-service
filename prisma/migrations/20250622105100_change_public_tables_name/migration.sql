/*
  Warnings:

  - You are about to drop the `AchievementParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublicAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublicMission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublicMissionTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AchievementParticipant" DROP CONSTRAINT "AchievementParticipant_public_achievement_id_fkey";

-- DropForeignKey
ALTER TABLE "PublicMission" DROP CONSTRAINT "PublicMission_public_achievement_id_fkey";

-- DropForeignKey
ALTER TABLE "PublicMissionTask" DROP CONSTRAINT "PublicMissionTask_public_mission_id_fkey";

-- DropTable
DROP TABLE "AchievementParticipant";

-- DropTable
DROP TABLE "PublicAchievement";

-- DropTable
DROP TABLE "PublicMission";

-- DropTable
DROP TABLE "PublicMissionTask";

-- CreateTable
CREATE TABLE "public_achievement" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "public_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_mission" (
    "id" SERIAL NOT NULL,
    "public_achievement_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "repeatType" "MissionRepeatType" NOT NULL,
    "repeatDays" "MissionRepeatDay"[],
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "public_mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_mission_task" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "public_mission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "public_mission_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_participant" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "public_achievement_id" INTEGER NOT NULL,
    "personal_achievement_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_participant_account_id_public_achievement_id_key" ON "achievement_participant"("account_id", "public_achievement_id");

-- AddForeignKey
ALTER TABLE "public_mission" ADD CONSTRAINT "public_mission_public_achievement_id_fkey" FOREIGN KEY ("public_achievement_id") REFERENCES "public_achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_mission_task" ADD CONSTRAINT "public_mission_task_public_mission_id_fkey" FOREIGN KEY ("public_mission_id") REFERENCES "public_mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_participant" ADD CONSTRAINT "achievement_participant_public_achievement_id_fkey" FOREIGN KEY ("public_achievement_id") REFERENCES "public_achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

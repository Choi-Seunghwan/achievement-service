-- CreateTable
CREATE TABLE "PublicAchievement" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "PublicAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicMission" (
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

    CONSTRAINT "PublicMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicMissionTask" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "public_mission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "PublicMissionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementParticipant" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "public_achievement_id" INTEGER NOT NULL,
    "personal_achievement_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AchievementParticipant_account_id_public_achievement_id_key" ON "AchievementParticipant"("account_id", "public_achievement_id");

-- AddForeignKey
ALTER TABLE "PublicMission" ADD CONSTRAINT "PublicMission_public_achievement_id_fkey" FOREIGN KEY ("public_achievement_id") REFERENCES "PublicAchievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicMissionTask" ADD CONSTRAINT "PublicMissionTask_public_mission_id_fkey" FOREIGN KEY ("public_mission_id") REFERENCES "PublicMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementParticipant" ADD CONSTRAINT "AchievementParticipant_public_achievement_id_fkey" FOREIGN KEY ("public_achievement_id") REFERENCES "PublicAchievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

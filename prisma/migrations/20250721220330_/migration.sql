-- CreateTable
CREATE TABLE "public_achievement_comment" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "public_achievement_id" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "public_achievement_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "public_achievement_comment_account_id_idx" ON "public_achievement_comment"("account_id");

-- CreateIndex
CREATE INDEX "achievement_account_id_publicAchievementId_idx" ON "achievement"("account_id", "publicAchievementId");

-- CreateIndex
CREATE INDEX "achievement_participant_account_id_public_achievement_id_idx" ON "achievement_participant"("account_id", "public_achievement_id");

-- CreateIndex
CREATE INDEX "mission_achievement_id_publicMissionId_idx" ON "mission"("achievement_id", "publicMissionId");

-- CreateIndex
CREATE INDEX "mission_histories_mission_id_task_id_idx" ON "mission_histories"("mission_id", "task_id");

-- CreateIndex
CREATE INDEX "mission_tag_mission_id_tag_id_idx" ON "mission_tag"("mission_id", "tag_id");

-- CreateIndex
CREATE INDEX "mission_task_mission_id_publicMissionTaskId_idx" ON "mission_task"("mission_id", "publicMissionTaskId");

-- CreateIndex
CREATE INDEX "public_achievement_creator_id_idx" ON "public_achievement"("creator_id");

-- CreateIndex
CREATE INDEX "public_mission_public_achievement_id_idx" ON "public_mission"("public_achievement_id");

-- CreateIndex
CREATE INDEX "public_mission_task_public_mission_id_idx" ON "public_mission_task"("public_mission_id");

-- CreateIndex
CREATE INDEX "tag_account_id_idx" ON "tag"("account_id");

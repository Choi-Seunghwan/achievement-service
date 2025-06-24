-- AlterTable
ALTER TABLE "achievement" ADD COLUMN     "publicAchievementId" INTEGER;

-- AlterTable
ALTER TABLE "mission" ADD COLUMN     "publicMissionId" INTEGER;

-- AlterTable
ALTER TABLE "mission_task" ADD COLUMN     "publicMissionTaskId" INTEGER;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_publicMissionId_fkey" FOREIGN KEY ("publicMissionId") REFERENCES "public_mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_task" ADD CONSTRAINT "mission_task_publicMissionTaskId_fkey" FOREIGN KEY ("publicMissionTaskId") REFERENCES "public_mission_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_publicAchievementId_fkey" FOREIGN KEY ("publicAchievementId") REFERENCES "public_achievement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

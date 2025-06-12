-- CreateEnum
CREATE TYPE "AchievementStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "achievement" ADD COLUMN     "status" "AchievementStatus" NOT NULL DEFAULT 'IN_PROGRESS';

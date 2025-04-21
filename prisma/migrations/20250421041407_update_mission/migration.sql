/*
  Warnings:

  - The values [DELETED] on the enum `MissionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tasks` on the `mission` table. All the data in the column will be lost.
  - Added the required column `repeat_type` to the `mission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MissionTaskStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MissionRepeatType" AS ENUM ('NONE', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "MissionRepeatDay" AS ENUM ('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');

-- AlterEnum
BEGIN;
CREATE TYPE "MissionStatus_new" AS ENUM ('IN_PROGRESS', 'COMPLETED');
ALTER TABLE "mission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "mission" ALTER COLUMN "status" TYPE "MissionStatus_new" USING ("status"::text::"MissionStatus_new");
ALTER TYPE "MissionStatus" RENAME TO "MissionStatus_old";
ALTER TYPE "MissionStatus_new" RENAME TO "MissionStatus";
DROP TYPE "MissionStatus_old";
ALTER TABLE "mission" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "mission" DROP COLUMN "tasks",
ADD COLUMN     "repeat_days" "MissionRepeatDay"[],
ADD COLUMN     "repeat_type" "MissionRepeatType" NOT NULL;

-- CreateTable
CREATE TABLE "mission_task" (
    "id" SERIAL NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MissionTaskStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mission_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_histories" (
    "id" SERIAL NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "task_id" INTEGER,
    "completed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mission_task" ADD CONSTRAINT "mission_task_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

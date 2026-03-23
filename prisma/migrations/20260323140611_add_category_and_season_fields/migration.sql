-- AlterTable
ALTER TABLE "public_achievement" ADD COLUMN     "category" VARCHAR(50),
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3);

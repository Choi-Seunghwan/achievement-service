/*
  Warnings:

  - You are about to drop the column `progress` on the `mission` table. All the data in the column will be lost.
  - You are about to drop the column `progressMax` on the `mission` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `mission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mission" DROP COLUMN "progress",
DROP COLUMN "progressMax",
DROP COLUMN "type";

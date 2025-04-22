-- AlterTable
ALTER TABLE "mission" ADD COLUMN     "icon" TEXT;

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_tag" (
    "id" SERIAL NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "mission_tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mission_tag_mission_id_tag_id_key" ON "mission_tag"("mission_id", "tag_id");

-- AddForeignKey
ALTER TABLE "mission_tag" ADD CONSTRAINT "mission_tag_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_tag" ADD CONSTRAINT "mission_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

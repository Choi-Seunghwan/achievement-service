-- AddForeignKey
ALTER TABLE "public_achievement_comment" ADD CONSTRAINT "public_achievement_comment_public_achievement_id_fkey" FOREIGN KEY ("public_achievement_id") REFERENCES "public_achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

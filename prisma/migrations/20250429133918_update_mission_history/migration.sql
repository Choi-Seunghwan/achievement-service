-- AddForeignKey
ALTER TABLE "mission_histories" ADD CONSTRAINT "mission_histories_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

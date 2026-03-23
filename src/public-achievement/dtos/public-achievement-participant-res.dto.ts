import { AccountInfoDto } from './public-achievement-comment-res.dto';

export class PublicAchievementParticipantResDto {
  id: number;
  accountId: number;
  account: AccountInfoDto | null;
  publicAchievementId: number;
}

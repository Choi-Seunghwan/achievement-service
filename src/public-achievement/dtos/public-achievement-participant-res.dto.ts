import { AccountResDto } from 'src/account/dto/account-res.dto';

export class PublicAchievementParticipantResDto {
  id: number;
  accountId: number;
  account: AccountResDto | null;
  publicAchievementId: number;
}

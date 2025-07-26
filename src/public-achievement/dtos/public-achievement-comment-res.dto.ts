import { AccountResDto } from 'src/account/dto/account-res.dto';

export class PublicAchievementCommentResDto {
  id: number;
  publicAchievementId: number;
  accountId: number;
  account: AccountResDto;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

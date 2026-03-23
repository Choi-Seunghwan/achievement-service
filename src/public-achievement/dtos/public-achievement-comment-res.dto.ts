export class AccountInfoDto {
  id: number;
  nickname?: string;
  email?: string;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class PublicAchievementCommentResDto {
  id: number;
  publicAchievementId: number;
  accountId: number;
  account: AccountInfoDto;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

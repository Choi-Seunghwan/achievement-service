export class AccountResDto {
  id: number;
  loginId?: string;
  nickname?: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

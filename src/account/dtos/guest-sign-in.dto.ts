import { IsString } from 'class-validator';

export class GuestSignIn {
  @IsString()
  guestId: string;
}

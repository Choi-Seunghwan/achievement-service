import { ApiProperty } from '@nestjs/swagger';
import { AccountResponseDto } from './account-response.dto';

export class SignInResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  account: AccountResponseDto;
}

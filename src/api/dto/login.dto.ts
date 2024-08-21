import {
  IsNotEmpty, IsString, IsUUID, MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  // @MaxLength(80)
  loginId: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsUUID()
  @IsNotEmpty()
  applicationId: string;
}

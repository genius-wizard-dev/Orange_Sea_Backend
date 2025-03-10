import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDTO {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  newPassword: string;
}

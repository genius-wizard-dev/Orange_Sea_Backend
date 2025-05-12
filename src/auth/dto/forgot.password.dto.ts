import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
export class ForgotPasswordDTO {
  @ApiProperty({ description: 'Email', example: faker.internet.email() })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDTO {
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    minLength: 6,
    example: faker.internet.password({
      length: 10,
      pattern: /[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      prefix: 'Abc1!',
    }),
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/,
    {
      message:
        'Mật khẩu phải có ít nhất 6 ký tự, chứa chữ thường, chữ in hoa, số và ký tự đặc biệt',
    },
  )
  newPassword: string;
}

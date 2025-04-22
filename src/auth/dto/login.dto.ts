import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    description: 'The username',
    minimum: 5,
    maximum: 50,
    required: false,
  })
  @IsString()
  @Length(5, 50)
  @IsOptional()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', minLength: 5, maxLength: 50 })
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
  password: string;
}

export class LoginUserResponseDto {
  @ApiProperty({
    description: 'The access token',
    minimum: 5,
    maximum: 50,
  })
  @IsString()
  @Length(5, 50)
  access_token: string;

  @ApiProperty({
    description: 'The refresh token',
    minimum: 5,
    maximum: 50,
  })
  @IsString()
  @Length(5, 50)
  refresh_token: string;
}

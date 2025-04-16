import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    description: 'The username or email',
    minimum: 5,
    maximum: 50,
    required: false,
  })
  @IsString()
  @Length(5, 50)
  @IsOptional()
  username?: string;

  // @ApiProperty({
  //   description: 'The email',
  //   minimum: 5,
  //   maximum: 50,
  //   required: false,
  // })
  // @IsString()
  // @Length(5, 50)
  // @IsOptional()
  // email?: string;

  @ApiProperty({ description: 'Mật khẩu', minLength: 5, maxLength: 50 })
  @IsString()
  @Length(5, 50)
  @Matches(
    /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,50}$/,
    {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ số và 1 ký tự đặc biệt',
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

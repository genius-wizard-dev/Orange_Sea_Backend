import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class LoginUserDto {
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

  @ApiProperty({
    description: 'The email',
    minimum: 5,
    maximum: 50,
    required: false,
  })
  @IsString()
  @Length(5, 50)
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The password',
    minimum: 5,
    maximum: 50,
  })
  @IsString()
  @Length(5, 50)
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

  @ApiProperty({
    description: 'Account information',
  })
  account: {
    id: string;
    email: string;
    username: string;
    role: string;
  };

  @ApiProperty({
    description: 'Profile information',
  })
  profile: {
    id: string;
    name: string;
    avatar: string;
  };
}

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Tên đăng nhập', minLength: 5, maxLength: 50 })
  @IsString()
  @Length(5, 50)
  username: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    minLength: 5,
    maxLength: 50,
  })
  @IsEmail()
  @Length(5, 50)
  email: string;

  @ApiProperty({ description: 'Mật khẩu', minLength: 5, maxLength: 50 })
  @IsString()
  @Length(5, 50)
  password: string;

  @ApiProperty({
    description: 'Vai trò người dùng',
    enum: Role,
    default: Role.USER,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'ID của tài khoản',
  })
  accountId: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
  })
  username: string;

  @ApiProperty({
    description: 'Địa chỉ email',
  })
  email: string;

  @ApiProperty({
    description: 'ID của profile',
  })
  profileId: string;
}

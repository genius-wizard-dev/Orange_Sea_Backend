import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'The username', minLength: 5, maxLength: 50 })
  @IsString()
  @Length(5, 50)
  username: string;

  @ApiProperty({
    description: 'The email address',
    minLength: 5,
    maxLength: 50,
  })
  @IsEmail()
  @Length(5, 50)
  email: string;

  @ApiProperty({ description: 'The password', minLength: 5, maxLength: 50 })
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

  @ApiProperty({
    description: 'Account role',
    enum: Role,
    default: Role.USER,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  // Profile fields
  @ApiProperty({ description: 'The full name', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^(0|\+84)(\d{9,10})$/, {
    message:
      'Số điện thoại không hợp lệ. Định dạng hợp lệ: 0xxxxxxxxx hoặc +84xxxxxxxxx',
  })
  phone?: string;

  @ApiProperty({ description: 'Biography', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'Birthday in ISO format', required: false })
  @IsDateString()
  @IsOptional()
  birthday?: string;
}

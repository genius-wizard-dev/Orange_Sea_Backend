import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
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
  @IsString()
  @Length(5, 50)
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

  @ApiProperty({ description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
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

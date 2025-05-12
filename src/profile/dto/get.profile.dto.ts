import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetProfileDTO {
  @ApiProperty({
    description: 'ID của profile',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Tên người dùng',
    example: faker.person.fullName(),
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL ảnh đại diện',
    example: faker.internet.url(),
  })
  @IsString()
  avatar: string;

  @ApiProperty({
    description: 'Tiểu sử người dùng',
    example: faker.person.bio(),
  })
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: Role.USER,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'Số điện thoại',
    example: faker.phone.number(),
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Giới tính',
    enum: Gender,
    example: Gender.M,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Ngày sinh',
    example: faker.date.birthdate(),
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  birthday: Date | null;

  @ApiProperty({
    description: 'Email người dùng',
    example: faker.internet.email(),
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
    example: faker.internet.userName(),
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'ID của tài khoản',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  accountID: string;

  @ApiProperty({
    description: 'Trạng thái thiết lập profile',
    example: true,
  })
  @IsBoolean()
  isSetup: boolean;
}

export class GetProfileIdResponseDTO {
  @ApiProperty({
    description: 'ID của profile',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  profileId: string;
}

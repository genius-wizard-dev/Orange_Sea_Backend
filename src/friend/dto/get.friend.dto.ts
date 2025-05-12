import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class FriendResponse {
  @ApiProperty({
    description: 'ID của mối quan hệ bạn bè',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'ID của profile người dùng',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  profileId: string;

  @ApiProperty({
    description: 'Tên người dùng',
    example: faker.person.fullName(),
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({
    description: 'URL hình đại diện của người dùng',
    example: faker.image.avatar(),
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  avatar?: string | null;

  @ApiProperty({
    description: 'Thông tin giới thiệu',
    example: faker.person.bio(),
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  bio?: string | null;

  @ApiProperty({
    description: 'Số điện thoại',
    example: `09${faker.string.numeric(8)}`,
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  phone?: string | null;

  @ApiProperty({
    description: 'Email người dùng',
    example: faker.internet.email(),
    required: false,
    nullable: true,
  })
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiProperty({
    description: 'Ngày sinh',
    example: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    required: false,
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  birthday?: Date | null;
}

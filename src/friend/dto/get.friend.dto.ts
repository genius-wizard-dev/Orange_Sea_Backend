import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class FriendResponse {
  @ApiProperty({
    description: 'ID của mối quan hệ bạn bè',
    example: 'friendShip-id',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'ID của profile người dùng',
    example: 'profile-id',
  })
  @IsString()
  profileId: string;

  @ApiProperty({
    description: 'Tên người dùng',
    example: 'Nguyễn Văn A',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({
    description: 'URL hình đại diện của người dùng',
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  avatar?: string | null;

  @ApiProperty({
    description: 'Thông tin giới thiệu',
    example: 'Hello world',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  bio?: string | null;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0912345678',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  phone?: string | null;

  @ApiProperty({
    description: 'Email người dùng',
    example: 'example@gmail.com',
    required: false,
    nullable: true,
  })
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiProperty({
    description: 'Ngày sinh',
    example: '2000-01-01',
    required: false,
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  birthday?: Date | null;
}

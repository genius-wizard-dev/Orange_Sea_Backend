import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class AccountResponseDto {
  @ApiProperty({ description: 'ID tài khoản' })
  id: string;

  @ApiProperty({ description: 'Địa chỉ email' })
  email: string;

  @ApiProperty({ description: 'Tên đăng nhập' })
  username: string;

  @ApiProperty({ description: 'Vai trò người dùng', enum: Role })
  role: Role;

  @ApiProperty({ description: 'Thời gian tạo tài khoản' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật tài khoản' })
  updatedAt: Date;

  @Exclude()
  password?: string;
}

export class ProfileResponseDto {
  @ApiProperty({ description: 'ID hồ sơ' })
  id: string;

  @ApiProperty({ description: 'ID tài khoản mà hồ sơ này thuộc về' })
  accountId: string;

  @ApiProperty({
    description: 'Họ tên đầy đủ',
    required: false,
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'URL ảnh đại diện',
    required: false,
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({ description: 'Tiểu sử', required: false, nullable: true })
  bio: string | null;

  @ApiProperty({
    description: 'Số điện thoại',
    required: false,
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({ description: 'Ngày sinh', required: false, nullable: true })
  birthday: Date | null;

  @ApiProperty({ description: 'Thời gian tạo hồ sơ' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật hồ sơ' })
  updatedAt: Date;
}

export class AccountWithProfileResponseDto {
  @ApiProperty({ description: 'ID tài khoản' })
  id: string;

  @ApiProperty({ description: 'Địa chỉ email' })
  email: string;

  @ApiProperty({ description: 'Tên đăng nhập' })
  username: string;

  @ApiProperty({ description: 'Vai trò người dùng', enum: Role })
  role: Role;

  @ApiProperty({ description: 'Thời gian tạo tài khoản' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật tài khoản' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Thông tin hồ sơ',
    required: false,
    nullable: true,
  })
  profile: ProfileResponseDto | null;
}

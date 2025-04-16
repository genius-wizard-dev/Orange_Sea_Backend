import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDTO {
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
  @Matches(
    /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,50}$/,
    {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ số và 1 ký tự đặc biệt',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: Role,
    default: Role.USER,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

export class RegisterResponseDTO {
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

export class RegisterResponse {
  @ApiProperty({
    description: 'Địa chỉ email đã đăng ký',
  })
  email: string;

  @ApiProperty({
    description: 'Trạng thái đang chờ xác thực OTP',
    example: true,
  })
  isPending: boolean;

  @ApiProperty({
    description: 'Thông báo kết quả',
    required: false,
    example: 'OTP đã được gửi thành công',
  })
  message?: string;
  @ApiProperty({
    description: 'Key',
    required: false,
    example: 'Gửi key',
  })
  key?: string;
}

export class RegisterPendingDataDTO extends RegisterDTO {
  otp: string;
}

export class RegisterOtpVerifyDTO {
  @ApiProperty({ description: 'Email đăng ký' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mã OTP' })
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({ description: 'Email đăng ký' })
  @IsEmail()
  email: string;
}

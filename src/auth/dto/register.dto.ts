import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
export class RegisterDTO {
  @ApiProperty({
    description: 'Tên đăng nhập',
    minLength: 5,
    maxLength: 50,
    example: faker.internet.username(),
  })
  @IsString()
  @Length(5, 50)
  username: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    minLength: 5,
    maxLength: 50,
    example: faker.internet.email(),
  })
  @IsEmail()
  @Length(5, 50)
  email: string;

  @ApiProperty({
    description: 'Mật khẩu',
    minLength: 6,
    maxLength: 50,
    example: faker.internet.password({
      length: 10,
      pattern: /[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      prefix: 'Abc1!',
    }),
  })
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
    description: 'Vai trò của người dùng',
    enum: Role,
    default: Role.USER,
    example: Role.USER,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

export class RegisterResponseDTO {
  @ApiProperty({
    description: 'ID của tài khoản',
    example: faker.database.mongodbObjectId(),
  })
  accountId: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
    example: faker.internet.username(),
  })
  username: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    example: faker.internet.email(),
  })
  email: string;

  @ApiProperty({
    description: 'ID của profile',
    example: faker.database.mongodbObjectId(),
  })
  profileId: string;
}

export class RegisterResponse {
  @ApiProperty({
    description: 'Địa chỉ email đã đăng ký',
    example: faker.internet.email(),
  })
  email: string;

  @ApiProperty({
    description: 'Trạng thái đang chờ xác thực OTP',
    example: true,
  })
  isPending: boolean;

  @ApiProperty({
    description: 'Key',
    required: false,
    example: faker.string.uuid(),
  })
  key?: string;
}

export class RegisterPendingDataDTO extends RegisterDTO {
  otp: string;
}

export class RegisterOtpVerifyDTO {
  @ApiProperty({
    description: 'Email đăng ký',
    example: faker.internet.email(),
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mã OTP', example: faker.string.uuid() })
  otp: string;
}

export class ResendOtpDTO {
  @ApiProperty({
    description: 'Email đăng ký',
    example: faker.internet.email(),
  })
  @IsEmail()
  email: string;
}

export class CheckRegister {
  @ApiProperty({
    description: 'Key xác thực',
    example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
  })
  key: string;

  @ApiProperty({
    description: 'Email đăng ký',
    example: faker.internet.email(),
  })
  @IsEmail()
  email: string;
}

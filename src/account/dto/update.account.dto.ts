import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdatePasswordDTO {
  @ApiProperty({
    description: 'Mật khẩu hiện tại (bắt buộc khi thay đổi mật khẩu)',
    minLength: 5,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @Length(5, 50)
  currentPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    minLength: 5,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @Length(5, 50)
  newPassword: string;
}

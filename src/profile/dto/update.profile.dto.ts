import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Tên đầy đủ',
    minLength: 2,
    maxLength: 100,
    required: false
  })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Số điện thoại',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Tiểu sử',
    required: false
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'URL ảnh đại diện',
    required: false
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Ngày sinh (định dạng ISO)',
    required: false
  })
  @IsDateString()
  @IsOptional()
  birthday?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateProfileDTO {
  @ApiProperty({
    description: 'Tên đầy đủ',
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  @Matches(
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/,
    {
      message: 'Tên chỉ được chứa chữ cái, dấu và khoảng trắng',
    },
  )
  name?: string;

  @ApiProperty({
    description: 'Số điện thoại',
    required: false,
    example: '0912345678',
  })
  @IsString()
  @IsOptional()
  @Matches(/^(0|\+84)(\d{9,10})$/, {
    message:
      'Số điện thoại không hợp lệ. Phải là số điện thoại Việt Nam (bắt đầu bằng 0 hoặc +84 và có 9-10 chữ số)',
  })
  phone?: string;

  @ApiProperty({
    description: 'Tiểu sử',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Giới tính',
    enum: Gender,
    required: false,
  })
  @IsString()
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: 'URL ảnh đại diện',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Ngày sinh (định dạng ISO)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  birthday?: string;
}

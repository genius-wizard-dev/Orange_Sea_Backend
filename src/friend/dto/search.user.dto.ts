import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchUserDTO{
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tên người dùng hoặc số điện thoại)',
    example: 'nguyen',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty({ message: 'Từ khóa tìm kiếm không được để trống' })
  @MinLength(2, { message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' })
  keyword: string;
}

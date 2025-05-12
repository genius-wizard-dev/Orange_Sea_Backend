import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RenameGroupDTO {
  @ApiProperty({
    description: 'Tên mới của nhóm',
    example: 'Nhóm bạn thân',
  })
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @IsString({ message: 'Tên nhóm phải là chuỗi' })
  @MaxLength(100, { message: 'Tên nhóm không được vượt quá 100 ký tự' })
  name: string;
}

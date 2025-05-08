import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({
    description: 'Nội dung mới của tin nhắn',
    example: 'Nội dung tin nhắn đã chỉnh sửa',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @MinLength(1, { message: 'Nội dung tin nhắn cần có ít nhất 1 ký tự' })
  newContent: string;
}

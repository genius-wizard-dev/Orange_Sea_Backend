import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'ID của nhóm chat' })
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty({ description: 'Nội dung tin nhắn', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Loại tin nhắn',
    enum: MessageType,
    default: MessageType.TEXT,
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    description: 'File đính kèm (hình ảnh, video hoặc file)',
    required: false,
  })
  file?: Express.Multer.File;
}

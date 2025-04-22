import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'ID của người gửi tin nhắn',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    description: 'ID của nhóm chat nhận tin nhắn',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Xin chào mọi người!',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'Loại tin nhắn (TEXT, IMAGE, VIDEO, FILE, AUDIO, STICKER)',
    enum: MessageType,
    default: MessageType.TEXT,
    example: MessageType.TEXT,
    required: false,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;
}

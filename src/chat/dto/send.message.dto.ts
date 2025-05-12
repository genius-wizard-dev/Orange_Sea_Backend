import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'ID của nhóm chat',
    example: faker.database.mongodbObjectId(),
  })
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    required: false,
    example: faker.lorem.sentence(),
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Loại tin nhắn',
    enum: MessageType,
    default: MessageType.TEXT,
    required: false,
    example: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    description: 'File đính kèm (hình ảnh, video hoặc file)',
    required: false,
    type: 'string',
    format: 'binary',
    example: 'file_content',
  })
  file?: Express.Multer.File;
}

export class MessageIdResponseDTO {
  @ApiProperty({
    description: 'ID của tin nhắn',
    example: faker.database.mongodbObjectId(),
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  messageId: string;
}

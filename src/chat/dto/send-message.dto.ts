import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Sender ID to send message to' })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({ description: 'Group ID to send message to' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @ApiProperty({ description: 'Base64 encoded file data' })
  @IsString()
  @IsOptional()
  fileData?: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString()
  @IsOptional()
  mimeType?: string;
}

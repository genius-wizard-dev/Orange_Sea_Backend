import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecallMessageDto {
  @ApiProperty({
    description: 'ID của tin nhắn cần thu hồi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  messageId: string;
}

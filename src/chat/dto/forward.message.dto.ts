import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForwardMessageDto {
  @ApiProperty({
    description: 'ID của tin nhắn cần chuyển tiếp',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    description: 'ID của nhóm chat đích để chuyển tiếp tin nhắn đến',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  groupId: string;
}

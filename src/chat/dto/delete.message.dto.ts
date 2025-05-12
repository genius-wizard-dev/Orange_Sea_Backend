import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteMessageDto {
  @ApiProperty({
    description: 'ID của tin nhắn cần xóa',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  @IsNotEmpty()
  messageId: string;
}

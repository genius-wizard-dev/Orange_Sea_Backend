import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForwardMessageDto {
  @ApiProperty({
    description: 'ID của tin nhắn cần chuyển tiếp',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    description: 'ID của nhóm chat đích để chuyển tiếp tin nhắn đến',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  @IsNotEmpty()
  targetGroupId: string;
}

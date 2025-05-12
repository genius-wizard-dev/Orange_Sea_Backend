import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendshipDTO {
  @ApiProperty({
    description: 'ID của người nhận lời mời kết bạn',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  @IsNotEmpty({ message: 'ID người nhận không được để trống' })
  receiverId: string;
}

export class CreateFriendshipResponseDTO {
  @ApiProperty({
    description: 'ID của lời mời kết bạn',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  @IsNotEmpty({ message: 'ID lời mời kết bạn không được để trống' })
  friendshipId: string;
}

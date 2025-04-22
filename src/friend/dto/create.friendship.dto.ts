import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendshipDto {
  @ApiProperty({
    description: 'ID của người nhận lời mời kết bạn',
    example: 'profile-id',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID người nhận không được để trống' })
  receiverId: string;
}

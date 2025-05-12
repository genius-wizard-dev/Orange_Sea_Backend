
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CheckFriendshipResponseDto {
  @ApiProperty({
    description: 'Trạng thái mối quan hệ bạn bè',
    example: true,
  })
  @IsBoolean()
  isFriend: boolean;
}

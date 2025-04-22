import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FriendshipResponseDto {
  @ApiProperty({
    description: 'ID của mối quan hệ bạn bè',
    example: 'friendShip-id',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Trạng thái của mối quan hệ',
    example: 'PENDING',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Thông báo kết quả',
    example: 'Yêu cầu kết bạn đã được gửi thành công',
  })
  @IsString()
  message: string;
}

import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FriendshipResponseDTO {
  @ApiProperty({
    description: 'ID của mối quan hệ bạn bè',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Trạng thái của mối quan hệ',
    example: faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'REJECTED']),
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Thông báo kết quả',
    example: faker.helpers.arrayElement([
      'Yêu cầu kết bạn đã được gửi thành công',
      'Đã chấp nhận lời mời kết bạn',
      'Đã từ chối lời mời kết bạn',
    ]),
  })
  @IsString()
  message: string;
}

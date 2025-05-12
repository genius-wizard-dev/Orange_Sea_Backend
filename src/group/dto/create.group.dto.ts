import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGroupDTO {
  @ApiProperty({
    description: 'Tên của nhóm',
    example: 'Nhóm học tập',
    required: false,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Danh sách ID của thành viên tham gia nhóm',
    example: [
      faker.database.mongodbObjectId(),
      faker.database.mongodbObjectId(),
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2, {
    message: 'Phải có ít nhất có 3 thành viên để tạo nhóm',
  })
  participantIds: string[];

  @ApiProperty({
    description: 'Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp',
    example: true,
    default: false,
    required: false,
  })
  @IsBoolean()
  isGroup: boolean;
}

export class GroupIdResponseDTO {
  @ApiProperty({
    description: 'ID của nhóm',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

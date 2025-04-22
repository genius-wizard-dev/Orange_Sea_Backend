import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Tên của nhóm',
    example: 'Nhóm học tập',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Danh sách ID của thành viên tham gia nhóm',
    example: ['profile-id-1', 'profile-id-2'],
    type: [String],
  })
  @IsArray()
  participantIds: string[];

  @ApiProperty({
    description: 'Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp',
    example: true,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';

class ParticipantUserDto {
  @ApiProperty({
    description: 'ID của hồ sơ người dùng',
    example: 'profile-id-1',
  })
  id: string;

  @ApiProperty({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({
    description: 'Ảnh đại diện',
    example: 'https://example.com/avatar.jpg',
  })
  avatar: string;
}

class ParticipantDto {
  @ApiProperty({
    description: 'ID của thành viên trong nhóm',
    example: 'participant-id-1',
  })
  id: string;

  @ApiProperty({
    description: 'ID của hồ sơ người dùng',
    example: 'profile-id-1',
  })
  userId: string;

  @ApiProperty({ description: 'ID của nhóm', example: 'group-id-1' })
  groupId: string;

  @ApiProperty({
    description: 'Vai trò trong nhóm',
    example: 'OWNER',
    enum: ['OWNER', 'MEMBER'],
  })
  role: string;

  @ApiProperty({ description: 'Thông tin người dùng' })
  user: ParticipantUserDto;
}

class MessageDto {
  @ApiProperty({ description: 'ID của tin nhắn', example: 'message-id-1' })
  id: string;

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Xin chào mọi người!',
  })
  content: string;

  @ApiProperty({
    description: 'Thời gian tạo tin nhắn',
    example: '2023-10-25T10:30:00Z',
  })
  createdAt: Date;
}

export class GroupResponseDto {
  @ApiProperty({ description: 'ID của nhóm', example: 'group-id-1' })
  id: string;

  @ApiProperty({ description: 'Tên nhóm', example: 'Nhóm học tập' })
  name: string;

  @ApiProperty({ description: 'ID của chủ nhóm', example: 'profile-id-1' })
  ownerId: string;

  @ApiProperty({
    description: 'Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp',
    example: true,
  })
  isGroup: boolean;

  @ApiProperty({
    description: 'Thời gian tạo nhóm',
    example: '2023-10-20T08:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật nhóm',
    example: '2023-10-25T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Danh sách thành viên trong nhóm',
    type: [ParticipantDto],
  })
  participants: ParticipantDto[];

  @ApiProperty({
    description: 'Tin nhắn gần nhất trong nhóm',
    type: [MessageDto],
  })
  messages: MessageDto[];
}

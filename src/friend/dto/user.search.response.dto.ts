import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum RelationStatus {
  NONE = 'NONE',
  FRIEND = 'FRIEND',
  PENDING_SENT = 'PENDING_SENT',
  PENDING_RECEIVED = 'PENDING_RECEIVED',
  REJECTED = 'REJECTED',
}

export class UserSearchResponseDTO{
  @ApiProperty({
    description: 'ID của người dùng',
    example: 'profile-id',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
    example: 'user123',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Tên hiển thị của người dùng',
    example: 'Nguyễn Văn A',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({
    description: 'URL hình đại diện của người dùng',
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  avatar?: string | null;

  @ApiProperty({
    description: 'Trạng thái mối quan hệ với người dùng hiện tại',
    enum: RelationStatus,
    example: RelationStatus.NONE,
    required: false,
  })
  @IsString()
  @IsOptional()
  relation?: RelationStatus;
}

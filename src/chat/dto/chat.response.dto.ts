import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'ID của tin nhắn',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  messageId: string;

  @ApiProperty({
    description: 'ID của nhóm chat',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  groupId: string;

  @ApiProperty({
    description: 'ID của người gửi',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  senderId: string;
}

export class StickerResponseDto {
  @ApiProperty({
    description: 'URL của sticker đã tải lên',
    example:
      'https://storage.example.com/stickers/123e4567-e89b-12d3-a456-426614174000.png',
  })
  stickerUrl: string;
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Trạng thái của request',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Mã trạng thái HTTP',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Dữ liệu trả về từ API',
  })
  data?: T;

  @ApiProperty({
    description: 'Thông báo lỗi (nếu có)',
    example: 'Tin nhắn không tồn tại',
    required: false,
  })
  message?: string;
}

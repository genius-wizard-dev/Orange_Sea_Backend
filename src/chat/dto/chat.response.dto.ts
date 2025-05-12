import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export class MessageResponseDto {
  @ApiProperty({
    description: 'ID của tin nhắn',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    description: 'ID của nhóm chat',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({
    description: 'ID của người gửi',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  senderId: string;
}

export class StickerResponseDto {
  @ApiProperty({
    description: 'URL của sticker đã tải lên',
    example: faker.image.url(),
  })
  @IsUrl()
  @IsNotEmpty()
  stickerUrl: string;
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Trạng thái của request',
    example: 'success',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Mã trạng thái HTTP',
    example: 200,
  })
  @IsNumber()
  @IsNotEmpty()
  statusCode: number;

  @ApiProperty({
    description: 'Dữ liệu trả về từ API',
  })
  @IsOptional()
  data?: T;

  @ApiProperty({
    description: 'Thông báo lỗi (nếu có)',
    example: 'Tin nhắn không tồn tại',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}

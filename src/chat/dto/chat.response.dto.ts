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

export class SenderDTO {
  @ApiProperty({
    description: 'ID của người gửi',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Tên của người gửi',
    example: faker.person.fullName(),
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Avatar của người gửi',
    example: faker.image.avatar(),
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class MessageDetailResponseDTO {
  @ApiProperty({
    description: 'ID của tin nhắn',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: faker.lorem.sentence(),
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'URL của file đính kèm',
    example: faker.image.url(),
    required: false,
  })
  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({
    description: 'Loại tin nhắn',
    example: 'TEXT',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Tên file đính kèm',
    example: 'image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({
    description: 'Kích thước file (byte)',
    example: 1024,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    description: 'Trạng thái đã thu hồi',
    example: false,
  })
  @IsNotEmpty()
  isRecalled: boolean;

  @ApiProperty({
    description: 'Thông tin người gửi',
  })
  @IsNotEmpty()
  sender: SenderDTO;

  @ApiProperty({
    description: 'ID của nhóm chat',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: new Date(),
  })
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: new Date(),
  })
  @IsNotEmpty()
  updatedAt: Date;

  @ApiProperty({
    description: 'ID của người đã đọc tin nhắn',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsOptional()
  readBy?: string[];
}

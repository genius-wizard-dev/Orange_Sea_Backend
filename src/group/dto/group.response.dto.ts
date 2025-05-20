import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class ParticipantDTO {
  @ApiProperty({
    description: 'ID của thành viên trong nhóm',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ID của hồ sơ người dùng',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty({
    description: 'Vai trò trong nhóm',
    example: 'OWNER',
    enum: ['OWNER', 'MEMBER'],
  })
  @IsEnum(['OWNER', 'MEMBER'])
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Tên người dùng',
    example: faker.person.fullName(),
    nullable: true,
  })
  @IsString()
  @IsOptional()
  name: string | null;

  @ApiProperty({
    description: 'Ảnh đại diện',
    example: faker.image.avatar(),
    nullable: true,
  })
  @IsString()
  @IsOptional()
  avatar: string | null;
}

class MessageDTO {
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
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID của người gửi',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    description: 'URL của tệp đính kèm',
    example: faker.image.url(),
    nullable: true,
  })
  @IsString()
  @IsOptional()
  fileUrl: string | null;

  @ApiProperty({
    description: 'Thời gian tạo tin nhắn',
    example: faker.date.recent(),
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật tin nhắn',
    example: faker.date.recent(),
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Trạng thái thu hồi tin nhắn',
    example: false,
  })
  @IsBoolean()
  isRecalled: boolean;

  @ApiProperty({
    description: 'Loại tin nhắn',
    example: 'TEXT',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Tên tệp đính kèm',
    example: 'document.pdf',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  fileName: string | null;
}

export class GroupResponseDTO {
  @ApiProperty({
    description: 'ID của nhóm',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Tên nhóm',
    example: faker.word.words(3),
    nullable: true,
  })
  @IsString()
  @IsOptional()
  name: string | null;

  @ApiProperty({
    description: 'ID của chủ nhóm',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({
    description: 'Xác định đây có phải là nhóm hay cuộc trò chuyện trực tiếp',
    example: true,
  })
  @IsBoolean()
  isGroup: boolean;

  @ApiProperty({
    description: 'Thời gian tạo nhóm',
    example: faker.date.past(),
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật nhóm',
    example: faker.date.recent(),
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Danh sách thành viên trong nhóm',
    type: [ParticipantDTO],
  })
  @IsArray()
  participants: ParticipantDTO[];

  @ApiProperty({
    description: 'Tin nhắn gần nhất trong nhóm',
    type: MessageDTO,
  })
  lastMessage: Message | null;

  @ApiProperty({
    description: 'Ảnh đại diện của nhóm',
    example: faker.image.url(),
  })
  @IsString()
  @IsOptional()
  avatar: string | null;
}

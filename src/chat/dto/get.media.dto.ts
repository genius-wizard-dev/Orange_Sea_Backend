import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum MediaMessageType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  RAW = 'RAW',
}

export class GetMediaDto {
  @ApiProperty({
    description: 'Loại media muốn lấy',
    enum: MediaMessageType,
    default: MediaMessageType.IMAGE,
  })
  @IsEnum(MediaMessageType)
  @IsOptional()
  type?: MediaMessageType = MediaMessageType.IMAGE;

  @ApiProperty({
    description: 'Số lượng media muốn lấy trong một trang',
    type: Number,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiProperty({
    description: 'ID của tin nhắn dùng làm cursor để phân trang',
    required: false,
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  cursor?: string;
}

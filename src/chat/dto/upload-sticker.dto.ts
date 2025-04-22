import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadStickerDto {
  @ApiProperty({
    description: 'File sticker cần tải lên',
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  file: Express.Multer.File;
}

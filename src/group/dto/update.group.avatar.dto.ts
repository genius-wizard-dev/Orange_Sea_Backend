import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupAvatarDto {
  @ApiProperty({
    description: 'Ảnh đại diện của nhóm (file)',
    type: 'string',
    format: 'binary',
    required: true,
  })
  avatar: Express.Multer.File;
}

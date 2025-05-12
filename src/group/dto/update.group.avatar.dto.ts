import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupAvatarDTO {
  @ApiProperty({
    description: 'Ảnh đại diện của nhóm (file)',
    type: 'string',
    format: 'binary',
    required: true,
  })
  file: Express.Multer.File;
}

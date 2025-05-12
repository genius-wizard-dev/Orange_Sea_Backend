import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangeOwnerDTO {
  @ApiProperty({
    description: 'ID của thành viên sẽ trở thành chủ nhóm mới',
    example: faker.database.mongodbObjectId(),
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID của chủ nhóm mới không được để trống' })
  newOwnerId: string;
}

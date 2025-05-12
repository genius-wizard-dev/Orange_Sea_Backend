import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ParticipantIdsDTO {
  @ApiProperty({
    description: 'Danh sách ID của các thành viên cần thêm vào nhóm',
    example: [
      faker.database.mongodbObjectId(),
      faker.database.mongodbObjectId(),
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayMinSize(1, {
    message: 'Phải có ít nhất một thành viên để thêm vào nhóm',
  })
  participantIds: string[];
}

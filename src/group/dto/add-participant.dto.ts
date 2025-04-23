import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddParticipantDto {
  @ApiProperty({
    description: 'ID của thành viên cần thêm vào nhóm',
    example: 'profile-id-1',
  })
  @IsString()
  @IsNotEmpty()
  participantIds: string[];
}

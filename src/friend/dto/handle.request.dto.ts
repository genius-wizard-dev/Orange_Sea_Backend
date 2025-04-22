import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FriendRequestAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export class HandleFriendRequestDto {
  @ApiProperty({
    description: 'Hành động xử lý yêu cầu kết bạn',
    enum: FriendRequestAction,
    example: FriendRequestAction.ACCEPT,
  })
  @IsEnum(FriendRequestAction, {
    message: 'Hành động phải là ACCEPT hoặc REJECT',
  })
  @IsNotEmpty({ message: 'Hành động không được để trống' })
  action: FriendRequestAction;
}

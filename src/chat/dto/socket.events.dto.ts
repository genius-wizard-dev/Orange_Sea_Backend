import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsUUID()
  @IsNotEmpty()
  profileId: string;
}

export class JoinRoomDto {
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;
}

export class RecallMessageDto {
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;
}

export class EditMessageSocketDto {
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  newContent: string;
}

export class GetActiveUsersDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

export class MarkAsReadDto {
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

export class GetUnreadCountsDto {
  @IsUUID()
  @IsNotEmpty()
  profileId: string;
}

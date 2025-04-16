import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class FriendRespone {
  @IsString()
  id: string;
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsString()
  @IsOptional()
  avatar?: string | null;

  @IsString()
  @IsOptional()
  bio?: string | null;

  @IsString()
  @IsOptional()
  phone?: string | null;

  @IsEmail()
  @IsOptional()
  email?: string | null;

  @IsDate()
  @IsOptional()
  birthday?: Date | null;
}

import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AccountResponseDTO {
  @ApiProperty({
    description: 'ID tài khoản',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    example: faker.internet.email(),
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
    example: faker.internet.username(),
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

// export class ProfileResponseDTO {
//   @ApiProperty({
//     description: 'ID hồ sơ',
//     example: faker.database.mongodbObjectId(),
//   })
//   id: string;

//   @ApiProperty({
//     description: 'ID tài khoản mà hồ sơ này thuộc về',
//     example: faker.database.mongodbObjectId(),
//   })
//   accountId: string;

//   @ApiProperty({
//     description: 'Họ tên đầy đủ',
//     required: false,
//     nullable: true,
//     example: faker.person.fullName(),
//   })
//   name: string | null;

//   @ApiProperty({
//     description: 'URL ảnh đại diện',
//     required: false,
//     nullable: true,
//     example: faker.image.url(),
//   })
//   avatar: string | null;

//   @ApiProperty({
//     description: 'Tiểu sử',
//     required: false,
//     nullable: true,
//     example: faker.lorem.sentence(),
//   })
//   bio: string | null;

//   @ApiProperty({
//     description: 'Số điện thoại',
//     required: false,
//     nullable: true,
//     example: faker.phone.number(),
//   })
//   phone: string | null;

//   @ApiProperty({
//     description: 'Ngày sinh',
//     required: false,
//     nullable: true,
//     example: faker.date.birthdate(),
//   })
//   birthday: Date | null;
// }

// export class AccountWithProfileResponseDTO {
//   @ApiProperty({
//     description: 'ID tài khoản',
//     example: faker.database.mongodbObjectId(),
//   })
//   id: string;

//   @ApiProperty({
//     description: 'Địa chỉ email',
//     example: faker.internet.email(),
//   })
//   email: string;

//   @ApiProperty({
//     description: 'Tên đăng nhập',
//     example: faker.internet.username(),
//   })
//   username: string;

//   @ApiProperty({
//     description: 'Thông tin hồ sơ',
//     required: false,
//     nullable: true,
//     example: faker.person.fullName(),
//   })
//   profile: ProfileResponseDTO | null;
// }

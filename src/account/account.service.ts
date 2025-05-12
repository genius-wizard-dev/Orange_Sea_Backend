import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { AccountResponseDTO } from './dto/account.response.dto';
import { UpdatePasswordDTO } from './dto/update.account.dto';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async changePassword(
    accountId: string,
    updatePassword: UpdatePasswordDTO,
  ): Promise<AccountResponseDTO> {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException(
          `Không tìm thấy tài khoản với ID: ${accountId}`,
        );
      }

      const isPasswordValid = await bcrypt.compare(
        updatePassword.currentPassword,
        account.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
      }

      const updateData: any = {};

      if (updatePassword.newPassword) {
        const hashedPassword = await bcrypt.hash(
          updatePassword.newPassword,
          10,
        );
        updateData.password = hashedPassword;
      }

      const updatedAccount = await this.prisma.account.update({
        where: { id: accountId },
        data: updateData,
      });

      await this.redisService.del(`user:${accountId}`);

      return this.mapToAccountDTO(updatedAccount);
    } catch (error) {
      this.logger.error(`Failed to update password: ${error.message}`);
      throw new UnauthorizedException('Cập nhật mật khẩu thất bại');
    }
  }

  private mapToAccountDTO(account: Account): AccountResponseDTO {
    const accountDTO: AccountResponseDTO = {
      id: account.id,
      email: account.email,
      username: account.username,
    };
    return accountDTO;
  }

  // async findAccountById(id: string): Promise<AccountWithProfileResponseDTO> {
  //   const account = await this.prisma.account.findUnique({
  //     where: { id },
  //     include: { profile: true },
  //   });
  //   if (!account) {
  //     throw new NotFoundException(`Không tìm thấy tài khoản với ID: ${id}`);
  //   }
  //   return this.mapToAccountWithProfileDTO(account);
  // }

  // async findAccountByUsername(
  //   username: string,
  // ): Promise<AccountWithProfileResponseDTO> {
  //   const account = await this.prisma.account.findUnique({
  //     where: { username },
  //     include: { profile: true },
  //   });

  //   if (!account) {
  //     throw new NotFoundException(
  //       `Không tìm thấy tài khoản với username: ${username}`,
  //     );
  //   }

  //   return this.mapToAccountWithProfileDTO(account);
  // }

  // private mapToAccountWithProfileDTO(
  //   account: any,
  // ): AccountWithProfileResponseDTO {
  //   const accountWithProfileDTO: AccountWithProfileResponseDTO = {
  //     id: account.id,
  //     email: account.email,
  //     username: account.username,
  //     profile: account.profile
  //       ? {
  //           id: account.profile.id,
  //           accountId: account.profile.accountId,
  //           name: account.profile.name,
  //           avatar: account.profile.avatar,
  //           bio: account.profile.bio,
  //           phone: account.profile.phone,
  //           birthday: account.profile.birthday,
  //         }
  //       : null,
  //   };
  //   return accountWithProfileDTO;
  // }
}

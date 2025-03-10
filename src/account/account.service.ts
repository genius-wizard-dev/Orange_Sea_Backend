import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AccountResponseDto,
  AccountWithProfileResponseDto,
} from './dto/account.response.dto';
import { UpdatePasswordDTO } from './dto/update.account.dto';

@Injectable()
export class AccountService {
  // private readonly logger = new Logger(AccountService.name);

  constructor(private prisma: PrismaService) {}

  async findAccountById(id: string): Promise<AccountWithProfileResponseDto> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!account) {
      throw new NotFoundException(`Không tìm thấy tài khoản với ID: ${id}`);
    }
    return this.mapToAccountWithProfileDTO(account);
  }

  async findAccountByUsername(
    username: string,
  ): Promise<AccountWithProfileResponseDto> {
    const account = await this.prisma.account.findUnique({
      where: { username },
      include: { profile: true },
    });

    if (!account) {
      throw new NotFoundException(
        `Không tìm thấy tài khoản với username: ${username}`,
      );
    }

    return this.mapToAccountWithProfileDTO(account);
  }

  async updateAccount(
    id: string,
    updatePassword: UpdatePasswordDTO,
  ): Promise<AccountResponseDto> {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Không tìm thấy tài khoản với ID: ${id}`);
    }

    const isPasswordValid = await bcrypt.compare(
      updatePassword.currentPassword,
      account.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    // Cập nhật thông tin tài khoản
    const updateData: any = {};

    // Cập nhật mật khẩu nếu được cung cấp
    if (updatePassword.newPassword) {
      const hashedPassword = await bcrypt.hash(updatePassword.newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Thực hiện cập nhật
    const updatedAccount = await this.prisma.account.update({
      where: { id },
      data: updateData,
    });

    return this.mapToAccountDto(updatedAccount);
  }

  // async deleteAccount(id: string): Promise<void> {
  //   // Kiểm tra xem tài khoản có tồn tại không
  //   const account = await this.prisma.account.findUnique({
  //     where: { id },
  //   });

  //   if (!account) {
  //     throw new NotFoundException(`Không tìm thấy tài khoản với ID: ${id}`);
  //   }

  //   // Xóa tài khoản (cascade sẽ xóa profile và các dữ liệu liên quan)
  //   await this.prisma.account.delete({
  //     where: { id },
  //   });
  // }

  // Helper methods
  private mapToAccountDto(account: Account): AccountResponseDto {
    const accountDto: AccountResponseDto = {
      id: account.id,
      email: account.email,
      username: account.username,
      role: account.role,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
    return accountDto;
  }

  private mapToAccountWithProfileDTO(
    account: any,
  ): AccountWithProfileResponseDto {
    const accountWithProfileDto: AccountWithProfileResponseDto = {
      id: account.id,
      email: account.email,
      username: account.username,
      role: account.role,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      profile: account.profile
        ? {
            id: account.profile.id,
            accountId: account.profile.accountId,
            name: account.profile.name,
            avatar: account.profile.avatar,
            bio: account.profile.bio,
            phone: account.profile.phone,
            birthday: account.profile.birthday,
            createdAt: account.profile.createdAt,
            updatedAt: account.profile.updatedAt,
          }
        : null,
    };
    return accountWithProfileDto;
  }
}

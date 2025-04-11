import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UpdateProfileDTO } from './dto/update.profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly prismaService: PrismaService) {}

  // async getProfileByAccountId(accountId: string) {
  //   const profile = await this.prismaService.profile.findFirst({
  //     where: { accountId },
  //   });

  //   if (!profile) {
  //     throw new NotFoundException('Không tìm thấy profile');
  //   }

  //   return {
  //     id: profile.id,
  //     name: profile.name || '',
  //     avatar: profile.avatar || '',
  //     bio: profile.bio || '',
  //     phone: profile.phone || '',
  //     birthday: profile.birthday || null,
  //     isSetup: profile.isSetup || false,
  //   };
  // }

  async getProfileById(id: string) {
    const profile = await this.prismaService.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy profile');
    }

    return {
      id: profile.id,
      name: profile.name || '',
      avatar: profile.avatar || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      birthday: profile.birthday || null,
    };
  }

  async updateProfile(accountId: string, updateProfileDTO: UpdateProfileDTO) {
    // Tìm profile theo accountId
    const existingProfile = await this.prismaService.profile.findFirst({
      where: { accountId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Không tìm thấy profile');
    }

    if (updateProfileDTO.phone) {
      const existingPhone = await this.prismaService.profile.findFirst({
        where: {
          phone: updateProfileDTO.phone,
          NOT: {
            id: existingProfile.id, // loại trừ profile hiện tại
          },
        },
      });

      if (existingPhone) {
        throw new BadRequestException('Số điện thoại đã được sử dụng');
      }
    }

    try {
      // Cập nhật profile
      const updatedProfile = await this.prismaService.profile.update({
        where: { id: existingProfile.id },
        data: {
          name: updateProfileDTO.name,
          bio: updateProfileDTO.bio,
          phone: updateProfileDTO.phone,
          avatar: updateProfileDTO.avatar,
          birthday: updateProfileDTO.birthday
            ? new Date(updateProfileDTO.birthday)
            : undefined,
        },
      });

      return {
        id: updatedProfile.id,
        name: updatedProfile.name || '',
        avatar: updatedProfile.avatar || '',
        bio: updatedProfile.bio || '',
        phone: updatedProfile.phone || '',
        birthday: updatedProfile.birthday || null,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật profile: ${error.message}`);
      throw new Error('Không thể cập nhật profile');
    }
  }

  async findByUsername(username: string) {
    const account = await this.prismaService.account.findUnique({
      where: { username },
      include: { profile: true },
    });

    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    return {
      id: account.id,
      username: account.username,
      role: account.role,
      profile: {
        id: account.profile?.id || '',
        name: account.profile?.name || '',
        avatar: account.profile?.avatar || '',
        bio: account.profile?.bio || '',
        phone: account.profile?.phone || '',
        birthday: account.profile?.birthday || null,
      },
    };
  }
}

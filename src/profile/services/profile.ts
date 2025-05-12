import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Gender, Role } from '@prisma/client';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { GetProfileDTO, GetProfileIdResponseDTO } from '../dto/get.profile.dto';
import { UpdateProfileDTO } from '../dto/update.profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getProfileById(id: string): Promise<GetProfileDTO> {
    try {
      const profile = await this.prismaService.profile.findUnique({
        where: { id },
        include: { account: true },
      });
      if (!profile) {
        throw new NotFoundException('Không tìm thấy profile');
      }
      if (!profile.account) {
        throw new NotFoundException('Không tìm thấy account');
      }
      return {
        id: profile.id,
        name: profile.name || '',
        avatar: profile.avatar || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        role: profile.account.role || Role.USER,
        gender: profile.gender || Gender.M,
        birthday: profile.birthday || null,
        email: profile.account.email || '',
        username: profile.account.username || '',
        accountID: profile.accountId || '',
        isSetup: profile.isSetup || false,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy profile: ${error.message}`);
      throw new Error(`Không thể lấy thông tin profile`);
    }
  }

  async getProfileFromAccountId(accountId: string) {
    try {
      const profile = await this.prismaService.profile.findUnique({
        where: { accountId: accountId },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      return profile;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy profile từ accountId: ${error.message}`);
      throw error;
    }
  }

  async updateProfile(
    profileId: string,
    updateProfileDTO: UpdateProfileDTO,
    file?: Express.Multer.File,
  ): Promise<GetProfileIdResponseDTO> {
    try {
      if (updateProfileDTO.birthday) {
        const birthDate = new Date(updateProfileDTO.birthday);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        if (age < 11) {
          throw new BadRequestException('Người dùng phải đủ 11 tuổi trở lên');
        }
      }

      const existingProfile = await this.prismaService.profile.findFirst({
        where: { id: profileId },
      });

      if (!existingProfile) {
        throw new NotFoundException('Không tìm thấy profile');
      }

      if (updateProfileDTO.phone) {
        const existingPhone = await this.prismaService.profile.findFirst({
          where: {
            phone: updateProfileDTO.phone,
            NOT: {
              id: existingProfile.id,
            },
          },
        });

        if (existingPhone) {
          throw new BadRequestException('Số điện thoại đã được sử dụng');
        }
      }
      let avatarUrl = updateProfileDTO.avatar;

      if (file) {
        const filename = `profile_${existingProfile.id}`;
        const uploadResult =
          await this.cloudinaryService.uploadBufferToCloudinary(
            file.buffer,
            filename,
            'profile-avatars',
          );

        avatarUrl = uploadResult.url;
      }

      const updatedProfile = await this.prismaService.profile.update({
        where: { id: existingProfile.id },
        data: {
          name: updateProfileDTO.name,
          bio: updateProfileDTO.bio,
          phone: updateProfileDTO.phone,
          gender: updateProfileDTO.gender,
          avatar: avatarUrl,
          birthday: updateProfileDTO.birthday
            ? new Date(updateProfileDTO.birthday)
            : undefined,

          isSetup: true,
        },
      });

      if (!updatedProfile) {
        throw new NotFoundException('Không tìm thấy profile');
      }

      return {
        profileId: updatedProfile.id,
      };
    } catch (error) {
      this.logger.error(error.stack);
      throw new Error(error.message);
    }
  }

  async findByUsername(username: string): Promise<GetProfileDTO> {
    try {
      const account = await this.prismaService.account.findUnique({
        where: { username },
        include: { profile: true },
      });

      if (!account) {
        throw new NotFoundException('Không tìm thấy tài khoản');
      }
      if (!account.profile) {
        throw new NotFoundException('Không tìm thấy profile');
      }
      return {
        id: account.profile.id,
        name: account.profile.name || '',
        avatar: account.profile.avatar || '',
        bio: account.profile.bio || '',
        phone: account.profile.phone || '',
        gender: account.profile.gender || Gender.M,
        birthday: account.profile.birthday || null,
        email: account.email || '',
        role: account.role || Role.USER,
        username: account.username || '',
        accountID: account.id || '',
        isSetup: account.profile.isSetup || false,
      };
    } catch (error) {
      this.logger.error(error.stack);
      throw new Error(error.message);
    }
  }
}

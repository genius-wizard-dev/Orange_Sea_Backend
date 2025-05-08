import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Gender } from '@prisma/client';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UpdateProfileDTO } from './dto/update.profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getProfileById(id: string) {
    this.logger.debug(`Getting profile by ID: ${id}`);

    const profile = await this.prismaService.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      this.logger.warn(`Profile not found with ID: ${id}`);
      throw new NotFoundException('Không tìm thấy profile');
    }

    this.logger.debug(`Profile found: ${JSON.stringify(profile)}`);
    const account = await this.prismaService.account.findUnique({
      where: { id: profile.accountId },
    });
    if (!account) {
      this.logger.warn(`Account not found with ID: ${id}`);
      throw new NotFoundException('Không tìm thấy account');
    }
    return {
      id: profile.id,
      name: profile.name || '',
      avatar: profile.avatar || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      gender: profile.gender || Gender.M,
      birthday: profile.birthday || null,
      email: account.email || '',
      username: account.username || '',
      accountID: profile.accountId || '',
      isSetup: profile.isSetup || false,
    };
  }

  async getProfileFromAccountId(accountId: string) {
    const profile = await this.prismaService.profile.findUnique({
      where: { accountId: accountId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(
    accountId: string,
    updateProfileDTO: UpdateProfileDTO,
    file?: Express.Multer.File,
  ) {
    this.logger.debug(`Updating profile for account ID: ${accountId}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateProfileDTO)}`);
    this.logger.debug(`File included: ${file ? 'Yes' : 'No'}`);
    if (file) {
      this.logger.debug(
        `File details: name=${file.originalname}, size=${file.size}, mimetype=${file.mimetype}`,
      );
    }

    // Tìm profile theo accountId
    const existingProfile = await this.prismaService.profile.findFirst({
      where: { accountId },
    });

    if (!existingProfile) {
      this.logger.warn(`No profile found for account ID: ${accountId}`);
      throw new NotFoundException('Không tìm thấy profile');
    }

    this.logger.debug(
      `Found existing profile: ${JSON.stringify(existingProfile)}`,
    );

    if (updateProfileDTO.phone) {
      this.logger.debug(
        `Checking if phone number ${updateProfileDTO.phone} is already in use`,
      );
      const existingPhone = await this.prismaService.profile.findFirst({
        where: {
          phone: updateProfileDTO.phone,
          NOT: {
            id: existingProfile.id, // loại trừ profile hiện tại
          },
        },
      });

      if (existingPhone) {
        this.logger.warn(
          `Phone number ${updateProfileDTO.phone} already in use by profile ID: ${existingPhone.id}`,
        );
        throw new BadRequestException('Số điện thoại đã được sử dụng');
      }
    }

    try {
      let avatarUrl = updateProfileDTO.avatar;

      // Upload ảnh mới nếu có file được gửi lên
      if (file) {
        // Tạo filename dựa trên profileId để khi update sẽ ghi đè ảnh cũ
        const filename = `profile_${existingProfile.id}`;
        this.logger.debug(`Uploading new avatar with filename: ${filename}`);

        // Upload ảnh lên Cloudinary với tên cố định
        const uploadResult =
          await this.cloudinaryService.uploadBufferToCloudinary(
            file.buffer,
            filename,
            'profile-avatars',
          );

        // Extract the URL from the result
        avatarUrl = uploadResult.url;

        this.logger.debug(`Avatar uploaded successfully, URL: ${avatarUrl}`);
        this.logger.debug(
          `File size: ${uploadResult.fileSize} bytes, Original name: ${uploadResult.originalName}`,
        );
      }

      // Cập nhật profile
      this.logger.debug(
        `Updating profile in database with ID: ${existingProfile.id}`,
      );
      const updatedProfile = await this.prismaService.profile.update({
        where: { id: existingProfile.id },
        data: {
          name: updateProfileDTO.name,
          bio: updateProfileDTO.bio,
          phone: updateProfileDTO.phone,
          gender: updateProfileDTO.gender,
          avatar: avatarUrl, // Sử dụng URL mới nếu đã upload ảnh
          birthday: updateProfileDTO.birthday
            ? new Date(updateProfileDTO.birthday)
            : undefined,

          isSetup: true,
        },
      });

      this.logger.debug(
        `Profile updated successfully: ${JSON.stringify(updatedProfile)}`,
      );
      return {
        id: updatedProfile.id,
        name: updatedProfile.name || '',
        avatar: updatedProfile.avatar || '',
        bio: updatedProfile.bio || '',
        gender: updateProfileDTO.gender,
        phone: updatedProfile.phone || '',
        birthday: updatedProfile.birthday || null,
      };
    } catch (error) {
      this.logger.error(`Error updating profile: ${error.message}`);
      this.logger.error(error.stack);
      throw new Error('Không thể cập nhật profile');
    }
  }

  async findByUsername(username: string) {
    this.logger.debug(`Finding user by username: ${username}`);

    const account = await this.prismaService.account.findUnique({
      where: { username },
      include: { profile: true },
    });

    if (!account) {
      this.logger.warn(`Account not found with username: ${username}`);
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    this.logger.debug(`Account found: ${JSON.stringify(account)}`);
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
        gender: account.profile?.gender || Gender.M,
        birthday: account.profile?.birthday || null,
      },
    };
  }
}

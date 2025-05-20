import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Group } from '@prisma/client';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProfileService } from 'src/profile/services/profile';
import { GroupResponseDTO } from '../dto';
import { GroupIdResponseDTO } from '../dto/create.group.dto';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly profileService: ProfileService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createGroup(
    profileId: string,
    participantIds: string[],
    name?: string,
  ): Promise<GroupIdResponseDTO> {
    try {
      const participants = await this.prismaService.profile.findMany({
        where: {
          id: { in: participantIds },
        },
      });

      if (participants.length !== participantIds.length) {
        throw new Error('Một hoặc nhiều thành viên không tồn tại');
      }

      const group = await this.prismaService.group.create({
        data: {
          name,
          isGroup: true,
          ownerId: profileId,
          participants: {
            create: [
              {
                userId: profileId,
                role: 'OWNER',
              },
              ...participantIds
                .filter((id) => id !== profileId)
                .map((userId) => ({
                  userId,
                  role: 'MEMBER' as const,
                })),
            ],
          },
        },
      });
      return {
        groupId: group.id,
      };
    } catch (error) {
      this.logger.error(`Error creating group: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addParticipant(
    groupId: string,
    profileId: string,
    newParticipantIds: string[],
  ): Promise<GroupIdResponseDTO> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
        },
      });

      if (!group) {
        throw new Error('Không tìm thấy nhóm');
      }

      // Kiểm tra quyền của người thực hiện yêu cầu

      if (group.ownerId !== profileId) {
        throw new Error('Chỉ chủ sở hữu mới có thể thêm thành viên');
      }

      const existingParticipantIds = group.participants.map((p) => p.userId);

      const uniqueNewParticipantIds = newParticipantIds.filter(
        (id) => !existingParticipantIds.includes(id),
      );

      if (uniqueNewParticipantIds.length === 0) {
        throw new Error('Tất cả người dùng đã là thành viên trong nhóm');
      }

      // Kiểm tra sự tồn tại của các profile mới
      const existingProfiles = await this.prismaService.profile.findMany({
        where: {
          id: {
            in: uniqueNewParticipantIds,
          },
        },
      });

      if (existingProfiles.length !== uniqueNewParticipantIds.length) {
        throw new Error('Một hoặc nhiều thành viên không tồn tại');
      }

      const result = await this.prismaService.group.update({
        where: { id: groupId },
        data: {
          participants: {
            create: uniqueNewParticipantIds.map((participantId) => ({
              userId: participantId,
              role: 'MEMBER',
            })),
          },
        },
      });

      if (!result) {
        throw new Error('Thêm thành viên thất bại');
      }

      return {
        groupId: result.id,
      };
    } catch (error) {
      this.logger.error(
        `Error adding participants: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async removeParticipants(
    groupId: string,
    profileId: string,
    participantIds: string[],
  ): Promise<GroupIdResponseDTO> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      if (group.ownerId !== profileId) {
        throw new Error('Chỉ chủ sở hữu mới có thể xóa thành viên');
      }

      if (participantIds.includes(group.ownerId)) {
        throw new Error('Không thể xóa chủ sở hữu nhóm');
      }

      if (participantIds.includes(profileId)) {
        throw new Error('Không thể xóa chính mình khỏi nhóm');
      }

      const existingMembers: string[] = [];
      const nonMembers: string[] = [];

      for (const participantId of participantIds) {
        const isMember = await this.isGroupMember(participantId, groupId);
        if (isMember) {
          existingMembers.push(participantId);
        } else {
          nonMembers.push(participantId);
        }
      }

      if (existingMembers.length === 0) {
        throw new Error('Không có thành viên nào trong nhóm');
      }

      const remainingParticipantCount =
        group.participants.length - existingMembers.length;
      if (remainingParticipantCount < 2) {
        throw new Error(
          'Không thể xóa thành viên cuối cùng. Nếu bạn muốn kết thúc cuộc trò chuyện, vui lòng xóa nhóm thay thế.',
        );
      }

      const participantsToRemove = group.participants.filter((p) =>
        existingMembers.includes(p.userId),
      );
      const result = await this.prismaService.participant.deleteMany({
        where: {
          id: {
            in: participantsToRemove.map((p) => p.id),
          },
        },
      });
      if (!result) {
        throw new Error('Không thể xóa thành viên');
      }
      return {
        groupId: groupId,
      };
    } catch (error) {
      this.logger.error(
        `Error removing participants: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteGroup(
    groupId: string,
    profileId: string,
  ): Promise<GroupIdResponseDTO> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      if (group.ownerId !== profileId) {
        throw new Error('Chỉ chủ sở hữu mới có thể xóa nhóm');
      }

      const result = await this.prismaService.group.delete({
        where: { id: groupId },
      });

      if (!result) {
        throw new Error('Không thể xóa nhóm');
      }

      return {
        groupId: groupId,
      };
    } catch (error) {
      this.logger.error(`Error deleting group: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getGroup(profileId: string): Promise<GroupResponseDTO[]> {
    try {
      const groups = await this.prismaService.group.findMany({
        where: {
          participants: {
            some: {
              userId: profileId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      const groupsWithLastMessage = await Promise.all(
        groups.map(async (group) => {
          // Find the last message that hasn't been deleted by this user
          const lastMessage = await this.prismaService.message.findFirst({
            where: {
              groupId: group.id,
              deletedBy: {
                none: {
                  userId: profileId,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          return {
            id: group.id,
            name: group.name,
            ownerId: group.ownerId,
            isGroup: group.isGroup,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            avatar: group.avatar,
            participants: group.participants.map((participant) => ({
              id: participant.id,
              profileId: participant.userId,
              role: participant.role,
              name: participant.user.name,
              avatar: participant.user.avatar,
            })),
            lastMessage: lastMessage,
          };
        }),
      );

      return groupsWithLastMessage;
    } catch (error) {
      this.logger.error(
        `Error getting groups by account ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async isGroupMember(profileId: string, groupId: string): Promise<boolean> {
    try {
      this.logger.debug(groupId);
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
        },
      });

      if (!group) {
        throw new Error(
          'Bạn không phải là thành viên của nhóm này hoặc nhóm không tồn tại',
        );
      }
      return group.participants.some((p) => p.userId === profileId);
    } catch (error) {
      this.logger.error(
        `Error checking group membership: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPaticipantsInGroup(groupId: string) {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }
      const participantIds = group.participants.map((p) => p.userId);
      return participantIds;
    } catch (error) {
      this.logger.error(
        `Error getting group by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async isGroupOwner(profileId: string, groupId: string): Promise<boolean> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      this.logger.debug(
        `Checking if profile ID ${profileId} is the owner of group ID ${group.ownerId}`,
      );
      return group.ownerId === profileId;
    } catch (error) {
      this.logger.error(
        `Error checking group ownership: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getGroupById(groupId: string): Promise<Group> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      return group;
    } catch (error) {
      this.logger.error(
        `Error getting group by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // async searchGroups(accountId: string, searchTerm: string) {
  //   try {
  //     const profile =
  //       await this.profileService.getProfileFromAccountId(accountId);
  //     const userId = profile.id;

  //     return this.prismaService.group.findMany({
  //       where: {
  //         participants: {
  //           some: {
  //             userId,
  //           },
  //         },
  //         name: {
  //           contains: searchTerm,
  //           mode: 'insensitive', // Case-insensitive search
  //         },
  //       },
  //       include: {
  //         participants: {
  //           include: {
  //             user: true,
  //           },
  //         },
  //         messages: {
  //           orderBy: {
  //             createdAt: 'desc',
  //           },
  //           take: 1,
  //         },
  //       },
  //       orderBy: {
  //         updatedAt: 'desc',
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error(
  //       `Error searching groups: ${error.message}`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }
  async getGroupInfo(
    groupId: string,
    profileId: string,
  ): Promise<GroupResponseDTO> {
    try {
      const profile = await this.profileService.getProfileById(profileId);
      const userId = profile.id;
      const isMember = await this.isGroupMember(userId, groupId);
      if (!isMember) {
        throw new Error('You are not a member of this group');
      }
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      return {
        id: group.id,
        name: group.name,
        ownerId: group.ownerId,
        isGroup: group.isGroup,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        avatar: group.avatar,
        participants: group.participants.map((participant) => ({
          id: participant.id,
          profileId: participant.userId,
          role: participant.role,
          name: participant.user.name,
          avatar: participant.user.avatar,
        })),
        lastMessage: group.messages[0],
      };
    } catch (error) {
      this.logger.error(
        `Error getting group info: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async leaveGroup(
    groupId: string,
    profileId: string,
  ): Promise<GroupIdResponseDTO> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      // Check if it's a group chat (not a direct message)
      if (!group.isGroup) {
        throw new Error('You cannot leave a direct message conversation');
      }

      // Find the participant
      const participant = group.participants.find(
        (p) => p.userId === profileId,
      );
      if (!participant) {
        throw new Error('You are not a member of this group');
      }

      if (group.ownerId === profileId) {
        throw new Error(
          'Group owner cannot leave. Transfer ownership first or delete the group',
        );
      }

      if (group.participants.length <= 2) {
        throw new Error(
          'Cannot leave as the group needs at least 2 members to exist',
        );
      }

      const result = await this.prismaService.participant.delete({
        where: { id: participant.id },
      });

      if (!result) {
        throw new Error('Failed to leave group');
      }

      return {
        groupId: groupId,
      };
    } catch (error) {
      this.logger.error(`Error leaving group: ${error.message}`, error.stack);
      throw error;
    }
  }
  async transferOwnership(
    groupId: string,
    profileId: string,
    newOwnerId: string,
  ): Promise<GroupIdResponseDTO> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.isGroup) {
        throw new Error('Ownership transfer is only available for group chats');
      }

      if (group.ownerId !== profileId) {
        throw new Error('Only the current owner can transfer ownership');
      }

      // Tìm người dùng mới và hiện tại trong nhóm
      const newOwnerParticipant = group.participants.find(
        (p) => p.userId === newOwnerId,
      );
      const currentOwnerParticipant = group.participants.find(
        (p) => p.userId === profileId,
      );

      if (!newOwnerParticipant) {
        throw new Error('The new owner must be a current member of the group');
      }

      if (!currentOwnerParticipant) {
        throw new Error('Current owner participant not found in the group');
      }

      // Thực hiện cập nhật trong một giao dịch để đảm bảo tính nhất quán
      await this.prismaService.$transaction([
        this.prismaService.participant.update({
          where: { id: currentOwnerParticipant.id },
          data: { role: 'MEMBER' },
        }),
        this.prismaService.participant.update({
          where: { id: newOwnerParticipant.id },
          data: { role: 'OWNER' },
        }),
        this.prismaService.group.update({
          where: { id: groupId },
          data: { ownerId: newOwnerId },
        }),
      ]);

      return { groupId };
    } catch (error) {
      this.logger.error(
        `Error transferring ownership: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async renameGroup(
    groupId: string,
    profileId: string,
    newName: string,
  ): Promise<GroupIdResponseDTO> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.isGroup) {
        throw new Error('Renaming is only available for group chats');
      }

      if (profileId !== group.ownerId) {
        throw new Error('Only the current owner can rename the group');
      }

      const updatedGroup = await this.prismaService.group.update({
        where: { id: groupId },
        data: { name: newName },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!updatedGroup) {
        throw new Error('Failed to rename group');
      }
      return {
        groupId: updatedGroup.id,
      };
    } catch (error) {
      this.logger.error(`Error renaming group: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateGroupAvatar(
    groupId: string,
    profileId: string,
    file: Express.Multer.File,
  ): Promise<GroupIdResponseDTO> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
        },
      });

      if (!group) {
        throw new NotFoundException('Không tìm thấy nhóm');
      }

      // Chỉ cho phép cập nhật avatar cho group, không cho phép đối với chat 2 người
      if (!group.isGroup) {
        throw new Error(
          'Chỉ có thể cập nhật avatar cho nhóm, không áp dụng cho đoạn chat 2 người',
        );
      }

      if (profileId !== group.ownerId) {
        throw new Error('Chỉ chủ sở hữu mới có thể cập nhật avatar của nhóm');
      }

      if (!file) {
        throw new Error('Không tìm thấy file ảnh');
      }

      const filename = `group_${groupId}`;
      this.logger.debug(`Đang tải lên avatar mới với tên file: ${filename}`);

      const uploadResult =
        await this.cloudinaryService.uploadBufferToCloudinary(
          file.buffer,
          filename,
          'group-avatars',
        );

      const avatarUrl = uploadResult.url;

      this.logger.debug(`Tải lên avatar thành công, URL: ${avatarUrl}`);

      const updatedGroup = await this.prismaService.$transaction(async (tx) => {
        return tx.group.update({
          where: { id: groupId },
          data: {
            avatar: avatarUrl,
          },
          include: {
            participants: {
              include: {
                user: true,
              },
            },
          },
        });
      });

      return {
        groupId: updatedGroup.id,
      };
    } catch (error) {
      this.logger.error(
        `Lỗi cập nhật avatar nhóm: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

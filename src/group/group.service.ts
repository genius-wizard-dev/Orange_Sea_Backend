import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(private readonly prismaService: PrismaService) {}

  // Helper method to get profile from account ID
  async getProfileFromAccountId(accountId: string) {
    const profile = await this.prismaService.profile.findUnique({
      where: { accountId: accountId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async createGroup(
    accountId: string,
    participantIds: string[],
    isGroup: boolean = false,
    name?: string,
  ) {
    try {
      const participants = await this.prismaService.profile.findMany({
        where: {
          id: { in: participantIds },
        },
      });

      if (participants.length !== participantIds.length) {
        throw new Error('One or more participants do not exist');
      }

      const profile = await this.getProfileFromAccountId(accountId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      const ownerId = profile.id;

      if (!isGroup && participantIds.length === 1) {
        const existingGroup = await this.prismaService.group.findFirst({
          where: {
            isGroup: false,
            AND: [
              { participants: { some: { userId: ownerId } } },
              { participants: { some: { userId: participantIds[0] } } },
            ],
          },
        });

        if (existingGroup) {
          return existingGroup;
        }
      }

      const group = await this.prismaService.group.create({
        data: {
          name,
          isGroup,
          ownerId,
          participants: {
            create: [
              {
                userId: ownerId,
                role: 'OWNER',
              },
              ...participantIds
                .filter((id) => id !== ownerId)
                .map((userId) => ({
                  userId,
                  role: 'MEMBER' as const,
                })),
            ],
          },
        },
        include: {
          participants: true,
        },
      });
      return group;
    } catch (error) {
      this.logger.error(`Error creating group: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addParticipant(
    groupId: string,
    accountId: string,
    newParticipantIds: string[],
  ) {
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

      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      const requester = group.participants.find((p) => p.userId === userId);
      if (!requester || requester.role !== 'OWNER') {
        throw new Error('Only the group owner can add participants');
      }

      // Check if participants exist
      const existingProfiles = await this.prismaService.profile.findMany({
        where: {
          id: {
            in: newParticipantIds,
          },
        },
      });

      if (existingProfiles.length !== newParticipantIds.length) {
        throw new Error('One or more participants do not exist');
      }

      // Filter out participants that are already in the group
      const existingParticipantIds = group.participants.map((p) => p.userId);
      const uniqueNewParticipantIds = newParticipantIds.filter(
        (id) => !existingParticipantIds.includes(id),
      );

      if (uniqueNewParticipantIds.length === 0) {
        throw new Error('All users are already participants in this group');
      }

      // Add the new participants
      return await this.prismaService.group.update({
        where: { id: groupId },
        data: {
          participants: {
            create: uniqueNewParticipantIds.map((participantId) => ({
              userId: participantId,
              role: 'MEMBER',
            })),
          },
        },
        include: {
          participants: true,
        },
      });
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
    accountId: string,
    participantIds: string[],
  ) {
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

      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      const requester = group.participants.find((p) => p.userId === userId);
      if (!requester || requester.role !== 'OWNER') {
        throw new Error('Only the group owner can remove participants');
      }

      // Cannot remove the owner
      if (participantIds.includes(group.ownerId)) {
        throw new Error('Cannot remove the group owner');
      }

      // Cannot remove yourself
      if (participantIds.includes(userId)) {
        throw new Error('Cannot remove yourself from the group');
      }

      // Find existing group members from the provided participantIds
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

      // If none of the users are members, return an appropriate message
      if (existingMembers.length === 0) {
        return {
          statusCode: 400,
          message: 'None of the specified users are members of this group',
          nonMembers,
        };
      }

      // Check if the group will have at least 2 members after removal
      const remainingParticipantCount =
        group.participants.length - existingMembers.length;
      if (remainingParticipantCount < 2) {
        return {
          statusCode: 400,
          message:
            'Cannot remove the last member. If you want to end the conversation, please delete the group instead.',
          suggestDeleteGroup: true,
        };
      }

      // Find the participants to remove
      const participantsToRemove = group.participants.filter((p) =>
        existingMembers.includes(p.userId),
      );

      // Remove the valid participants
      await this.prismaService.participant.deleteMany({
        where: {
          id: {
            in: participantsToRemove.map((p) => p.id),
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Participants removed successfully',
        removedCount: existingMembers.length,
        nonMembers:
          nonMembers.length > 0
            ? { count: nonMembers.length, ids: nonMembers }
            : null,
      };
    } catch (error) {
      this.logger.error(
        `Error removing participants: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteGroup(groupId: string, accountId: string) {
    try {
      // Check if the user is the owner of the group
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      if (group.ownerId !== userId) {
        throw new Error('Only the group owner can delete the group');
      }

      // Delete the group
      return this.prismaService.group.delete({
        where: { id: groupId },
      });
    } catch (error) {
      this.logger.error(`Error deleting group: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getGroupByAccountId(accountId: string) {
    try {
      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      return this.prismaService.group.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        include: {
          messages: {
            select: {
              id: true,
              content: true,
              senderId: true,
              fileUrl: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
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
    } catch (error) {
      this.logger.error(
        `Error getting groups by account ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getGroupsByProfileId(profileId: string) {
    try {
      const profile = await this.prismaService.profile.findUnique({
        where: { id: profileId },
      });
      if (!profile) {
        throw new Error('Profile not found');
      }
      const userId = profile.id;

      return this.prismaService.group.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
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
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Error getting groups: ${error.message}`, error.stack);
      throw error;
    }
  }
  async isGroupMember(profileId: string, groupId: string): Promise<boolean> {
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

      const profile = await this.prismaService.profile.findUnique({
        where: { id: profileId },
      });
      if (!profile) {
        throw new Error('Profile not found');
      }
      return group.participants.some((p) => p.userId === profile.id);
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

  async isGroupOwner(accountId: string, groupId: string): Promise<boolean> {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const profile = await this.getProfileFromAccountId(accountId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      this.logger.debug(
        `Checking if profile ID ${profile.id} is the owner of group ID ${group.ownerId}`,
      );
      return group.ownerId === profile.id;
    } catch (error) {
      this.logger.error(
        `Error checking group ownership: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async searchGroups(accountId: string, searchTerm: string) {
    try {
      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      return this.prismaService.group.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
          name: {
            contains: searchTerm,
            mode: 'insensitive', // Case-insensitive search
          },
        },
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
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(
        `Error searching groups: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async getGroupInfo(groupId: string, accountId: string) {
    try {
      const profile = await this.getProfileFromAccountId(accountId);
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
      return group;
    } catch (error) {
      this.logger.error(
        `Error getting group info: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async leaveGroup(groupId: string, accountId: string) {
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

      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      // Find the participant
      const participant = group.participants.find((p) => p.userId === userId);
      if (!participant) {
        throw new Error('You are not a member of this group');
      }

      // Check if user is the owner
      if (group.ownerId === userId) {
        throw new Error(
          'Group owner cannot leave. Transfer ownership first or delete the group',
        );
      }

      // Check if the group will have at least 2 members after leaving
      if (group.participants.length <= 2) {
        throw new Error(
          'Cannot leave as the group needs at least 2 members to exist',
        );
      }

      // Remove the participant
      await this.prismaService.participant.delete({
        where: { id: participant.id },
      });

      return {
        statusCode: 200,
        message: 'Successfully left the group',
      };
    } catch (error) {
      this.logger.error(`Error leaving group: ${error.message}`, error.stack);
      throw error;
    }
  }

  async transferOwnership(
    groupId: string,
    accountId: string,
    newOwnerId: string,
  ) {
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
        throw new Error('Ownership transfer is only available for group chats');
      }

      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      // Check if requester is the current owner
      if (group.ownerId !== userId) {
        throw new Error('Only the current owner can transfer ownership');
      }

      // Check if new owner is a member
      const newOwnerParticipant = group.participants.find(
        (p) => p.userId === newOwnerId,
      );
      if (!newOwnerParticipant) {
        throw new Error('The new owner must be a current member of the group');
      }

      // Update current owner to member
      const currentOwnerParticipant = group.participants.find(
        (p) => p.userId === userId,
      );

      if (!currentOwnerParticipant) {
        throw new Error('Current owner participant not found in the group');
      }

      await this.prismaService.participant.update({
        where: { id: currentOwnerParticipant.id },
        data: { role: 'MEMBER' },
      });

      // Update new owner role
      await this.prismaService.participant.update({
        where: { id: newOwnerParticipant.id },
        data: { role: 'OWNER' },
      });

      // Update group owner
      const updatedGroup = await this.prismaService.group.update({
        where: { id: groupId },
        data: { ownerId: newOwnerId },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Ownership transferred successfully',
        data: updatedGroup,
      };
    } catch (error) {
      this.logger.error(
        `Error transferring ownership: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async renameGroup(groupId: string, accountId: string, newName: string) {
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
        throw new Error('Renaming is only available for group chats');
      }

      const profile = await this.getProfileFromAccountId(accountId);
      const userId = profile.id;

      // Check if requester is the current owner
      const requester = group.participants.find((p) => p.userId === userId);
      if (!requester || requester.role !== 'OWNER') {
        throw new Error('Only the current owner can rename the group');
      }

      // Update group name
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

      return {
        statusCode: 200,
        message: 'Group renamed successfully',
        data: updatedGroup,
      };
    } catch (error) {
      this.logger.error(`Error renaming group: ${error.message}`, error.stack);
      throw error;
    }
  }
}

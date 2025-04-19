import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(private readonly prismaService: PrismaService) {}

  // Helper method to get profile from account ID
  private async getProfileFromAccountId(accountId: string) {
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
      const ownerId = profile.id;

      // If it's a direct message (not a group), check if a conversation already exists
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

      // Create the group
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
    newParticipantId: string,
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

      // Check if participant is already in the group
      const existingParticipant = group.participants.find(
        (p) => p.userId === newParticipantId,
      );
      if (existingParticipant) {
        throw new Error('User is already a participant in this group');
      }

      // Add the new participant
      return this.prismaService.participant.create({
        data: {
          userId: newParticipantId,
          groupId,
          role: 'MEMBER',
        },
      });
    } catch (error) {
      this.logger.error(
        `Error adding participant: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async removeParticipant(
    groupId: string,
    accountId: string,
    participantIdToRemove: string,
  ) {
    try {
      // Check if the user is the owner of the group
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
      if (participantIdToRemove === group.ownerId) {
        throw new Error('Cannot remove the group owner');
      }

      // Find the participant to remove
      const participantToRemove = group.participants.find(
        (p) => p.userId === participantIdToRemove,
      );
      if (!participantToRemove) {
        throw new Error('Participant not found in this group');
      }

      // Remove the participant
      return this.prismaService.participant.delete({
        where: {
          id: participantToRemove.id,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error removing participant: ${error.message}`,
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
      ``;

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

  async getGroupById(groupId: string) {
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
}

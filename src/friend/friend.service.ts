/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { CreateFriendshipDto } from './dto/create.friendship.dto';

export class FriendshipService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async sendFriendRequest(
    senderId: string,
    dto: CreateFriendshipDto,
  ): Promise<{ id: string; status: string; message: string }> {
    try {
      const senderProfile = await this.prisma.profile.findUnique({
        where: { accountId: senderId },
      });

      if (!senderProfile) {
        throw new Error('Người gửi không tồn tại');
      }

      const existingFriendship = await this.prisma.friendship.findUnique({
        where: {
          senderId_receiverId: {
            senderId: senderProfile.id,
            receiverId: dto.receiverId,
          },
        },
      });

      if (existingFriendship) {
        throw new Error('Yêu cầu kết bạn đã tồn tại');
      }

      const friendship = await this.prisma.friendship.create({
        data: {
          senderId: senderProfile.id,
          receiverId: dto.receiverId,
          status: 'PENDING',
        },
      });

      return {
        id: friendship.id,
        status: friendship.status,
        message: 'Yêu cầu kết bạn đã được gửi thành công',
      };
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getReceivedRequests(accountId: string): Promise<any[]> {
    try {
      const receiverProfile = await this.prisma.profile.findUnique({
        where: { accountId },
      });

      if (!receiverProfile) {
        throw new Error('Người nhận không tồn tại');
      }

      const friendships = await this.prisma.friendship.findMany({
        where: {
          receiverId: receiverProfile.id,
          status: 'PENDING',
        },
        select: {
          id: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return friendships.map(({ id, sender }) => ({
        id,
        profileId: sender.id,
        name: sender.name,
        avatar: sender.avatar,
      }));
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getSendingRequests(accountId: string): Promise<any[]> {
    try {
      const senderProfile = await this.prisma.profile.findUnique({
        where: { accountId },
      });

      if (!senderProfile) {
        throw new Error('Người gửi không tồn tại');
      }

      // Fetch friends with optimized query
      const friendships = await this.prisma.friendship.findMany({
        where: {
          senderId: senderProfile.id,
          status: 'PENDING',
        },
        select: {
          id: true,
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return friendships.map(({ id, receiver }) => ({
        id,
        profileId: receiver.id,
        name: receiver.name,
        avatar: receiver.avatar,
      }));
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async handleFriendRequest(
    friendshipId: string,
    receiverId: string,
    action: 'ACCEPT' | 'REJECT',
  ): Promise<void> {
    try {
      const receiverProfile = await this.prisma.profile.findUnique({
        where: { accountId: receiverId },
      });

      if (!receiverProfile) {
        throw new Error('Người nhận không tồn tại');
      }

      const friendRequest = await this.prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendRequest || friendRequest.receiverId !== receiverProfile.id) {
        throw new Error('Không có quyền xử lý yêu cầu này');
      }

      await this.prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' },
      });
      if (action === 'ACCEPT') {
        await this.prisma.group.create({
          data: {
            isGroup: false,
            ownerId: receiverProfile.id,
            participants: {
              create: [
                {
                  userId: receiverProfile.id,
                  role: 'OWNER',
                },
                {
                  userId: friendRequest.senderId,
                  role: 'MEMBER',
                },
              ],
            },
          },
        });
      }
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getFriends(accountId: string): Promise<any[]> {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { accountId },
      });

      if (!profile) {
        throw new Error('Người dùng không tồn tại');
      }

      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [
            { senderId: profile.id, status: 'ACCEPTED' },
            { receiverId: profile.id, status: 'ACCEPTED' },
          ],
        },
        include: {
          sender: {
            include: {
              account: {
                select: {
                  email: true,
                },
              },
            },
          },
          receiver: {
            include: {
              account: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      // Return only the friend's profile information with specific fields
      return friendships.map((friendship) => {
        const friendProfile =
          friendship.senderId === profile.id
            ? friendship.receiver
            : friendship.sender;

        return {
          id: friendship.id,
          profileId: friendProfile.id,
          name: friendProfile.name,
          avatar: friendProfile.avatar,
          bio: friendProfile.bio,
          phone: friendProfile.phone,
          birthday: friendProfile.birthday,
          email: friendProfile.account.email,
        };
      });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async deleteFriendship(
    friendshipId: string,
    accountId: string,
  ): Promise<void> {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { accountId },
      });

      if (!profile) {
        throw new Error('Người dùng không tồn tại');
      }

      const friendship = await this.prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) {
        throw new Error('Mối quan hệ không tồn tại');
      }

      // Check if the user is part of this friendship
      if (
        friendship.senderId !== profile.id &&
        friendship.receiverId !== profile.id
      ) {
        throw new Error('Không có quyền xóa mối quan hệ này');
      }

      await this.prisma.friendship.delete({
        where: { id: friendshipId },
      });

      const privateGroup = await this.prisma.group.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: [friendship.senderId, friendship.receiverId],
              },
            },
          },
        },
      });

      if (privateGroup) {
        await this.prisma.group.delete({
          where: { id: privateGroup.id },
        });
      }
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

/* eslint-disable prettier/prettier */
import { Friendship, PrismaClient } from '@prisma/client';
import { CreateFriendshipDto } from './dto/create-friendship.dto';

export class FriendshipService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async sendFriendRequest(
    senderId: string,
    dto: CreateFriendshipDto,
  ): Promise<Friendship> {
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

      return await this.prisma.friendship.create({
        data: {
          senderId: senderProfile.id,
          receiverId: dto.receiverId,
          status: 'PENDING',
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getReceivedRequests(accountId: string): Promise<Friendship[]> {
    try {
      const receiverProfile = await this.prisma.profile.findUnique({
        where: { accountId },
      });

      if (!receiverProfile) {
        throw new Error('Người nhận không tồn tại');
      }

      return await this.prisma.friendship.findMany({
        where: {
          receiverId: receiverProfile.id,
          status: 'PENDING',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
              account: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getSendingRequests(accountId: string): Promise<Friendship[]> {
    try {
      const senderProfile = await this.prisma.profile.findUnique({
        where: { accountId },
      });

      if (!senderProfile) {
        throw new Error('Người gửi không tồn tại');
      }

      return await this.prisma.friendship.findMany({
        where: {
          senderId: senderProfile.id,
          status: 'PENDING',
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
              account: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });
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
          id: friendProfile.id,
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
}

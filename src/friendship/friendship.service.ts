/* eslint-disable prettier/prettier */
import { PrismaClient, Friendship } from '@prisma/client';
import { CreateFriendshipDto } from './dto/create-friendship.dto';

export class FriendshipService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async sendFriendRequest(senderId: string, dto: CreateFriendshipDto): Promise<Friendship> {
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
            include: { account: true },
          },
        },
      });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async handleFriendRequest(friendshipId: string, receiverId: string, action: 'ACCEPT' | 'REJECT'): Promise<void> {
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
}
/* eslint-disable prettier/prettier */
import { Friendship, PrismaClient } from '@prisma/client';
import { CheckFriendshipResponseDto } from '../dto';
import { CreateFriendshipResponseDTO } from '../dto/create.friendship.dto';
import { FriendResponse } from '../dto/get.friend.dto';
import { FriendRequestAction } from '../dto/handle.request.dto';
import { UserSearchResponseDTO } from '../dto/user.search.response.dto';

export class FriendshipService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getFriendShipById(friendShipId: string): Promise<Friendship> {
    try {
      const friendShip = await this.prisma.friendship.findUnique({
        where: { id: friendShipId },
      });
      if (!friendShip) throw new Error('Không tìm thấy mối quan hệ');
      return friendShip;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<CreateFriendshipResponseDTO> {
    try {
      const existingFriendship = await this.prisma.friendship.findUnique({
        where: {
          senderId_receiverId: {
            senderId: senderId,
            receiverId: receiverId,
          },
        },
      });

      if (existingFriendship) {
        throw new Error('Yêu cầu kết bạn đã tồn tại');
      }

      const friendship = await this.prisma.friendship.create({
        data: {
          senderId: senderId,
          receiverId: receiverId,
          status: 'PENDING',
        },
      });

      return {
        friendshipId: friendship.id,
      };
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getReceivedRequests(profileId: string): Promise<FriendResponse[]> {
    try {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          receiverId: profileId,
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

  async getSendingRequests(profileId: string): Promise<FriendResponse[]> {
    try {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          senderId: profileId,
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
    profileId: string,
    action: FriendRequestAction,
  ): Promise<CreateFriendshipResponseDTO> {
    try {
      // Tìm kiếm yêu cầu kết bạn
      const friendship = await this.prisma.friendship.findUnique({
        where: { id: friendshipId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Kiểm tra yêu cầu kết bạn tồn tại
      if (!friendship) {
        throw new Error('Không tìm thấy yêu cầu kết bạn');
      }

      // Kiểm tra người dùng có quyền xử lý yêu cầu này không
      if (friendship.receiverId !== profileId) {
        throw new Error('Bạn không có quyền xử lý yêu cầu kết bạn này');
      }

      // Kiểm tra trạng thái hiện tại của yêu cầu
      if (friendship.status !== 'PENDING') {
        throw new Error('Yêu cầu kết bạn này đã được xử lý trước đó');
      }

      // Cập nhật trạng thái yêu cầu kết bạn
      const newStatus =
        action === FriendRequestAction.ACCEPT ? 'ACCEPTED' : 'REJECTED';

      await this.prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: newStatus },
      });

      // Nếu chấp nhận kết bạn, tạo nhóm chat giữa hai người
      if (action === FriendRequestAction.ACCEPT) {
        await this.prisma.group.create({
          data: {
            isGroup: false,
            ownerId: friendship.receiverId,
            participants: {
              create: [
                {
                  userId: friendship.receiverId,
                  role: 'OWNER',
                },
                {
                  userId: friendship.senderId,
                  role: 'MEMBER',
                },
              ],
            },
          },
        });
      }

      return {
        friendshipId: friendship.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Lỗi khi xử lý yêu cầu kết bạn: ${error.message}`);
      }
      throw new Error('Lỗi không xác định khi xử lý yêu cầu kết bạn');
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getRejectedRequests(profileId: string): Promise<FriendResponse[]> {
    try {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [
            { senderId: profileId, status: 'REJECTED' },
            { receiverId: profileId, status: 'REJECTED' },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return friendships.map((friendship) => {
        const friendProfile =
          friendship.senderId === profileId
            ? friendship.receiver
            : friendship.sender;

        return {
          id: friendship.id,
          profileId: friendProfile.id,
          name: friendProfile.name,
          avatar: friendProfile.avatar,
        };
      });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getFriends(profileId: string): Promise<FriendResponse[]> {
    try {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [
            { senderId: profileId, status: 'ACCEPTED' },
            { receiverId: profileId, status: 'ACCEPTED' },
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
          friendship.senderId === profileId
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
    profileId: string,
  ): Promise<void> {
    try {
      const friendship = await this.prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) {
        throw new Error('Mối quan hệ không tồn tại');
      }

      // Check if the user is part of this friendship
      if (
        friendship.senderId !== profileId &&
        friendship.receiverId !== profileId
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

  async searchUser(
    profileId: string,
    keyword: string,
  ): Promise<UserSearchResponseDTO[]> {
    try {
      const users = await this.prisma.profile.findMany({
        where: {
          AND: [
            { id: { not: profileId } },
            {
              OR: [
                {
                  account: {
                    username: { contains: keyword, mode: 'insensitive' },
                  },
                },
                { phone: { contains: keyword } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          phone: true,
          birthday: true,
          account: { select: { username: true } },
        },
      });

      return users.map((u) => ({
        id: u.id,
        username: u.account.username,
        name: u.name,
        avatar: u.avatar,
      }));
    } finally {
      await this.prisma.$disconnect();
    }
  }
  async isFriend(
    profileId: string,
    profileIdToCheck: string,
  ): Promise<CheckFriendshipResponseDto> {
    try {
      const userProfile = await this.prisma.profile.findUnique({
        where: { id: profileIdToCheck },
      });

      if (!userProfile) {
        throw new Error('Người dùng cần kiểm tra không tồn tại');
      }

      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              senderId: userProfile.id,
              receiverId: profileId,
              status: 'ACCEPTED',
            },
            {
              senderId: profileId,
              receiverId: userProfile.id,
              status: 'ACCEPTED',
            },
          ],
        },
      });

      return { isFriend: !!friendship };
    } finally {
      await this.prisma.$disconnect();
    }
  }

  // async searchUser(accountId: string, keyword: string): Promise<any[]> {
  //   try {
  //     const currentProfile = await this.prisma.profile.findUnique({
  //       where: { accountId },
  //     });

  //     if (!currentProfile) {
  //       throw new Error('Người dùng không tồn tại');
  //     }

  //     // Lấy tất cả các quan hệ bạn bè có liên quan đến current user
  //     const friendships = await this.prisma.friendship.findMany({
  //       where: {
  //         OR: [
  //           { senderId: currentProfile.id },
  //           { receiverId: currentProfile.id },
  //         ],
  //       },
  //       select: {
  //         senderId: true,
  //         receiverId: true,
  //         status: true,
  //       },
  //     });

  //     // Tạo map để tra nhanh trạng thái quan hệ
  //     const relationMap: Record<string, { status: string; senderId: string }> = {};
  //     friendships.forEach(f => {
  //       const otherId = f.senderId === currentProfile.id ? f.receiverId : f.senderId;
  //       relationMap[otherId] = { status: f.status, senderId: f.senderId };
  //     });

  //     // Tìm user theo keyword, loại trừ bản thân
  //     const users = await this.prisma.profile.findMany({
  //       where: {
  //         AND: [
  //           { accountId: { not: accountId } },
  //           {
  //             OR: [
  //               { account: { username: { contains: keyword, mode: 'insensitive' } } },
  //               { phone: { contains: keyword } },
  //             ],
  //           },
  //         ],
  //       },
  //       select: {
  //         id: true,
  //         name: true,
  //         avatar: true,
  //       },
  //     });

  //     // Gắn trạng thái quan hệ vào từng user
  //     return users.map(u => {
  //       const rel = relationMap[u.id];
  //       let relation: string;

  //       if (!rel) {
  //         relation = 'NONE';
  //       } else if (rel.status === 'ACCEPTED') {
  //         relation = 'FRIEND';
  //       } else if (rel.status === 'REJECTED') {
  //         relation = 'REJECTED';
  //       } else if (rel.status === 'PENDING') {
  //         relation = rel.senderId === currentProfile.id ? 'PENDING_SENT' : 'PENDING_RECEIVED';
  //       } else {
  //         relation = 'UNKNOWN';
  //       }

  //       return {
  //         id: u.id,
  //         name: u.name,
  //         avatar: u.avatar,
  //         relation,
  //       };
  //     });
  //   } finally {
  //     await this.prisma.$disconnect();
  //   }
  // }
}

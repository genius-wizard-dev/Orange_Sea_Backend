import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  providers: [AccountService, PrismaService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}

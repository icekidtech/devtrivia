import { Module } from '@nestjs/common';
import { UserController } from '../users/user.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [], // Add any user-related services here
  exports: [], // Export any services you want available elsewhere
})
export class UserModule {}
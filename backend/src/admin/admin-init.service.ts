import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminInitService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const adminEmail = 'admin@devtrivia.com'; // Default admin email
    const adminPassword = 'AdminPass123!'; // Default admin password (change in production)
    const adminName = 'admin'; // Default admin username

    // Check if admin exists
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create the admin user
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log('Default admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  }
}
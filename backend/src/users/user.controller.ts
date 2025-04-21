import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  UseInterceptors, 
  UploadedFile, 
  Request, 
  UseGuards, 
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  HttpException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { existsSync, mkdirSync } from 'fs';

@Controller('users')
export class UserController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createUser(@Body() body: { email: string; name?: string }) {
    try {
      return await this.prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: 'defaultPassword123', // Replace with a secure password or hash
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        if (error.meta?.target?.includes('name')) {
          const suggestions = this.generateUsernameSuggestions(body.name ?? 'user');
          throw new ConflictException({
            message: 'Username is already taken',
            suggestions,
          });
        }
      }
      throw error; // Re-throw other errors
    }
  }

  private generateUsernameSuggestions(baseName: string): string[] {
    const randomNumbers = Array.from({ length: 3 }, () =>
      Math.floor(1000 + Math.random() * 9000),
    );
    return randomNumbers.map((num) => `${baseName}${num}`);
  }

  // Get user profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: ExpressRequest) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Update user profile
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req: ExpressRequest,
    @Body() body: { name?: string; email?: string; currentPassword?: string; newPassword?: string; },
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userData: any = {};
    
    if (body.name) userData.name = body.name;
    if (body.email) userData.email = body.email;
    
    // If updating password
    if (body.currentPassword && body.newPassword) {
      // Verify current password
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
      });
      
      // Add a null check before accessing user properties
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      const isPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      
      // Hash new password
      userData.password = await bcrypt.hash(body.newPassword, 10);
    }
    
    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: req.user.id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });
    
    return updatedUser;
  }
  
  // Upload profile image
  @UseGuards(JwtAuthGuard)
  @Post('profile/image')  // Make sure this matches your frontend
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req: ExpressRequest, file, cb) => {
          // Check if req.user exists and has id
          if (!req.user || !req.user.id) {
            return cb(new Error('User not authenticated'), '');
          }
          
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(@Request() req: ExpressRequest, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User not authenticated');
      }
      
      console.log('Received file upload:', file?.originalname, file?.mimetype, file?.size);
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      
      // Verify uploads directory exists
      const uploadDir = './uploads/profiles';
      try {
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
          console.log(`Created upload directory: ${uploadDir}`);
        }
      } catch (err) {
        console.error('Error ensuring upload directory exists:', err);
        throw new InternalServerErrorException('Error processing upload - directory issue');
      }
      
      // Update user with image path
      const updatedUser = await this.prisma.user.update({
        where: { id: req.user.id },
        data: {
          profileImage: `/uploads/profiles/${file.filename}`,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw HTTP exceptions
      }
      throw new InternalServerErrorException(`Failed to process image: ${error.message}`);
    }
  }
}
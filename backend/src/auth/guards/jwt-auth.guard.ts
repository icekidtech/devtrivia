import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService?: JwtService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // For direct token verification without passport strategy
    if (this.jwtService) {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);
      
      if (!token) {
        throw new UnauthorizedException('Authentication required');
      }
      
      try {
        const payload = this.jwtService.verify(token);
        // Add user info to request
        request.user = payload;
        return true;
      } catch (error) {
        console.error('JWT verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Session expired, please login again');
        }
        throw new UnauthorizedException('Invalid authentication token');
      }
    }
    
    // Fall back to passport strategy
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Enhanced error handling
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Session expired, please login again');
      }
      
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
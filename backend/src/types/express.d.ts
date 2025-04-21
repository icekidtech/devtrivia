import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email?: string;
      role?: string;
      [key: string]: any;
    };
  }
}
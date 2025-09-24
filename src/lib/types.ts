
import type { ObjectId } from "mongodb";

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'image';
  isStreaming?: boolean;
  isLoading?: boolean;
}

export interface Chat {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string; // Optional because we'll exclude it when sending to client
  role: 'admin' | 'user';
  createdAt: Date;
  subscription?: {
    tier: 'free' | 'premium';
    expiresAt?: Date;
    paymentStatus: 'none' | 'pending' | 'paid';
  }
}

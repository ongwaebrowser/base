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

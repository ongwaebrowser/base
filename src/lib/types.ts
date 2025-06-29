export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'image';
  isStreaming?: boolean;
}

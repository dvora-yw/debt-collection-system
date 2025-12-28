export interface Message {
  id: number;
  content: string;
  senderName: string;
  source: 'SMS' | 'EMAIL' | 'SYSTEM';
  createdAt: string;
}

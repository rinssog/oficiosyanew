export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

export const createChatMessage = (message: Omit<ChatMessage, "id" | "createdAt">): ChatMessage => ({
  id: `msg_${Math.random().toString(36).slice(2, 10)}`,
  createdAt: new Date().toISOString(),
  ...message,
});

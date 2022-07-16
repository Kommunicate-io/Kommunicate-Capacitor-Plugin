
export interface KommunicateCapacitorPlugin {
  buildConversation(options: any): Promise<void>;
  updateChatContext(options: any): Promise<void>;
  updateUserDetails(options: any): Promise<void>;
  getUnreadCount(options: any): Promise<void>;
  logout(): Promise<void>;
}

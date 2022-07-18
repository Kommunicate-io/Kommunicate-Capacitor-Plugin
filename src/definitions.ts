export interface KommunicateCapacitor {
  buildConversation(options: any): Promise<void>;
  updateChatContext(options: any): Promise<void>;
  updateUserDetails(options: any): Promise<void>;
  getUnreadCount(): Promise<void>;
  logout(): Promise<void>;
}

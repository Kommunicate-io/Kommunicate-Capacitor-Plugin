export interface KommunicateCapacitor {
  login(options: any): Promise<void>;
  loginAsVisitor(options: any): Promise<void>;
  openConversation(): Promise<void>;
  openParticularConversation(options: any): Promise<void>;
  updateTeamId(options: any): Promise<void>;
  updateDefaultSettings(options: any): Promise<void>;
  buildConversation(options: any): Promise<void>;
  updateChatContext(options: any): Promise<void>;
  updateUserDetails(options: any): Promise<void>;
  getUnreadCount(): Promise<void>;
  logout(): Promise<void>;
}

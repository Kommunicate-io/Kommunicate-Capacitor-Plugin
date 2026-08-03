export interface SuccessResult {
  success: string;
}

export type BuildConversationResult =
  | { clientConversationId: string }
  | SuccessResult;

export interface UnreadCountResult {
  unreadCount: number;
}

export interface KommunicateCapacitor {
  login(options: any): Promise<SuccessResult>;
  loginAsVisitor(options: any): Promise<SuccessResult>;
  openConversation(): Promise<SuccessResult>;
  openParticularConversation(options: any): Promise<SuccessResult>;
  updateTeamId(options: any): Promise<SuccessResult>;
  updateDefaultSettings(options: any): Promise<SuccessResult>;
  buildConversation(options: any): Promise<BuildConversationResult>;
  updateChatContext(options: any): Promise<SuccessResult>;
  updateUserDetails(options: any): Promise<SuccessResult>;
  getUnreadCount(): Promise<UnreadCountResult>;
  logout(): Promise<SuccessResult>;
}

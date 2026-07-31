import { WebPlugin } from '@capacitor/core';
import { BuildConversationResult, KommunicateCapacitor, SuccessResult, UnreadCountResult } from './definitions';
export declare class KommunicateCapacitorPluginWeb extends WebPlugin implements KommunicateCapacitor {
    openConversation(): Promise<SuccessResult>;
    openParticularConversation(_options: any): Promise<SuccessResult>;
    updateTeamId(_options: any): Promise<SuccessResult>;
    updateDefaultSettings(_options: any): Promise<SuccessResult>;
    login(_options: any): Promise<SuccessResult>;
    loginAsVisitor(_options: any): Promise<SuccessResult>;
    getUnreadCount(): Promise<UnreadCountResult>;
    buildConversation(options: any): Promise<BuildConversationResult>;
    updateChatContext(options: any): Promise<SuccessResult>;
    updateUserDetails(options: any): Promise<SuccessResult>;
    logout(): Promise<SuccessResult>;
    init(successCallback: any, errorCallback: any): void;
    initPlugin(kmUser: any, successCallback: any, errorCallback: any): void;
    isUserLoggedIn(): boolean;
    getRandomId(): string;
    getPrechatLeadDetails(): any;
    createConversation(conversationObj: any, userId: string, success: any, error: any): void;
    processOpenConversation(conversationObj: any, clientChannelKey: string, successCallback: any): void;
    startConversation(conversationObj: any, clientChannelKey: string, successCallback: any, errorCallback: any): void;
    generateClientConversationId(conversationObj: any, userId: string): string;
}

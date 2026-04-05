import { WebPlugin } from '@capacitor/core';
import { KommunicateCapacitor } from './definitions';
export declare class KommunicateCapacitorPluginWeb extends WebPlugin implements KommunicateCapacitor {
    openConversation(): Promise<void>;
    openParticularConversation(_options: any): Promise<void>;
    updateTeamId(_options: any): Promise<void>;
    updateDefaultSettings(_options: any): Promise<void>;
    login(_options: any): Promise<void>;
    loginAsVisitor(_options: any): Promise<void>;
    getUnreadCount(): Promise<void>;
    buildConversation(options: any): Promise<void>;
    updateChatContext(options: any): Promise<void>;
    updateUserDetails(options: any): Promise<void>;
    logout(): Promise<void>;
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

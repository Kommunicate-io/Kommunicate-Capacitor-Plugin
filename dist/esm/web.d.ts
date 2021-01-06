import { WebPlugin } from '@capacitor/core';
import { KommunicateCapacitorPlugin } from './definitions';
export declare class KommunicateCapacitorPluginWeb extends WebPlugin implements KommunicateCapacitorPlugin {
    constructor();
    buildConversation(options: any): Promise<void>;
    updateChatContext(options: any): Promise<void>;
    updateUserDetails(options: any): Promise<void>;
    logout(): Promise<void>;
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    init(successCallback: any, errorCallback: any): void;
    initPlugin(kmUser: any, successCallback: any, errorCallback: any): void;
    isUserLoggedIn(): boolean;
    getRandomId(): string;
    getPrechatLeadDetails(): any;
    createConversation(conversationObj: any, userId: string, successCallback: any, errorCallback: any): void;
    processOpenConversation(conversationObj: any, clientChannelKey: string, successCallback: any): void;
    startConversation(conversationObj: any, clientChannelKey: string, successCallback: any, errorCallback: any): void;
    generateClientConversationId(conversationObj: any, userId: string): string;
}
declare const KommunicatePlugin: KommunicateCapacitorPluginWeb;
export { KommunicatePlugin };

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
}
declare const Kommunicate: KommunicateCapacitorPluginWeb;
export { Kommunicate };

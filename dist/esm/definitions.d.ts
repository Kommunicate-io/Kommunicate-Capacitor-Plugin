declare module '@capacitor/core' {
    interface PluginRegistry {
        KommunicatePlugin: KommunicateCapacitorPlugin;
    }
}
export interface KommunicateCapacitorPlugin {
    buildConversation(options: any): Promise<void>;
    updateChatContext(options: any): Promise<void>;
    updateUserDetails(options: any): Promise<void>;
    logout(): Promise<void>;
}

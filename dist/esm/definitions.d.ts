declare module '@capacitor/core' {
    interface PluginRegistry {
        Kommunicate: KommunicateCapacitorPlugin;
    }
}
export interface KommunicateCapacitorPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    buildConversation(options: any): Promise<void>;
    updateChatContext(options: any): Promise<void>;
    updateUserDetails(options: any): Promise<void>;
    logout(): Promise<void>;
}
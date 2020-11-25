import { WebPlugin } from '@capacitor/core';
import { KommunicateCapacitorPlugin } from './definitions';

export class KommunicateCapacitorPluginWeb extends WebPlugin implements KommunicateCapacitorPlugin {
  constructor() {
    super({
      name: 'KommunicateCapacitorPlugin',
      platforms: ['web'],
    });
  }
  buildConversation(options: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
  updateChatContext(options: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
  updateUserDetails(options: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
  logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const KommunicateCapacitorPlugin = new KommunicateCapacitorPluginWeb();

export { KommunicateCapacitorPlugin };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(KommunicateCapacitorPlugin);

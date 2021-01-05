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
    console.log('Call received for buildConversation in plugin, but method not implemented will it work?');
    return options
  }
  updateChatContext(options: any): Promise<void> {
    console.log('Call received for updateChatContext in plugin, but method not implemented');
    return options
  }
  updateUserDetails(options: any): Promise<void> {
    console.log('Call received for updateUserDetails in plugin, but method not implemented');
    return options
  }
  logout(): Promise<void> {
    console.log('Call received for logout in plugin, but method not implemented');
    let options:any = "success"
    return options;
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const Kommunicate = new KommunicateCapacitorPluginWeb();

export { Kommunicate };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Kommunicate);

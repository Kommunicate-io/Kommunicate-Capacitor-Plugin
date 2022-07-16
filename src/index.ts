import { registerPlugin } from '@capacitor/core';
import type { KommunicateCapacitorPlugin } from './definitions';

const KommunicatePlugin = registerPlugin<KommunicateCapacitorPlugin>('KommunicateCapacitorPlugin', {
  web: () => import('./web').then((m) => new m.KommunicateCapacitorPluginWeb()),
});
export * from './definitions';

export { KommunicatePlugin };
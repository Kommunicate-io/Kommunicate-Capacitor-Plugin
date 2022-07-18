import { registerPlugin } from '@capacitor/core';
import type { KommunicateCapacitor } from './definitions';

const KommunicateCapacitorPlugin = registerPlugin<KommunicateCapacitor>('KommunicateCapacitorPlugin', {
  web: () => import('./web').then((m) => new m.KommunicateCapacitorPluginWeb()),
});
export * from './definitions';

export { KommunicateCapacitorPlugin };
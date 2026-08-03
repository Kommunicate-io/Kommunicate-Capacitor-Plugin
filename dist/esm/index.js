import { registerPlugin } from '@capacitor/core';
const KommunicateCapacitorPlugin = registerPlugin('KommunicateCapacitorPlugin', {
    web: () => import('./web').then((m) => new m.KommunicateCapacitorPluginWeb()),
});
export * from './definitions';
export { KommunicateCapacitorPlugin };
//# sourceMappingURL=index.js.map
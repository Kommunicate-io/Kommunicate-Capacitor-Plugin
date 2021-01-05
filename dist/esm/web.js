var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebPlugin } from '@capacitor/core';
export class KommunicateCapacitorPluginWeb extends WebPlugin {
    constructor() {
        super({
            name: 'KommunicateCapacitorPlugin',
            platforms: ['web'],
        });
    }
    buildConversation(options) {
        console.log('Call received for buildConversation in plugin, but method not implemented');
        return options;
    }
    updateChatContext(options) {
        console.log('Call received for updateChatContext in plugin, but method not implemented');
        return options;
    }
    updateUserDetails(options) {
        console.log('Call received for updateUserDetails in plugin, but method not implemented');
        return options;
    }
    logout() {
        console.log('Call received for logout in plugin, but method not implemented');
        let options = "success";
        return options;
    }
    echo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('ECHO', options);
            return options;
        });
    }
}
const Kommunicate = new KommunicateCapacitorPluginWeb();
export { Kommunicate };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Kommunicate);
//# sourceMappingURL=web.js.map
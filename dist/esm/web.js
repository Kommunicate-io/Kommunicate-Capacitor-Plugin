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
        console.log('Call received for buildConversation in plugin, but method not implemented will it work?');
        return new Promise((resolve, reject) => {
            this.init(resolve, reject);
            if (options.hasOwnProperty('sdrf')) {
                reject("error");
            }
            resolve(options);
        });
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
    init(successCallback, errorCallback) {
        if (this.isUserLoggedIn()) {
            if (typeof Kommunicate != 'undefined' && Kommunicate) {
                successCallback("success");
            }
            else {
                this.initPlugin(null, successCallback, errorCallback);
            }
        }
        else {
            errorCallback("User not logged in, call login first");
        }
    }
    initPlugin(kmUser, successCallback, errorCallback) {
        if (localStorage && localStorage.KM_PLUGIN_USER_DETAILS) {
            kmUser = JSON.parse(localStorage.KM_PLUGIN_USER_DETAILS);
        }
        ((document, m) => {
            var kommunicateSettings = {
                "appId": kmUser.applicationId,
                "popupWidget": false,
                "automaticChatOpenOnNavigation": false,
                "userId": kmUser.userId,
                "password": kmUser.password,
                "userName": kmUser.displayName,
                "email": kmUser.email,
                "imageLink": kmUser.imageLink,
                "preLeadCollection": kmUser.withPreChat ? this.getPrechatLeadDetails() : [],
                "authenticationTypeId": kmUser.authenticationTypeId,
                "onInit": function (response) {
                    if (response && response === "success") {
                        if (kmUser.withPreChat == true) {
                            kmUser.userId = JSON.parse(sessionStorage.getItem("mckAppHeaders")).userId;
                        }
                        document.getElementById('km-chat-widget-close-button').addEventListener('click', function () {
                            var testClick = parent.document.getElementById("kommunicate-widget-iframe");
                            testClick.style.display = "none";
                        });
                        localStorage.setItem('KM_PLUGIN_USER_DETAILS', JSON.stringify(kmUser));
                        !(kmUser.withPreChat && kmUser.withPreChat == true) && parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:none");
                        successCallback(response);
                    }
                    else {
                        errorCallback(response);
                    }
                }
            };
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.async = true;
            s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
            var h = document.getElementsByTagName("head")[0];
            h.appendChild(s);
            window.kommunicate = m;
            m._globals = kommunicateSettings;
        })(document, window.kommunicate || {});
    }
    isUserLoggedIn() {
        return localStorage && localStorage.KM_PLUGIN_USER_DETAILS;
    }
    getRandomId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 32; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    getPrechatLeadDetails() {
        return [{
                "field": "Name",
                "required": false,
                "placeholder": "enter your name" // add whatever text you want to show in the placeholder
            },
            {
                "field": "Email",
                "type": "email",
                "required": true,
                "placeholder": "Enter your email"
            },
            {
                "field": "Phone",
                "type": "number",
                "required": true,
                "element": "input",
                "placeholder": "Enter your phone number"
            }
        ];
    }
    createConversation(conversationObj, userId, successCallback, errorCallback) {
        this.init((successCallback, errorCallback) => {
            if (!conversationObj.agentIds) {
                conversationObj.agentIds = [JSON.parse(sessionStorage.getItem("kommunicate")).appOptions.agentId];
            }
            var clientChannelKey = conversationObj.clientConversationId ? conversationObj.clientConversationId : (conversationObj.isUnique ? this.generateClientConversationId(conversationObj, userId) : "");
            if (clientChannelKey && clientChannelKey !== "") {
                KommunicateGlobal.Applozic.ALApiService.getGroupInfo({
                    data: {
                        clientGroupId: clientChannelKey
                    },
                    success: (response) => {
                        if (response) {
                            if (response.status === "error") {
                                if (response.errorResponse[0].errorCode === "AL-G-01") {
                                    this.startConversation(conversationObj, clientChannelKey, successCallback, errorCallback);
                                }
                                else {
                                    errorCallback(JSON.stringify(response));
                                }
                            }
                            else if (response.status === "success") {
                                this.processOpenConversation(conversationObj, clientChannelKey, successCallback);
                            }
                        }
                    },
                    error: (error) => {
                        errorCallback(error);
                    }
                });
            }
            else {
                this.startConversation(conversationObj, clientChannelKey, successCallback, errorCallback);
            }
        }, (error) => {
            errorCallback(error);
        });
    }
    processOpenConversation(conversationObj, clientChannelKey, successCallback) {
        if (conversationObj.createOnly && conversationObj.createOnly == true) {
            successCallback(clientChannelKey);
        }
        else {
            KommunicateGlobal.document.getElementById("mck-sidebox-launcher").click();
            KommunicateGlobal.$applozic.fn.applozic('loadGroupTabByClientGroupId', {
                "clientGroupId": clientChannelKey
            });
            parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
            successCallback(clientChannelKey);
        }
    }
    startConversation(conversationObj, clientChannelKey, successCallback, errorCallback) {
        var conversationDetail = {
            "agentIds": conversationObj.agentIds,
            "botIds": conversationObj.botIds,
            "skipRouting": conversationObj.skipRouting,
            "assignee": conversationObj.conversationAssignee,
            "groupName": conversationObj.groupName,
            'clientGroupId': clientChannelKey
        };
        Kommunicate.startConversation(conversationDetail, (response) => {
            parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
            successCallback(response);
        }, (error) => {
            errorCallback(error);
        });
    }
    generateClientConversationId(conversationObj, userId) {
        var clientId = "";
        if (conversationObj.agentIds) {
            conversationObj.agentIds.sort();
            for (let i = 0; i < conversationObj.agentIds.length; i++) {
                clientId += conversationObj.agentIds[i] + "_";
            }
        }
        else {
            clientId += JSON.parse(sessionStorage.getItem("kommunicate")).appOptions.agentId + "_";
        }
        clientId += userId;
        if (conversationObj.botIds) {
            conversationObj.botIds.sort();
            for (let i = 0; i < conversationObj.botIds.length; i++) {
                clientId += "_";
                clientId += conversationObj.botIds[i];
            }
        }
        return clientId;
    }
}
const KommunicatePlugin = new KommunicateCapacitorPluginWeb();
export { KommunicatePlugin };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(KommunicatePlugin);
//# sourceMappingURL=web.js.map
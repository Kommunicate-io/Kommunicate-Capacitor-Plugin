import { WebPlugin } from '@capacitor/core';
export class KommunicateCapacitorPluginWeb extends WebPlugin {
    constructor() {
        super({
            name: 'KommunicateCapacitorPlugin',
            platforms: ['web'],
        });
    }
    buildConversation(options) {
        return new Promise((resolve, reject) => {
            let kmUser;
            if (this.isUserLoggedIn()) {
                this.init((response) => {
                    console.log(response);
                    this.createConversation(options, JSON.parse(localStorage.KM_PLUGIN_USER_DETAILS).userId, resolve, reject);
                }, (error) => {
                    reject(error);
                });
            }
            else {
                if (options.kmUser) {
                    kmUser = JSON.parse(options.kmUser);
                    kmUser.applicationId = options.appId;
                }
                else if (options.withPreChat && options.withPreChat == true) {
                    kmUser.withPreChat = true;
                    kmUser.applicationId = options.appId;
                }
                else {
                    kmUser = {
                        'userId': this.getRandomId(),
                        'applicationId': options.appId
                    };
                }
                this.initPlugin(kmUser, (response) => {
                    console.log(response);
                    if (!(kmUser.withPreChat && kmUser.withPreChat == true)) {
                        this.createConversation(options, kmUser.userId, resolve, reject);
                    }
                }, (error) => {
                    reject(error);
                });
            }
        });
    }
    updateChatContext(options) {
        return new Promise((resolve, reject) => {
            if (!this.isUserLoggedIn()) {
                reject("User not logged in. Call buildConversation function once before updating the chat context");
            }
            this.init((response) => {
                console.log(response);
                window.Kommunicate.updateChatContext(options);
                resolve("Chat context updated");
            }, (error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    updateUserDetails(options) {
        return new Promise((resolve, reject) => {
            if (!this.isUserLoggedIn()) {
                reject("User not logged in. Call buildConversation function once before updating the details");
            }
            this.init((response) => {
                console.log(response);
                var userDetails = {};
                if (options.email) {
                    userDetails.email = options.email;
                }
                if (options.displayName) {
                    userDetails.displayName = options.displayName;
                }
                if (options.imageLink) {
                    userDetails.imageLink = options.imageLink;
                }
                if (options.contactNumber) {
                    userDetails.contactNumber = options.contactNumber;
                }
                if (options.metadata) {
                    userDetails.metadata = options.metadata;
                }
                window.Kommunicate.updateUser(userDetails);
                resolve("user details updated");
            }, (error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    logout() {
        return new Promise((resolve, reject) => {
            if (this.isUserLoggedIn() && typeof window.Kommunicate != 'undefined' && window.Kommunicate) {
                this.init((response) => {
                    console.log(response);
                    window.Kommunicate.logout();
                    localStorage.removeItem('KM_PLUGIN_USER_DETAILS');
                    resolve("success");
                }, (error) => {
                    console.log(error);
                    reject(error);
                });
            }
            else {
                localStorage.removeItem('KM_PLUGIN_USER_DETAILS');
                resolve("success");
            }
        });
    }
    init(successCallback, errorCallback) {
        if (!this.isUserLoggedIn()) {
            errorCallback("User not logged in, call login first");
            return;
        }
        if (typeof window.Kommunicate != 'undefined' && window.Kommunicate) {
            successCallback("success");
        }
        else {
            this.initPlugin(null, successCallback, errorCallback);
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
                            let appHeaders = sessionStorage.getItem("mckAppHeaders");
                            if (appHeaders != null) {
                                kmUser.userId = JSON.parse(appHeaders).userId;
                            }
                        }
                        let chatWidgetCloseButton = document.getElementById('km-chat-widget-close-button');
                        if (chatWidgetCloseButton != null) {
                            chatWidgetCloseButton.addEventListener('click', function () {
                                var testClick = parent.document.getElementById("kommunicate-widget-iframe");
                                if (testClick != null) {
                                    testClick.style.display = "none";
                                }
                            });
                        }
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
    createConversation(conversationObj, userId, success, error) {
        this.init((successCallback, errorCallback) => {
            let kommunicateSession = sessionStorage.getItem("kommunicate");
            if (!conversationObj.agentIds && kommunicateSession != null) {
                conversationObj.agentIds = [JSON.parse(kommunicateSession).appOptions.agentId];
            }
            var clientChannelKey = conversationObj.clientConversationId ? conversationObj.clientConversationId : (conversationObj.isUnique ? this.generateClientConversationId(conversationObj, userId) : "");
            if (clientChannelKey && clientChannelKey !== "") {
                window.KommunicateGlobal.Applozic.ALApiService.getGroupInfo({
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
                                    error(JSON.stringify(response));
                                    errorCallback(JSON.stringify(response));
                                }
                            }
                            else if (response.status === "success") {
                                this.processOpenConversation(conversationObj, clientChannelKey, successCallback);
                            }
                        }
                    },
                    error: (error) => {
                        error(error);
                        errorCallback(error);
                    }
                });
            }
            else {
                this.startConversation(conversationObj, clientChannelKey, success, error);
            }
        }, (error) => {
            error(error);
        });
    }
    processOpenConversation(conversationObj, clientChannelKey, successCallback) {
        if (conversationObj.createOnly && conversationObj.createOnly == true) {
            successCallback(clientChannelKey);
        }
        else {
            window.KommunicateGlobal.document.getElementById("mck-sidebox-launcher").click();
            window.KommunicateGlobal.$applozic.fn.applozic('loadGroupTabByClientGroupId', {
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
        window.Kommunicate.startConversation(conversationDetail, (response) => {
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
            let kommunicateSession = sessionStorage.getItem("kommunicate");
            if (kommunicateSession != null) {
                clientId += JSON.parse(kommunicateSession).appOptions.agentId + "_";
            }
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
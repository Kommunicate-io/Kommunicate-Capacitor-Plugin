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
    return new Promise((resolve, reject) => {
      this.init(resolve, reject);
      if(options.hasOwnProperty('sdrf')) {
        reject("error")
      }
      resolve(options);
    });
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
  
  init(successCallback: any, errorCallback: any): void {
    if (this.isUserLoggedIn()) {
      if (typeof Kommunicate != 'undefined' && Kommunicate) {
        successCallback("success")
      } else {
        this.initPlugin(null, successCallback, errorCallback)
      }
    } else {
      errorCallback("User not logged in, call login first")
    }
  }

  initPlugin(kmUser: any, successCallback: any, errorCallback: any): void {
    if (localStorage && localStorage.KM_PLUGIN_USER_DETAILS) {
      kmUser = JSON.parse(localStorage.KM_PLUGIN_USER_DETAILS)
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
        "onInit": function (response: any) {
          if (response && response === "success") {
            if (kmUser.withPreChat == true) {
              kmUser.userId = JSON.parse(sessionStorage.getItem("mckAppHeaders")).userId;
            }
            
            document.getElementById('km-chat-widget-close-button').addEventListener('click',function(){
              var testClick = parent.document.getElementById("kommunicate-widget-iframe");
              testClick.style.display = "none";
            });
  
            localStorage.setItem('KM_PLUGIN_USER_DETAILS', JSON.stringify(kmUser))
            !(kmUser.withPreChat && kmUser.withPreChat == true) && parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:none");
            successCallback(response);
          } else {
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
  
  isUserLoggedIn(): boolean {
    return localStorage && localStorage.KM_PLUGIN_USER_DETAILS
  }
  
  getRandomId(): string {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 32; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
  
  getPrechatLeadDetails(): any {
    return [{
        "field": "Name", // Name of the field you want to add
        "required": false, // Set 'true' to make it a mandatory field
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
        "element": "input", // Optional field (Possible values: textarea or input) 
        "placeholder": "Enter your phone number"
      }
    ];
  }
  
  createConversation(conversationObj: any, userId: string, successCallback: any, errorCallback: any): void {
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
          success: (response: any) => {
            if (response) {
               if (response.status === "error") {
                  if (response.errorResponse[0].errorCode === "AL-G-01") {
                    this.startConversation(conversationObj, clientChannelKey, successCallback, errorCallback);
                  } else {
                    errorCallback(JSON.stringify(response));
                  }
               } else if (response.status === "success") {
                    this.processOpenConversation(conversationObj, clientChannelKey, successCallback);
               }
            }
          },
          error: (error: any) => {
            errorCallback(error);
          }
        });
      } else {
        this.startConversation(conversationObj, clientChannelKey, successCallback, errorCallback);
      }
    }, (error: any) => {
      errorCallback(error)
    });
  }
  
  processOpenConversation(conversationObj: any, clientChannelKey: string, successCallback: any): void {
   if (conversationObj.createOnly && conversationObj.createOnly == true) {
        successCallback(clientChannelKey)
    } else {
      KommunicateGlobal.document.getElementById("mck-sidebox-launcher").click();
      KommunicateGlobal.$applozic.fn.applozic('loadGroupTabByClientGroupId', {
        "clientGroupId": clientChannelKey
      });
      parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
      successCallback(clientChannelKey);
    }
  }
  
  startConversation(conversationObj: any, clientChannelKey: string, successCallback: any, errorCallback:any): void {
    var conversationDetail = {
      "agentIds": conversationObj.agentIds, // Optional. If you do not pass any agent ID, the default agent will automatically get selected.
      "botIds": conversationObj.botIds, // Optional. Pass the bot IDs of the bots you want to add in this conversation.
      "skipRouting": conversationObj.skipRouting, // Optional. If this parameter is set to 'true', then routing rules will be skipped for this conversation.
      "assignee": conversationObj.conversationAssignee, // Optional. You can assign this conversation to any agent or bot. If you do not pass the ID. the conversation will assigned to the default agent. 
      "groupName": conversationObj.groupName,
      'clientGroupId': clientChannelKey
    };
    Kommunicate.startConversation(conversationDetail, (response) => {
      parent.document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
      successCallback(response);
    }, (error: any) => {
      errorCallback(error);
    });
  }

  generateClientConversationId(conversationObj: any, userId: string): string {
    var clientId = "";
    if (conversationObj.agentIds) {
      conversationObj.agentIds.sort();
      for (let i = 0; i < conversationObj.agentIds.length; i++) {
        clientId += conversationObj.agentIds[i] + "_";
      }
    } else {
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

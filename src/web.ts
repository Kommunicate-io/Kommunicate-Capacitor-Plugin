import { WebPlugin } from '@capacitor/core';
import { KommunicateCapacitorPlugin } from './definitions';

export class KommunicateCapacitorPluginWeb extends WebPlugin implements KommunicateCapacitorPlugin {
  constructor() {
    super({
      name: 'KommunicateCapacitorPlugin',
      platforms: ['web'],
    });
  }
  getUnreadCount(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  buildConversation(options: any): Promise<void> {
    return new Promise((resolve, reject) => {

    let kmUser: any;

		if (this.isUserLoggedIn()) {
			this.init((response: any) => {
        console.log(response);
				this.createConversation(options, JSON.parse(localStorage.KM_PLUGIN_USER_DETAILS).userId, resolve, reject);
			}, (error: any) => {
				reject(error)
			})
		} else {
			if (options.kmUser) {
				kmUser = JSON.parse(options.kmUser);
				kmUser.applicationId = options.appId
			} else if (options.withPreChat && options.withPreChat == true) {
				kmUser.withPreChat = true;
        kmUser.applicationId = options.appId
			} else {
				kmUser = {
					'userId': this.getRandomId(),
					'applicationId': options.appId
				}
			}
			this.initPlugin(kmUser, (response: any) => {
        console.log(response)
        if(!(kmUser.withPreChat && kmUser.withPreChat == true)) {
         this.createConversation(options, kmUser.userId, resolve, reject);
        }
			}, (error: any) => {
				reject(error);
			});
    }
    });
  }

  updateChatContext(options: any): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
      if(!this.isUserLoggedIn()) {
        reject("User not logged in. Call buildConversation function once before updating the chat context")
      }
        this.init((response: any) => {
          console.log(response);
          (window as any).Kommunicate.updateChatContext(options);
          resolve("Chat context updated")
        }, (error: any) => {
          console.log(error);
          reject(error)
        });
   })
  }

  updateUserDetails(options: any): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
      if(!this.isUserLoggedIn()) {
        reject("User not logged in. Call buildConversation function once before updating the details")
      }
        this.init((response: any) => {
          console.log(response);
          var userDetails: any = {};
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
       (window as any).Kommunicate.updateUser(userDetails);
       resolve("user details updated")
        }, (error: any) => {
          console.log(error);
          reject(error)
        });
    })
  }

  logout(): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
      if (this.isUserLoggedIn() && typeof (window as any).Kommunicate != 'undefined' && (window as any).Kommunicate) {
        this.init((response: any) => {
          console.log(response);
          (window as any).Kommunicate.logout();
          localStorage.removeItem('KM_PLUGIN_USER_DETAILS');
          resolve("success")
        }, (error: any) => {
          console.log(error);
          reject(error)
        });
      } else {
        localStorage.removeItem('KM_PLUGIN_USER_DETAILS');
        resolve("success")
      }
    });
  }
  
  init(successCallback: any, errorCallback: any): void {
    if (!this.isUserLoggedIn()) {
      errorCallback("User not logged in, call login first")
      return;
    }
    if (typeof (window as any).Kommunicate != 'undefined' && (window as any).Kommunicate) {
        successCallback("success")
      } else {  
        this.initPlugin(null, successCallback, errorCallback)
    }
  }

  initPlugin(kmUser: any, successCallback: any, errorCallback: any): void {
    if (localStorage && localStorage.KM_PLUGIN_USER_DETAILS) {
      kmUser = JSON.parse(localStorage.KM_PLUGIN_USER_DETAILS)
    }
  
    ((document, m: any) => {
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
              let appHeaders = sessionStorage.getItem("mckAppHeaders")
              if(appHeaders != null) {
                kmUser.userId = JSON.parse(appHeaders).userId;
              }
            }
            
          let chatWidgetCloseButton = (document as any).getElementById('km-chat-widget-close-button');

          if(chatWidgetCloseButton != null) {
            chatWidgetCloseButton.addEventListener('click',function() {
              var testClick = parent.document.getElementById("kommunicate-widget-iframe");
              if(testClick != null) {
                testClick.style.display = "none";
              }
            });
          }
  
            localStorage.setItem('KM_PLUGIN_USER_DETAILS', JSON.stringify(kmUser))
            !(kmUser.withPreChat && kmUser.withPreChat == true) && (parent as any).document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:none");
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
      (window as any).kommunicate = m;
      m._globals = kommunicateSettings;
    })(document, (window as any).kommunicate || {});
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
  
  createConversation(conversationObj: any, userId: string, success: any, error: any): void {
    this.init((successCallback: any, errorCallback: any) => {
      let kommunicateSession = sessionStorage.getItem("kommunicate")
      if (!conversationObj.agentIds && kommunicateSession != null) {
        conversationObj.agentIds = [JSON.parse(kommunicateSession).appOptions.agentId];
      }
      var clientChannelKey = conversationObj.clientConversationId ? conversationObj.clientConversationId : (conversationObj.isUnique ? this.generateClientConversationId(conversationObj, userId) : "");
  
      if (clientChannelKey && clientChannelKey !== "") {
        (window as any).KommunicateGlobal.Applozic.ALApiService.getGroupInfo({
          data: {
            clientGroupId: clientChannelKey
          },
          success: (response: any) => {
            if (response) {
               if (response.status === "error") {
                  if (response.errorResponse[0].errorCode === "AL-G-01") {
                    this.startConversation(conversationObj, clientChannelKey, successCallback, errorCallback);
                  } else {
                    error(JSON.stringify(response));
                    errorCallback(JSON.stringify(response));
                  }
               } else if (response.status === "success") {
                    this.processOpenConversation(conversationObj, clientChannelKey, successCallback);
               }
            }
          },
          error: (error: any) => {
            error(error);
            errorCallback(error);
          }
        });
      } else {
        this.startConversation(conversationObj, clientChannelKey, success, error);
      }
    }, (error: any) => {
      error(error)
    });
  }
  
  processOpenConversation(conversationObj: any, clientChannelKey: string, successCallback: any): void {
   if (conversationObj.createOnly && conversationObj.createOnly == true) {
        successCallback(clientChannelKey)
    } else {
      (window as any).KommunicateGlobal.document.getElementById("mck-sidebox-launcher").click();
      (window as any).KommunicateGlobal.$applozic.fn.applozic('loadGroupTabByClientGroupId', {
        "clientGroupId": clientChannelKey
      });
      (parent as any).document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
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
    (window as any).Kommunicate.startConversation(conversationDetail, (response: any) => {
      (parent as any).document.getElementById('kommunicate-widget-iframe').setAttribute("style", "display:block");
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
      let kommunicateSession = sessionStorage.getItem("kommunicate");
      if(kommunicateSession != null) {
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

import { Component } from '@angular/core';
import {KommunicateCapacitorPlugin} from 'capacitor-plugin-kommunicate';
import { Plugins } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
const {Modals } = Plugins;
import { LoadingController } from '@ionic/angular';
const appId = "<Your-App-Id>"

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public loadingController: LoadingController) {
  }

  async launchAndCreateIfEmpty() {
    const loading = await this.loadingController.create({
      spinner: null,
      message: 'Please wait while we configure conversation for you...',
      translucent: true,
      cssClass: 'custom-class custom-loading',
      backdropDismiss: true
    });
    await loading.present();
    
    KommunicateCapacitorPlugin.buildConversation({
      appId: appId,
      withPreChat: true,
      launchAndCreateIfEmpty: true
    }).then((res) => {
      loading.dismiss();
      console.log("Conversation builder success : " + JSON.stringify(res))
    }).catch(async (error) => {
      loading.dismiss();
      console.log("Conversation builder error : " + error)
    });
  }

  getUnreadCount() {
    KommunicateCapacitorPlugin.getUnreadCount().then((res) => {
      console.log("Unread count : " + JSON.stringify(res))
    }).catch(async (error) => {
      console.log("Unread count error : " + error)
    });
  
  }

  launchConversation() {

    console.log("Click received from launch conversation again")

    let kmUser = {
      applicationId: appId,
      userId: "aman",
      password: "aman"
    };

    let conversationObject = {
      appId: appId,
      isSingleConversation: true,
      kmUser: JSON.stringify(kmUser)
    };

    KommunicateCapacitorPlugin.buildConversation(conversationObject).then((res) => {
      console.log("Conversation builder success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Conversation builder error : " + error)
    });
  }

  updateChatContext() {
    console.log("Click received from update chat context")

    let chatContext = {
       'key' : 'Value from cap ' + Capacitor.getPlatform()
    };

    KommunicateCapacitorPlugin.updateChatContext(chatContext).then((res) => {
      console.log("Update chat context success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Update chat context error : " + error)
    });
  }

  updateUserDetails() {
    console.log("Click received from update user details")

    let userDetails = {
      'displayName': Capacitor.getPlatform() === 'android' ? 'CapAndroid' : (Capacitor.getPlatform() === 'ios' ? 'CapIOS' : 'CapWeb'),
      'metadata': {
        'platform': Capacitor.getPlatform() === 'android' ? 'Android' : (Capacitor.getPlatform() === 'ios' ? 'iOS' : 'Web')
      }
    }
    KommunicateCapacitorPlugin.updateUserDetails(userDetails).then((res) => {
      console.log("Update user details success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Update user details error : " + error)
    });
  }

  logout() {
    console.log("Click received from logout")

    KommunicateCapacitorPlugin.logout().then((res) => {
      console.log("Logout success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Logout error : " + error)
    });
  }

  login() {
    KommunicateCapacitorPlugin.login({
      appId: appId,
      userId: 'aman',
      password: 'aman'

    }).then((res) => {
      console.log("Login success", JSON.stringify(res))
    }).catch(async (error) => {
      console.log("login error : " + error)
    });
  }

  loginAsVisitor() {
    KommunicateCapacitorPlugin.loginAsVisitor({appId: appId}).then((res) => {
      console.log("Login as visitor" + JSON.stringify(res))
    }).catch(async (error) => {
      console.log("login error : " + error)
    });
  }

  openConversation() {
    KommunicateCapacitorPlugin.openConversation().then((res) => {
      console.log("Open conversation" + JSON.stringify(res))
    }).catch(async (error) => {
      console.log("login error : " + error)
    });
  }
  updateSettings() {
    let settings = {
      "defaultAgentIds": ["amantoppo3199@gmail.com", "amantoppo@kommunicate.io"], //list of agentID
      "defaultBotIds": ["bot-e8xil"], // list of BotID
      "defaultAssignee": "amantoppo3199@gmail.com", 
      "skipRouting": true,
      "teamId": "63773459"
      };

    KommunicateCapacitorPlugin.updateDefaultSettings(settings).then((res) => {
      console.log("Update setting" + JSON.stringify(res))
    }).catch(async (error) => {
      console.log("login error : " + error)
    });
  }

  updateTeamId() {
    KommunicateCapacitorPlugin.updateTeamId({
      'clientConversationId': '69360869',
      'teamId': '63641656'
    }).then((res) => {
      console.log("Open conversation" + JSON.stringify(res))
    }).catch(async (error) => {
      console.log("login error : " + error)
    });
  }

  openParticularConversation() {
    KommunicateCapacitorPlugin.openParticularConversation({
      'clientConversationId': '69360869',
'teamId': '63641656'
    }).then((res) => {
      console.log("Open conversation" + JSON.stringify(res))
    }).catch(async (error) => {
      console.log("login error : " + error)
    });
  }


}

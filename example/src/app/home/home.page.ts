import { Component } from '@angular/core';
import 'capacitor-plugin-kommunicate';
import { Plugins } from '@capacitor/core';
const { KommunicateCapacitorPlugin } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor() {
    
  }

  launchConversation() {
    let conversationObject = {
      appId: '<Your-App-Id>'
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
       'key' : 'Value from cap android'
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
      'displayName': 'CapAndroid'
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
}

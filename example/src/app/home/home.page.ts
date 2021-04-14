import { Component } from '@angular/core';
import 'capacitor-plugin-kommunicate';
import { Plugins } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
const { KommunicateCapacitorPlugin } = Plugins;
const appId = "<Your-App-Id>"

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor() {
  }

  launchAndCreateIfEmpty() {
    KommunicateCapacitorPlugin.buildConversation({
      appId: appId,
      launchAndCreateIfEmpty: true
    }).then((res) => {
      console.log("Conversation builder success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Conversation builder error : " + error)
    });
  }

  launchConversation() {

    console.log("Click received from launch conversation again")

    let kmUser = {
      applicationId: appId,
      userId: "reytum1",
      password: "reytum"
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
}

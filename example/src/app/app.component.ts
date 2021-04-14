import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import 'capacitor-plugin-kommunicate'
import {Plugins} from '@capacitor/core'
import { registerWebPlugin } from "@capacitor/core";
const KommunicateWebPlugin = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log('Platform is ready')
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}

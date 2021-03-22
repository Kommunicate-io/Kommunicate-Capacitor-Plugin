## Kommunicate Capacitor Chat Plugin for Customer Support https://www.kommunicate.io/

Open Source Capacitor Live Chat SDK for Ionic apps

## Overview
Kommunicate provides open source live chat sdk in capacitor which works with both Ionic apps. Kommunicate lets you add real time live chat, in-app messaging and bot integration in your mobile applications and website for customer support.

Signup at [https://dashboard.kommunicate.io/signup](https://dashboard.kommunicate.io/signup?utm_source=github&utm_medium=readme&utm_campaign=cordova) to get the Application ID.

## Installation

Add the plugin as below:

```
npm install capacitor-plugin-kommunicate
```

Since this plugin uses native modules for android and ios, add them as below. Ignore if the android and iOS modules exist in your project:
```
npx cap add android
npx cap add ios
```

### Android 
Open the android module in android studio as below:
```
npx cap open android
```

Register the plugin in your `android/app/java/<App-Package>/MainActivity.java` file as below:

```java
 this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(KommunicateCapacitorPlugin.class);   //append this line
    }});
```

### iOS
Navigate to `<Your-Project>/ios/App` directory and run the below command:
```
pod install
```

Open the iOS project in xcode as below:
```
npx cap open iOS
```

## Import the plugin
Import the plugin in the file where you would like to call the kommunicate functions as below:

```js
import 'capacitor-plugin-kommunicate';
import { Plugins } from '@capacitor/core';
const { KommunicateCapacitorPlugin } = Plugins;
```

Now you can start calling the functions from `KommunicateCapacitorPlugin`.

> Note: After any code changes in your project's .ts or .js files, run the below commands:
   ```
     npm run build
     npx cap sync
   ```
> For Android and iOS run the project fron Android Studio and Xcode respectively. For web, use the command `ionic serve`.

## Launch conversation
Kommunicate provides conversationBuilder function to create and launch conversation directly saving you the extra steps of authentication, creation, initialization and launch. You can customize the process by building the conversationObject according to your requirements.
To launch the conversation you need to create a conversation object. This object is passed to the `conversationBuilder` function and based on the parameters of the object the conversation is created/launched.

### Launch conversation for visitor:
If you would like to launch the conversation directly without the visiting user entering any details, then use the method as below:

```js
   let conversationObject = {
      appId: '<Your-App-Id>'
    };

    KommunicateCapacitorPlugin.buildConversation(conversationObject).then((res) => {
      console.log("Conversation builder success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Conversation builder error : " + error)
    });
```

### Launch conversation for visitor with lead collection:
If you need the user to fill in details like phone number, emailId and name before starting the support chat then launch the conversation with `withPreChat` flag as `true`. In this case you wouldn't need to pass the kmUser. A screen would open up for the user asking for details like emailId, phone number and name. Once the user fills the valid details (atleast emailId or phone number is required), the conversation would be launched. Use the function as below:

```js
   let conversationObject = {
      appId: '<Your-App-Id>',
      withPreChat: true
    };

    KommunicateCapacitorPlugin.buildConversation(conversationObject).then((res) => {
      console.log("Conversation builder success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Conversation builder error : " + error)
    });
```

### Launch conversation with existing user:
If you already have the user details then create a KMUser object using the details and launch the conversation. Use the method as below to create KMUser with already existing details:

```js
   let kmUser = {
      userId: "reytum", //unique userId
      password: "reytum", //optional,
      displayName: "Rey" //optional
      imageLink: "" //optional
    };
    
   let conversationObject = {
      appId: '<Your-App-Id>',
      kmUser: JSON.stringify(kmUser)
    };

    KommunicateCapacitorPlugin.buildConversation(conversationObject).then((res) => {
      console.log("Conversation builder success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Conversation builder error : " + error)
    });
```

Make sure to run the below commands after doing the code changes:
```
npm run build
npx cap sync
```

## Send data to bot platform
You can set the data you want to send to the bot platform by calling the `updateChatContext` method as below:

```js
  let chatContext = {
          'key': 'value',
          'objKey': {
            'objKey1' : 'objValue1',
            'objKey2' : 'objValue2'
          }
        };

  KommunicateCapacitorPlugin.updateChatContext(chatContext).then((res) => {
      console.log("Update chat context success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Update chat context error : " + error)
    });
  }
```

## Update logged in user's details
You can update some details of the logged in user like displayName, imageUrl, metadata etc. Use the `updateUserDetail` method as below (Remove the fields from the userDetails object below, which you don't want to update):

```js
  let userDetails = {
          'displayName': '<New Name>',
          'imageLink': '<new-image-url>',
          'email': '<New-Email>',
          'contactNumber': '<New-Contact-Number>'
          'metadata': {
            'objKey1' : 'objValue1',
            'objKey2' : 'objValue2'
          }
        };
        
   KommunicateCapacitorPlugin.updateUserDetails(userDetails).then((res) => {
      console.log("Update user details success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Update user details error : " + error)
    });
```
> Note: userId is a unique identifier of a kmUser object. It cannot be updated.

## Logout
You can call the logout method to logout the user from kommunicate. Use the method as below:

```js
  KommunicateCapacitorPlugin.logout().then((res) => {
      console.log("Logout success : " + JSON.stringify(res))
    }).catch((error) => {
      console.log("Logout error : " + error)
  });
```



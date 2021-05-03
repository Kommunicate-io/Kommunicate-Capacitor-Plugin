#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(KommunicateCapacitorPlugin, "KommunicateCapacitorPlugin",
           CAP_PLUGIN_METHOD(buildConversation, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(updateChatContext, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(updateUserDetails, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getUnreadCount, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(logout, CAPPluginReturnPromise);
           );

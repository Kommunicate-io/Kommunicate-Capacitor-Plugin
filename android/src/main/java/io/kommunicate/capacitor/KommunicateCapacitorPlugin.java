package io.kommunicate.capacitor;

import android.content.Context;
import android.os.AsyncTask;

import com.applozic.mobicomkit.api.account.user.AlUserUpdateTask;
import com.applozic.mobicomkit.feed.ChannelFeedApiResponse;
import com.applozic.mobicomkit.listners.AlCallback;
import com.applozic.mobicommons.commons.core.utils.Utils;
import com.applozic.mobicommons.json.GsonUtils;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.util.HashMap;
import java.util.Map;

import io.kommunicate.KmConversationBuilder;
import io.kommunicate.KmSettings;
import io.kommunicate.Kommunicate;
import io.kommunicate.callbacks.KMLogoutHandler;
import io.kommunicate.callbacks.KmCallback;
import io.kommunicate.users.KMUser;

@NativePlugin
public class KommunicateCapacitorPlugin extends Plugin {

    private static final String ERROR = "error";
    private static final String SUCCESS = "success";
    private static final String TAG = "KommunicateCapacitorPlugin";

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");
        Utils.printLog(getContext(), "TestPlugin", "method echo works : " + value);
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.success(ret);
    }

    @PluginMethod
    public void buildConversation(final PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method buildConversation with data : " + GsonUtils.getJsonFromObject(call.getData(), JSObject.class));

        KmConversationBuilder conversationBuilder = (KmConversationBuilder) GsonUtils.getObjectFromJson(call.getData().toString(), KmConversationBuilder.class);
        conversationBuilder.setContext(getActivity());

        if (!call.getData().has("isSingleConversation")) {
            conversationBuilder.setSingleConversation(true);
        }
        if (!call.getData().has("skipConversationList")) {
            conversationBuilder.setSkipConversationList(true);
        }

        KmCallback callback = new KmCallback() {
            @Override
            public void onSuccess(Object message) {
                call.success(getJsObject("conversationId", message));
            }

            @Override
            public void onFailure(Object error) {
                call.error(error != null ? (error instanceof ChannelFeedApiResponse ? GsonUtils.getJsonFromObject(error, ChannelFeedApiResponse.class) : error.toString()) : "Some internal error occurred");
            }
        };

        if (call.getData().has("createOnly") && call.getData().has("createOnly")) {
            conversationBuilder.createConversation(callback);
        } else if (call.getData().has("launchAndCreateIfEmpty") && call.getData().has("launchAndCreateIfEmpty")) {
            conversationBuilder.launchAndCreateIfEmpty(callback);
        } else {
            conversationBuilder.launchConversation(callback);
        }
    }

    @PluginMethod
    public void updateChatContext(PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method update chat context with data : " + GsonUtils.getJsonFromObject(call.getData(), JSObject.class));

        try {
            HashMap<String, Object> chatContext = (HashMap<String, Object>) GsonUtils.getObjectFromJson(call.getData().toString(), HashMap.class);
            if (Kommunicate.isLoggedIn(getContext())) {
                KmSettings.updateChatContext(getContext(), getStringMap(chatContext));
                call.success(getJsObject(SUCCESS, "Chat context updated"));
            } else {
                call.error("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the chatContext");
            }
        } catch (Exception e) {
            call.error(e.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void updateUserDetails(final PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method update user details with data : " + GsonUtils.getJsonFromObject(call.getData(), JSObject.class));

        try {
            if (KMUser.isLoggedIn(getContext())) {
                KMUser kmUser = (KMUser) GsonUtils.getObjectFromJson(call.getData().toString(), KMUser.class);
                new AlUserUpdateTask(getContext(), kmUser, new AlCallback() {
                    @Override
                    public void onSuccess(Object message) {
                        call.success(getJsObject(SUCCESS, "User details updated"));
                    }

                    @Override
                    public void onError(Object error) {
                        call.error("Failed to update user details : " + error);
                    }
                }).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
            } else {
                call.error("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the user details");
            }
        } catch (Exception e) {
            call.error(e.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void logout(final PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method logout");

        Kommunicate.logout(getContext(), new KMLogoutHandler() {
            @Override
            public void onSuccess(Context context) {

                call.success(getJsObject(SUCCESS, "Logout successful"));
            }

            @Override
            public void onFailure(Exception exception) {
                call.error(GsonUtils.getJsonFromObject(exception, Exception.class));
            }
        });
    }

    private JSObject getJsObject(String key, Object value) {
        JSObject jsObject = new JSObject();
        jsObject.put(key, value);
        return jsObject;
    }

    private Map<String, String> getStringMap(HashMap<String, Object> objectMap) {
        if (objectMap == null) {
            return null;
        }
        Map<String, String> newMap = new HashMap<>();
        for (Map.Entry<String, Object> entry : objectMap.entrySet()) {
            newMap.put(entry.getKey(), entry.getValue() instanceof String ? (String) entry.getValue() : entry.getValue().toString());
        }
        return newMap;
    }
}

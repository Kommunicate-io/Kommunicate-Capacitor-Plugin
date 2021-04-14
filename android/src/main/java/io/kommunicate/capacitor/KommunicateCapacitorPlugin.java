package io.kommunicate.capacitor;

import android.content.Context;
import android.text.TextUtils;

import com.applozic.mobicomkit.api.account.user.AlUserUpdateTask;
import com.applozic.mobicomkit.api.conversation.ApplozicConversation;
import com.applozic.mobicomkit.api.conversation.Message;
import com.applozic.mobicomkit.channel.service.ChannelService;
import com.applozic.mobicomkit.exception.ApplozicException;
import com.applozic.mobicomkit.feed.ChannelFeedApiResponse;
import com.applozic.mobicomkit.listners.AlCallback;
import com.applozic.mobicomkit.listners.MessageListHandler;
import com.applozic.mobicommons.commons.core.utils.Utils;
import com.applozic.mobicommons.json.GsonUtils;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.json.JSONException;

import java.util.HashMap;
import java.util.List;
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
    public void buildConversation(final PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method buildConversation with data : " + call.getData().toString());

        String kmUserString = null;

        if (call.getData().has("kmUser")) {
            kmUserString = call.getData().getString("kmUser");
            call.getData().remove("kmUser");
        }

        final KmConversationBuilder conversationBuilder = (KmConversationBuilder) GsonUtils.getObjectFromJson(call.getData().toString(), KmConversationBuilder.class);
        conversationBuilder.setContext(getActivity());

        if (!call.getData().has("isSingleConversation")) {
            conversationBuilder.setSingleConversation(true);
        }
        if (!call.getData().has("skipConversationList")) {
            conversationBuilder.setSkipConversationList(true);
        }

        if (!TextUtils.isEmpty(kmUserString)) {
            conversationBuilder.setKmUser((KMUser) GsonUtils.getObjectFromJson(kmUserString, KMUser.class));
        }

        final KmCallback callback = new KmCallback() {
            @Override
            public void onSuccess(Object message) {
                if (message instanceof Integer) {
                    String clientConversationId = ChannelService.getInstance(getActivity()).getChannel((Integer) message).getClientGroupId();
                    call.success(getJsObject("clientConversationId", clientConversationId));
                } else {
                    call.success(getJsObject("message", message));
                }
            }

            @Override
            public void onFailure(Object error) {
                call.error(error != null ? (error instanceof ChannelFeedApiResponse ? GsonUtils.getJsonFromObject(error, ChannelFeedApiResponse.class) : error.toString()) : "Some internal error occurred");
            }
        };

        if (call.getData().has("createOnly") && call.getData().has("createOnly")) {
            conversationBuilder.createConversation(callback);
        } else {
            try {
                if (call.getData().has("launchAndCreateIfEmpty") && call.getData().getBoolean("launchAndCreateIfEmpty")) {
                    ApplozicConversation.getLatestMessageList(getActivity(), false, new MessageListHandler() {
                        @Override
                        public void onResult(List<Message> messageList, ApplozicException e) {
                            if (e == null) {
                                if (messageList.isEmpty()) {
                                    conversationBuilder.setSkipConversationList(false);
                                    conversationBuilder.launchConversation(callback);
                                } else {
                                    Kommunicate.openConversation(getActivity(), callback);
                                }
                            }
                        }
                    });
                } else {
                    conversationBuilder.launchConversation(callback);
                }
            } catch (JSONException e) {
                callback.onFailure("launchAndCreateIfEmpty needs to be boolean");
                e.printStackTrace();
            }
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
                }).execute();
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

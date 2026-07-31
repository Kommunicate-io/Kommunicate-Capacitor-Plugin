package io.kommunicate.capacitor;

import android.content.Context;
import android.os.AsyncTask;
import android.text.TextUtils;

import androidx.annotation.NonNull;

import io.kommunicate.commons.commons.core.utils.Utils;
import io.kommunicate.commons.json.GsonUtils;
import io.kommunicate.commons.people.channel.Channel;
import io.kommunicate.devkit.api.account.register.RegistrationResponse;
import io.kommunicate.devkit.api.account.user.MobiComUserPreference;
import io.kommunicate.devkit.api.account.user.UserUpdateTask;
import io.kommunicate.devkit.api.conversation.ConversationHelper;
import io.kommunicate.devkit.api.conversation.Message;
import io.kommunicate.devkit.api.conversation.MessageBuilder;
import io.kommunicate.devkit.api.conversation.database.MessageDatabaseService;
import io.kommunicate.devkit.channel.service.ChannelService;
import io.kommunicate.devkit.contact.AppContactService;
import io.kommunicate.devkit.feed.ChannelFeedApiResponse;
import io.kommunicate.devkit.listners.ResultCallback;
import io.kommunicate.usecase.UserUpdateUseCase;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import io.kommunicate.KmConversationBuilder;
import io.kommunicate.KmConversationHelper;
import io.kommunicate.KmException;
import io.kommunicate.KmSettings;
import io.kommunicate.Kommunicate;
import io.kommunicate.async.KmConversationInfoTask;
import io.kommunicate.callbacks.KMLoginHandler;
import io.kommunicate.callbacks.KMLogoutHandler;
import io.kommunicate.callbacks.KmCallback;
import io.kommunicate.callbacks.KmGetConversationInfoCallback;
import io.kommunicate.users.KMUser;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;
import io.kommunicate.callbacks.TaskListener;
import io.kommunicate.usecase.MessageListUseCase;

@CapacitorPlugin
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

        if (call.getData().has("appId")) {
            Kommunicate.init(getContext(), call.getString("appId"));
        } else {
            if (!Kommunicate.isLoggedIn(getContext())) {
                call.reject("User is not logged in and no appId provided. Please provide an appId or log in first.");
                return;
            }
        }

        final KmConversationBuilder conversationBuilder = (KmConversationBuilder) GsonUtils.getObjectFromJson(
            call.getData().toString(),
            KmConversationBuilder.class
        );
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
                    String clientConversationId = ChannelService
                        .getInstance(getActivity())
                        .getChannel((Integer) message)
                        .getClientGroupId();
                    call.resolve(getJsObject("clientConversationId", clientConversationId));
                } else {
                    call.resolve(getJsObject("success", message));
                }
            }

            @Override
            public void onFailure(Object error) {
                call.reject(
                    error != null
                        ? (
                            error instanceof ChannelFeedApiResponse
                                ? GsonUtils.getJsonFromObject(error, ChannelFeedApiResponse.class)
                                : error.toString()
                        )
                        : "Some internal error occurred"
                );
            }
        };

        if (call.getData().has("createOnly") && call.getData().getBoolean("createOnly", false)) {
            conversationBuilder.createConversation(callback);
        } else {
            try {
                boolean launchAndCreateIfEmpty = call.getData().has("launchAndCreateIfEmpty") && call.getData().getBoolean("launchAndCreateIfEmpty");

                if (launchAndCreateIfEmpty) {
                    ConversationHelper.getLatestMessageList(
                            getActivity(),
                            false,
                            new TaskListener<List<Message>>() {
                                @Override
                                public void onSuccess(List<Message> messages) {
                                    if (messages == null || messages.isEmpty()) {
                                        conversationBuilder.setSkipConversationList(false);
                                        conversationBuilder.launchConversation(callback);
                                    } else {
                                        Kommunicate.openConversation(getActivity(), callback);
                                    }
                                }

                                @Override
                                public void onFailure(@NonNull Exception e) {
                                    callback.onFailure("Error fetching message list: " + e.getMessage());
                                }
                            }
                    );
                } else {
                    conversationBuilder.launchConversation(callback);
                }
            } catch (JSONException e) {
                callback.onFailure("launchAndCreateIfEmpty must be a boolean. Error: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    @PluginMethod
    public void login(PluginCall call) {
        try {
            if (call.getData().has("appId") && !TextUtils.isEmpty(call.getString("appId"))) {
                Kommunicate.init(getContext(), call.getString("appId"));
            } else {
                call.reject("appId is missing");
                return;
            }
            KMUser user = (KMUser) GsonUtils.getObjectFromJson(call.getData().toString(), KMUser.class);

            Kommunicate.login(getContext(), user, new KMLoginHandler() {
                @Override
                public void onSuccess(RegistrationResponse registrationResponse, Context context) {
                    call.resolve(getJsObject(SUCCESS, GsonUtils.getJsonFromObject(registrationResponse, RegistrationResponse.class)));
                }

                @Override
                public void onFailure(RegistrationResponse registrationResponse, Exception exception) {
                    call.reject(registrationResponse != null ? GsonUtils.getJsonFromObject(registrationResponse, RegistrationResponse.class) : exception != null ? exception.getMessage() : null);
                }
            });
        } catch (Exception e) {
            call.reject(e.toString());
        }
    }

    @PluginMethod
    public void loginAsVisitor(PluginCall call) {
        try {
            if (call.getData().has("appId") && !TextUtils.isEmpty(call.getString("appId"))) {
                Kommunicate.init(getContext(), call.getString("appId"));
            } else {
                call.reject("appId is missing");
                return;
            }

            Kommunicate.loginAsVisitor(getContext(), new KMLoginHandler() {
                @Override
                public void onSuccess(RegistrationResponse registrationResponse, Context context) {
                    call.resolve(getJsObject(SUCCESS, GsonUtils.getJsonFromObject(registrationResponse, RegistrationResponse.class)));
                }

                @Override
                public void onFailure(RegistrationResponse registrationResponse, Exception exception) {
                    call.reject(registrationResponse != null ? GsonUtils.getJsonFromObject(registrationResponse, RegistrationResponse.class) : exception != null ? exception.getMessage() : null);
                }
            });
        } catch (Exception e) {
            call.reject(e.toString());
        }
    }

    @PluginMethod
    public void openConversation(PluginCall call) {

        if (!Kommunicate.isLoggedIn(getContext())) {
            call.reject("User is not logged in. Please log in to continue.");
            return;
        }

        Kommunicate.openConversation(getContext(), new KmCallback() {
            @Override
            public void onSuccess(Object message) {
                call.resolve(getJsObject(SUCCESS, message.toString()));
            }

            @Override
            public void onFailure(Object error) {
                call.reject(error.toString());
            }
        });
    }

    @PluginMethod
    public void openParticularConversation(PluginCall call) {
        try {

            if (!Kommunicate.isLoggedIn(getContext())) {
                call.reject("User is not logged in. Please log in to continue.");
                return;
            }

            if(call.getData().has("clientConversationId")) {

                new KmConversationInfoTask(getContext(), call.getString("clientConversationId"), new KmGetConversationInfoCallback() {
                    @Override
                    public void onSuccess(Channel channel, Context context) {
                        if (channel != null) {
                            try {
                                KmConversationHelper.openConversation(context, true, channel.getKey(), new KmCallback() {
                                    @Override
                                    public void onSuccess(Object message) {
                                        call.resolve(getJsObject(SUCCESS, message.toString()));
                                    }

                                    @Override
                                    public void onFailure(Object error) {
                                        call.reject(error.toString());
                                    }
                                });
                            } catch (KmException k) {
                                call.reject(k.getMessage());
                            }
                        } else {
                            call.reject("Conversation not found");
                        }
                    }

                    @Override
                    public void onFailure(Exception e, Context context) {
                        call.reject(e.getMessage());

                    }
                }).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
            }

            else if(call.getData().has("conversationId")) {
                new KmConversationInfoTask(getContext(), call.getInt("conversationId"), new KmGetConversationInfoCallback() {
                    @Override
                    public void onSuccess(Channel channel, Context context) {
                        if (channel != null) {

                            Kommunicate.openConversation(context, channel.getKey(), new KmCallback() {
                                @Override
                                public void onSuccess(Object message) {
                                    call.resolve(getJsObject(SUCCESS, message.toString()));
                                }

                                @Override
                                public void onFailure(Object error) {
                                    call.reject(error.toString());
                                }
                            });

                        } else {
                            call.reject("Conversation not found");
                        }
                    }

                    @Override
                    public void onFailure(Exception e, Context context) {
                        call.reject(e.getMessage());
                    }
                }).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
            } else {
                call.reject("Missing required parameter: clientConversationId or conversationId");
            }

        } catch (Exception e) {
            call.reject(e.toString());
        }
    }

    @PluginMethod
    public void updateTeamId(PluginCall call) {
        try {
            final String clientConversationId = call.getData().has("clientConversationId") ? (String) call.getString("clientConversationId") : null;
            final Integer conversationId = call.getData().has("conversationId") ? (Integer) call.getInt("conversationId") : null;
            final String teamId = call.getData().has("teamId") ? (String) call.getString("teamId") : null;
            if (TextUtils.isEmpty(clientConversationId) && conversationId == null) {
                call.reject("Invalid or empty clientConversationId");
                return;
            }
            if (TextUtils.isEmpty(teamId)) {
                call.reject("Invalid or empty teamID");
                return;
            }
            if (Kommunicate.isLoggedIn(getContext())) {
                KmSettings.updateTeamId(getContext(),
                        conversationId,
                        clientConversationId,
                        teamId,
                        new KmCallback() {
                            @Override
                            public void onSuccess(Object o) {
                                call.resolve(getJsObject(SUCCESS, o.toString()));
                            }

                            @Override
                            public void onFailure(Object o) {
                                call.reject(o.toString());
                            }
                        });
            } else {
                call.reject("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the chatContext");

            }
        } catch(Exception e) {
            call.reject(e.toString());
        }
    }

    @PluginMethod
    public void updateDefaultSettings(PluginCall call) {
        try {
            KmSettings.clearDefaultSettings();
            JSONObject settingObject = new JSONObject(call.getData().toString());
            if (settingObject.has("defaultAgentIds") && !TextUtils.isEmpty(settingObject.get("defaultAgentIds").toString())) {
                List<String> agentList = new ArrayList<String>();
                for(int i = 0; i < settingObject.getJSONArray("defaultAgentIds").length(); i++){
                    agentList.add(settingObject.getJSONArray("defaultAgentIds").get(i).toString());
                }
                KmSettings.setDefaultAgentIds(agentList);
            }
            if (settingObject.has("defaultBotIds") && !TextUtils.isEmpty(settingObject.get("defaultBotIds").toString())) {
                List<String> botList = new ArrayList<String>();
                for(int i = 0; i < settingObject.getJSONArray("defaultBotIds").length(); i++){
                    botList.add(settingObject.getJSONArray("defaultBotIds").get(i).toString());
                }
                KmSettings.setDefaultBotIds(botList);
            }
            if (settingObject.has("defaultAssignee") && !TextUtils.isEmpty(settingObject.get("defaultAssignee").toString())) {
                KmSettings.setDefaultAssignee(settingObject.get("defaultAssignee").toString());
            }
            if (settingObject.has("teamId")) {
                KmSettings.setDefaultTeamId(settingObject.get("teamId").toString());
            }
            if (settingObject.has("skipRouting")) {
                KmSettings.setSkipRouting(Boolean.valueOf(settingObject.get("skipRouting").toString()));
            }
            call.resolve(getJsObject(SUCCESS, "Default setting updated"));
        } catch(Exception e) {
            call.reject(e.toString());
        }
    }

    @PluginMethod
    public void updateChatContext(PluginCall call) {
        Utils.printLog(
            getContext(),
            TAG,
            "Called method update chat context with data : " + GsonUtils.getJsonFromObject(call.getData(), JSObject.class)
        );

        try {
            HashMap<String, Object> chatContext = (HashMap<String, Object>) GsonUtils.getObjectFromJson(
                call.getData().toString(),
                HashMap.class
            );
            if (Kommunicate.isLoggedIn(getContext())) {
                KmSettings.updateChatContext(getContext(), getStringMap(chatContext));
                call.resolve(getJsObject(SUCCESS, "Chat context updated"));
            } else {
                call.reject(
                    "User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the chatContext"
                );
            }
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void getUnreadCount(PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method get unread count");
        if (KMUser.isLoggedIn(getContext())) {
            call.resolve(getJsObject("unreadCount", new MessageDatabaseService(getContext()).getTotalUnreadCount()));
        } else {
            call.reject(
                "User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before getting the unread count"
            );
        }
    }

    @PluginMethod
    public void updateUserDetails(final PluginCall call) {
        Utils.printLog(
            getContext(),
            TAG,
            "Called method update user details with data : " + GsonUtils.getJsonFromObject(call.getData(), JSObject.class)
        );

        try {
            if (KMUser.isLoggedIn(getContext())) {
                KMUser kmUser = (KMUser) GsonUtils.getObjectFromJson(call.getData().toString(), KMUser.class);
                new UserUpdateTask(
                    getContext(),
                    kmUser,
                    new ResultCallback() {
                        @Override
                        public void onSuccess(Object message) {
                            call.resolve(getJsObject(SUCCESS, "User details updated"));
                        }

                        @Override
                        public void onError(Object error) {
                            call.reject("Failed to update user details : " + error);
                        }
                    }
                )
                    .execute();
            } else {
                call.reject(
                    "User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the user details"
                );
            }
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void logout(final PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method logout");

        Kommunicate.logout(
            getContext(),
            new KMLogoutHandler() {
                @Override
                public void onSuccess(Context context) {
                    call.resolve(getJsObject(SUCCESS, "Logout successful"));
                }

                @Override
                public void onFailure(Exception exception) {
                    call.reject(GsonUtils.getJsonFromObject(exception, Exception.class));
                }
            }
        );
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

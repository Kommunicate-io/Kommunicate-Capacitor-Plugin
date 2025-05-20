package io.kommunicate.capacitor;

import android.content.Context;
import android.os.AsyncTask;
import android.text.TextUtils;

import io.kommunicate.devkit.api.account.register.RegistrationResponse;
import io.kommunicate.devkit.api.account.user.UserUpdateTask;
import io.kommunicate.devkit.api.conversation.database.MessageDatabaseService;
import io.kommunicate.devkit.channel.service.ChannelService;
import io.kommunicate.devkit.feed.ChannelFeedApiResponse;
import io.kommunicate.devkit.listners.ResultCallback;
import io.kommunicate.commons.commons.core.utils.Utils;
import io.kommunicate.commons.json.GsonUtils;
import io.kommunicate.commons.people.channel.Channel;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginResult;
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin
public class KommunicateCapacitorPlugin extends Plugin {

    private static final String ERROR = "error";
    private static final String SUCCESS = "success";
    private static final String TAG = "KommunicateCapacitorPlugin";

    @PluginMethod
    public void buildConversation(final PluginCall call) {
        JSONObject data = call.getData();
        Utils.printLog(getContext(), TAG, "Called method buildConversation with data : " + data);

        String kmUserString = null;

        if (data.has("kmUser")) {
            kmUserString = data.optString("kmUser", null);
            data.remove("kmUser");
        }

        String appId = data.optString("appId", null);
        if (appId != null) {
            Kommunicate.init(getContext(), appId);
        } else if (!Kommunicate.isLoggedIn(getContext())) {
            call.errorCallback("User is not logged in and no appId provided. Please provide an appId or log in first.");
            return;
        }

        KmConversationBuilder conversationBuilder = GsonUtils.getObjectFromJson(
                data.toString(), KmConversationBuilder.class
        );
        conversationBuilder.setContext(getActivity());

        if (!data.has("isSingleConversation")) {
            conversationBuilder.setSingleConversation(true);
        }
        if (!data.has("skipConversationList")) {
            conversationBuilder.setSkipConversationList(true);
        }

        if (!TextUtils.isEmpty(kmUserString)) {
            KMUser kmUser = GsonUtils.getObjectFromJson(kmUserString, KMUser.class);
            conversationBuilder.setKmUser(kmUser);
        }

        KmCallback callback = new KmCallback() {
            @Override
            public void onSuccess(Object message) {
                if (message instanceof Integer) {
                    String clientConversationId = ChannelService
                            .getInstance(getActivity())
                            .getChannel((Integer) message)
                            .getClientGroupId();
                    call.successCallback(getPluginResultObject("clientConversationId", clientConversationId));
                } else {
                    call.successCallback(getPluginResultObject("success", message));
                }
            }

            @Override
            public void onFailure(Object error) {
                String errorMessage;
                if (error instanceof ChannelFeedApiResponse) {
                    errorMessage = GsonUtils.getJsonFromObject(error, ChannelFeedApiResponse.class);
                } else {
                    errorMessage = error != null ? error.toString() : "Some internal error occurred";
                }
                call.errorCallback(errorMessage);
            }
        };

        try {
            boolean createOnly = data.optBoolean("createOnly", false);
            if (createOnly) {
                conversationBuilder.createConversation(callback);
                return;
            }

            boolean launchAndCreateIfEmpty = data.optBoolean("launchAndCreateIfEmpty", false);
            if (launchAndCreateIfEmpty) {
                conversationBuilder.launchAndCreateIfEmpty(callback);
            } else {
                conversationBuilder.launchConversation(callback);
            }
        } catch (Exception e) {
            callback.onFailure("Error parsing JSON flags: " + e.getMessage());
        }
    }


    @PluginMethod
    public void login(PluginCall call) {
        JSONObject data = call.getData();

        try {
            String appId = data.optString("appId", null);
            if (TextUtils.isEmpty(appId)) {
                call.errorCallback("appId is missing");
                return;
            }

            Kommunicate.init(getContext(), appId);

            KMUser user = GsonUtils.getObjectFromJson(data.toString(), KMUser.class);

            Kommunicate.login(getContext(), user, new KMLoginHandler() {
                @Override
                public void onSuccess(RegistrationResponse response, Context context) {
                    String json = GsonUtils.getJsonFromObject(response, RegistrationResponse.class);
                    call.successCallback(getPluginResultObject(SUCCESS, json));
                }

                @Override
                public void onFailure(RegistrationResponse response, Exception exception) {
                    String errorMessage = response != null
                            ? GsonUtils.getJsonFromObject(response, RegistrationResponse.class)
                            : (exception != null ? exception.getMessage() : "Unknown error");
                    call.errorCallback(errorMessage);
                }
            });

        } catch (Exception e) {
            call.errorCallback("Exception during login: " + e.getMessage());
        }
    }

    @PluginMethod
    public void loginAsVisitor(PluginCall call) {
        try {
            if (call.getData().has("appId") && !TextUtils.isEmpty(call.getString("appId"))) {
                Kommunicate.init(getContext(), call.getString("appId"));
            } else {
                call.errorCallback("appId is missing");
                return;
            }

            Kommunicate.loginAsVisitor(getContext(), new KMLoginHandler() {
                @Override
                public void onSuccess(RegistrationResponse registrationResponse, Context context) {
                    call.successCallback(getPluginResultObject(SUCCESS, GsonUtils.getJsonFromObject(
                            registrationResponse, RegistrationResponse.class)));
                }

                @Override
                public void onFailure(RegistrationResponse registrationResponse, Exception exception) {
                    call.errorCallback(
                            registrationResponse != null
                                    ? GsonUtils.getJsonFromObject(registrationResponse, RegistrationResponse.class)
                                    : exception != null ? exception.getMessage() : null
                    );
                }
            });
        } catch (Exception e) {
            call.errorCallback(e.toString());
        }
    }

    @PluginMethod
    public void openConversation(PluginCall call) {

        if (!Kommunicate.isLoggedIn(getContext())) {
            call.errorCallback("User is not logged in. Please log in to continue.");
            return;
        }

        Kommunicate.openConversation(getContext(), new KmCallback() {
            @Override
            public void onSuccess(Object message) {
                // Convert to string safely and send success callback
                call.successCallback(getPluginResultObject(SUCCESS, String.valueOf(message)));
            }

            @Override
            public void onFailure(Object error) {
                call.errorCallback(error != null ? error.toString() : "Unknown error");
            }
        });
    }

    @PluginMethod
    @SuppressWarnings("deprecation") // optional: if Kommunicate uses deprecated APIs internally
    public void openParticularConversation(PluginCall call) {
        try {
            if (!Kommunicate.isLoggedIn(getContext())) {
                call.errorCallback("User is not logged in. Please log in to continue.");
                return;
            }

            KmGetConversationInfoCallback callback = new KmGetConversationInfoCallback() {
                @Override
                public void onSuccess(Channel channel, Context context) {
                    if (channel == null) {
                        call.errorCallback("Channel data is null");
                        return;
                    }

                    try {
                        // Decide which openConversation to call depending on whether you want to force open
                        KmConversationHelper.openConversation(context, true, channel.getKey(), new KmCallback() {
                            @Override
                            public void onSuccess(Object message) {
                                call.successCallback(getPluginResultObject(SUCCESS, String.valueOf(message)));
                            }

                            @Override
                            public void onFailure(Object error) {
                                call.errorCallback(error != null ? error.toString() : "Unknown error");
                            }
                        });
                    } catch (KmException k) {
                        call.errorCallback(k.getMessage());
                    }
                }

                @Override
                public void onFailure(Exception e, Context context) {
                    call.errorCallback(e != null ? e.getMessage() : "Unknown error");
                }
            };

            if (call.getData().has("clientConversationId")) {
                String clientConversationId = call.getString("clientConversationId");
                if (clientConversationId == null || clientConversationId.isEmpty()) {
                    call.errorCallback("clientConversationId is empty");
                    return;
                }
                new KmConversationInfoTask(getContext(), clientConversationId, callback)
                        .executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);

            } else if (call.getData().has("conversationId")) {
                int conversationId = call.getInt("conversationId");
                new KmConversationInfoTask(getContext(), conversationId, new KmGetConversationInfoCallback() {
                    @Override
                    public void onSuccess(Channel channel, Context context) {
                        if (channel == null) {
                            call.errorCallback("Channel data is null");
                            return;
                        }
                        Kommunicate.openConversation(context, channel.getKey(), new KmCallback() {
                            @Override
                            public void onSuccess(Object message) {
                                call.successCallback(getPluginResultObject(SUCCESS, String.valueOf(message)));
                            }

                            @Override
                            public void onFailure(Object error) {
                                call.errorCallback(error != null ? error.toString() : "Unknown error");
                            }
                        });
                    }

                    @Override
                    public void onFailure(Exception e, Context context) {
                        call.errorCallback(e != null ? e.getMessage() : "Unknown error");
                    }
                }).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);

            } else {
                call.errorCallback("Missing required parameter: clientConversationId or conversationId");
            }
        } catch (Exception e) {
            call.errorCallback(e.toString());
        }
    }
    @PluginMethod
    public void updateTeamId(PluginCall call) {
        try {
            final String clientConversationId = call.getString("clientConversationId");
            final Integer conversationId = call.getInt("conversationId");
            final String teamId = call.getString("teamId");

            if (TextUtils.isEmpty(clientConversationId) && conversationId == null) {
                call.errorCallback("Invalid or empty clientConversationId and conversationId");
                return;
            }

            if (TextUtils.isEmpty(teamId)) {
                call.errorCallback("Invalid or empty teamId");
                return;
            }

            if (!Kommunicate.isLoggedIn(getContext())) {
                call.errorCallback("User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the chatContext");
                return;
            }

            KmSettings.updateTeamId(getContext(),
                    conversationId,
                    clientConversationId,
                    teamId,
                    new KmCallback() {
                        @Override
                        public void onSuccess(Object result) {
                            call.successCallback(getPluginResultObject(SUCCESS, String.valueOf(result)));
                        }

                        @Override
                        public void onFailure(Object error) {
                            call.errorCallback(error != null ? error.toString() : "Unknown error");
                        }
                    });

        } catch (Exception e) {
            call.errorCallback(e.toString());
        }
    }

    @PluginMethod
    public void updateDefaultSettings(PluginCall call) {
        try {
            KmSettings.clearDefaultSettings();
            JSONObject settingObject = new JSONObject(call.getData().toString());

            JSONArray defaultAgentIds = settingObject.optJSONArray("defaultAgentIds");
            if (defaultAgentIds != null && defaultAgentIds.length() > 0) {
                KmSettings.setDefaultAgentIds(jsonArrayToList(defaultAgentIds));
            }

            JSONArray defaultBotIds = settingObject.optJSONArray("defaultBotIds");
            if (defaultBotIds != null && defaultBotIds.length() > 0) {
                KmSettings.setDefaultBotIds(jsonArrayToList(defaultBotIds));
            }

            String defaultAssignee = settingObject.optString("defaultAssignee", null);
            if (!TextUtils.isEmpty(defaultAssignee)) {
                KmSettings.setDefaultAssignee(defaultAssignee);
            }

            String teamId = settingObject.optString("teamId", null);
            if (!TextUtils.isEmpty(teamId)) {
                KmSettings.setDefaultTeamId(teamId);
            }

            if (settingObject.has("skipRouting")) {
                KmSettings.setSkipRouting(settingObject.optBoolean("skipRouting", false));
            }

            call.successCallback(getPluginResultObject(SUCCESS, "Default settings updated"));
        } catch (Exception e) {
            call.errorCallback(e.toString());
        }
    }

    // Helper method moved outside
    private static List<String> jsonArrayToList(JSONArray jsonArray) throws JSONException {
        List<String> list = new ArrayList<>();
        if (jsonArray != null) {
            for (int i = 0; i < jsonArray.length(); i++) {
                list.add(jsonArray.getString(i));
            }
        }
        return list;
    }

    @PluginMethod
    @SuppressWarnings({"unchecked"})  // suppress unchecked cast warning for GsonUtils and deprecation if Kommunicate uses deprecated APIs internally
    public void updateChatContext(PluginCall call) {
        Utils.printLog(
                getContext(),
                TAG,
                "Called method update chat context with data : " + GsonUtils.getJsonFromObject(call.getData(), JSObject.class)
        );

        try {
            @SuppressWarnings("unchecked")
            HashMap<String, Object> chatContext = (HashMap<String, Object>) GsonUtils.getObjectFromJson(
                    call.getData().toString(),
                    HashMap.class
            );
            if (Kommunicate.isLoggedIn(getContext())) {
                KmSettings.updateChatContext(getContext(), getStringMap(chatContext));
                call.successCallback(getPluginResultObject(SUCCESS, "Chat context updated"));
            } else {
                call.errorCallback(
                        "User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the chatContext"
                );
            }
        } catch (Exception e) {
            call.errorCallback(e.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void getUnreadCount(PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method get unread count");
        if (KMUser.isLoggedIn(getContext())) {
            int unreadCount = new MessageDatabaseService(getContext()).getTotalUnreadCount();
            call.successCallback(getPluginResultObject("unreadCount", unreadCount));
        } else {
            call.errorCallback(
                    "User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before getting the unread count"
            );
        }
    }


    @PluginMethod
    @SuppressWarnings({"deprecation"})  // suppress unchecked cast warning for GsonUtils and deprecation if Kommunicate uses deprecated APIs internally
    public void updateUserDetails(final PluginCall call) {
        Utils.printLog(
                getContext(),
                TAG,
                "Called method update user details with data : " + GsonUtils.getJsonFromObject(call.getData(), JSObject.class)
        );

        try {
            if (KMUser.isLoggedIn(getContext())) {
                KMUser kmUser = (KMUser) GsonUtils.getObjectFromJson(call.getData().toString(), KMUser.class);
                new UserUpdateTask(getContext(), kmUser, new ResultCallback() {
                    @Override
                    public void onSuccess(Object message) {
                        call.successCallback(getPluginResultObject(SUCCESS, "User details updated"));
                    }

                    @Override
                    public void onError(Object error) {
                        call.errorCallback("Failed to update user details : " + error);
                    }
                }).execute();
            } else {
                call.errorCallback(
                        "User not authorised. This usually happens when calling the function before conversationBuilder or loginUser. Make sure you call either of the two functions before updating the user details"
                );
            }
        } catch (Exception e) {
            call.errorCallback(e.getLocalizedMessage());
        }
    }


    @PluginMethod
    public void logout(final PluginCall call) {
        Utils.printLog(getContext(), TAG, "Called method logout");

        try {
            Kommunicate.logout(
                    getContext(),
                    new KMLogoutHandler() {
                        @Override
                        public void onSuccess(Context context) {
                            call.successCallback(getPluginResultObject(SUCCESS, "Logout successful"));
                        }

                        @Override
                        public void onFailure(Exception exception) {
                            call.errorCallback(exception != null ? exception.getMessage() : "Unknown error during logout");
                        }
                    }
            );
        } catch (Exception e) {
            call.errorCallback("Exception in logout: " + e.getMessage());
        }
    }

    private PluginResult getPluginResultObject(String key, Object value) {
        PluginResult result = new PluginResult();
        result.put(key, value);
        return result;
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

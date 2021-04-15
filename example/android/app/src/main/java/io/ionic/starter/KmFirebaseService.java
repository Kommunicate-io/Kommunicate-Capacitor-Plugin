package io.ionic.starter;

import android.util.Log;

import com.applozic.mobicommons.commons.core.utils.Utils;
import com.getcapacitor.CapacitorFirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import io.kommunicate.Kommunicate;

public class KmFirebaseService extends CapacitorFirebaseMessagingService {
    private static final String TAG = "KmFCMService";

    @Override
    public void onNewToken(String s) {
        Log.w(TAG, "Found deviceToken in KM : " + s);
        Kommunicate.updateDeviceToken(this, s);
        super.onNewToken(s);
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Utils.printLog(this, TAG, "Kommunicate notification processing...");
        if (Kommunicate.isKmNotification(this, remoteMessage.getData())) {
            return;
        }
        super.onMessageReceived(remoteMessage);
    }
}

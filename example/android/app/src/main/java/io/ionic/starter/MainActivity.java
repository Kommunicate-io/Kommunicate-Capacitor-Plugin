package io.ionic.starter;

import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.google.firebase.iid.FirebaseInstanceId;

import java.util.ArrayList;

import io.kommunicate.capacitor.KommunicateCapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initializes the Bridge
        Log.w("KmService", "Token saved : " + FirebaseInstanceId.getInstance().getToken());
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            add(KommunicateCapacitorPlugin.class);
            // Additional plugins you've installed go here
            // Ex: add(TotallyAwesomePlugin.class);
        }});
    }
}

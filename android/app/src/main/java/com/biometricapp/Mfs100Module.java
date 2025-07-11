// package com.biometricapp;

// import android.util.Log;

// import com.facebook.react.bridge.ReactApplicationContext;
// import com.facebook.react.bridge.ReactContextBaseJavaModule;
// import com.facebook.react.bridge.ReactMethod;

// import com.mantra.mfs100.FingerData;
// import com.mantra.mfs100.MFS100;
// import com.mantra.mfs100.MFS100Event;

// public class Mfs100Module extends ReactContextBaseJavaModule implements MFS100Event {
//     private static final String TAG = "Mfs100Module";

//     private final ReactApplicationContext context;
//     private MFS100 mfs100;
//     private FingerData fingerData;

//     public Mfs100Module(ReactApplicationContext reactContext) {
//         super(reactContext);
//         this.context = reactContext;

//         // ✅ MFS100 expects an MFS100Event, so we pass "this"
//         mfs100 = new MFS100(this);

//         int result = mfs100.Init();
//         if (result == 0) {
//             Log.d(TAG, "MFS100 Initialized successfully.");
//         } else {
//             Log.e(TAG, "Initialization failed: " + mfs100.GetErrorMsg(result));
//         }
//     }

//     @Override
//     public String getName() {
//         return "Mfs100Module";
//     }

//     // Example method to start capture (can be called from JS)
//     @ReactMethod
//     public void startCapture() {
//         if (mfs100 != null) {
//             fingerData = new FingerData();
//             int ret = mfs100.AutoCapture(fingerData, 10000, true); // 10s timeout

//             if (ret != 0) {
//                 Log.e(TAG, "Capture failed: " + mfs100.GetErrorMsg(ret));
//             } else {
//                 Log.d(TAG, "Capture completed");
//                 Log.d(TAG, "Quality: " + fingerData.Quality());
//                 Log.d(TAG, "NFIQ: " + fingerData.Nfiq());
//                 Log.d(TAG, "ISO Template length: "
//                         + (fingerData.ISOTemplate() != null ? fingerData.ISOTemplate().length : 0));
//                 Log.d(TAG,
//                         "Bitmap length: " + (fingerData.FingerImage() != null ? fingerData.FingerImage().length : 0));
//             }
//         }
//     }

//     // 🔁 Required callbacks from MFS100Event interface:
//     @Override
//     public void OnDeviceAttached(int vid, int pid, boolean hasPermission) {
//         Log.d(TAG, "Device Attached: VID=" + vid + ", PID=" + pid);
//     }

//     @Override
//     public void OnDeviceDetached() {
//         Log.d(TAG, "Device Detached");
//     }

//     @Override
//     public void OnHostCheckFailed(String err) {
//         Log.e(TAG, "Host Check Failed: " + err);
//     }

//     public void OnCaptureCompleted(FingerData data) {
//         this.fingerData = data;

//         Log.d(TAG, "Capture completed");

//         Log.d(TAG, "Quality: " + data.Quality());
//         Log.d(TAG, "NFIQ: " + data.Nfiq());
//         Log.d(TAG, "ISO Template length: " + (data.ISOTemplate() != null ? data.ISOTemplate().length : 0));
//         Log.d(TAG, "Raw Data length: " + (data.RawData() != null ? data.RawData().length : 0));
//         Log.d(TAG, "Bitmap length: " + (data.FingerImage() != null ? data.FingerImage().length : 0));
//         Log.d(TAG, "Image Resolution: " + data.Resolution());
//         Log.d(TAG, "Image Width: " + data.InWidth());
//         Log.d(TAG, "Image Height: " + data.InHeight());
//     }

// }

package com.biometricapp;

import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.mantra.mfs100.FingerData;
import com.mantra.mfs100.MFS100;
import com.mantra.mfs100.MFS100Event;

public class Mfs100Module extends ReactContextBaseJavaModule implements MFS100Event {
    private static final String TAG = "Mfs100Module";

    private final ReactApplicationContext context;
    private MFS100 mfs100;
    private FingerData fingerData;

    public Mfs100Module(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;

        mfs100 = new MFS100(this); // MFS100Event callback
        int result = mfs100.Init();
        if (result == 0) {
            Log.d(TAG, "MFS100 Initialized successfully.");
        } else {
            Log.e(TAG, "Initialization failed: " + mfs100.GetErrorMsg(result));
        }
    }

    @Override
    public String getName() {
        return "Mfs100Module";
    }

    @ReactMethod
    public void captureFingerprint(Promise promise) {
        if (mfs100 == null) {
            promise.reject("INIT_ERROR", "MFS100 not initialized.");
            return;
        }

        if (!mfs100.IsConnected()) {
            promise.reject("DEVICE_ERROR", "MFS100 not connected.");
            return;
        }

        new Thread(() -> {
            try {
                fingerData = new FingerData();
                int ret = mfs100.AutoCapture(fingerData, 10000, true);

                if (ret != 0) {
                    String err = mfs100.GetErrorMsg(ret);
                    promise.reject("CAPTURE_ERROR", err);
                    return;
                }

                byte[] isoTemplate = fingerData.ISOTemplate();
                byte[] imageBytes = fingerData.FingerImage();

                String base64Template = Base64.encodeToString(isoTemplate, Base64.NO_WRAP);
                String base64Image = Base64.encodeToString(imageBytes, Base64.NO_WRAP);

                WritableMap result = Arguments.createMap();
                result.putString("isoTemplate", base64Template);
                result.putString("image", base64Image);
                result.putString("quality", String.valueOf(fingerData.Quality()));
                result.putString("nfiq", String.valueOf(fingerData.Nfiq()));

                promise.resolve(result);

            } catch (Exception e) {
                promise.reject("EXCEPTION", e.getMessage());
            }
        }).start();
    }

    // MFS100Event interface methods
    @Override
    public void OnDeviceAttached(int vid, int pid, boolean hasPermission) {
        Log.d(TAG, "Device Attached: VID=" + vid + ", PID=" + pid);
    }

    @Override
    public void OnDeviceDetached() {
        Log.d(TAG, "Device Detached");
    }

    @Override
    public void OnHostCheckFailed(String err) {
        Log.e(TAG, "Host Check Failed: " + err);
    }


    public void OnCaptureCompleted(FingerData data) {
        Log.d(TAG, "Callback: Capture completed from SDK");
    }
}

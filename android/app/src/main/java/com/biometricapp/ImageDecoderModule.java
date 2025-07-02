package com.biometricapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;

import java.io.File;
import java.io.FileInputStream;

public class ImageDecoderModule extends ReactContextBaseJavaModule {

    public ImageDecoderModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ImageDecoder";
    }

    @ReactMethod
    public void decodeToRGB(String imagePath, int targetWidth, int targetHeight, Promise promise) {
        try {
            File file = new File(imagePath.replace("file://", ""));
            FileInputStream fis = new FileInputStream(file);
            Bitmap bitmap = BitmapFactory.decodeStream(fis);

            // Resize the bitmap
            Bitmap resized = Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, true);

            int width = resized.getWidth();
            int height = resized.getHeight();
            int[] pixels = new int[width * height];
            resized.getPixels(pixels, 0, width, 0, 0, width, height);

            WritableArray rgbArray = Arguments.createArray();
            for (int pixel : pixels) {
                int r = (pixel >> 16) & 0xFF;
                int g = (pixel >> 8) & 0xFF;
                int b = pixel & 0xFF;
                rgbArray.pushInt(r);
                rgbArray.pushInt(g);
                rgbArray.pushInt(b);
            }

            promise.resolve(rgbArray);
        } catch (Exception e) {
            promise.reject("DECODE_ERROR", "Failed to decode image: " + e.getMessage(), e);
        }
    }
}


import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { loadModel, runFaceRecognitionFromRGB } from '../utils/fastTFLiteHelper';
import { decodeImageToRGB } from '../utils/imageDecoder';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const devices = useCameraDevices();

  const frontCamera = Object.values(devices).find(d => d.position === 'front');


  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      console.log('Camera permission:', permission);
      setHasPermission(permission === 'granted' || permission === 'authorized');
    })();

    // Load TFLite face recognition model
    loadModel()
      .then(() => setModelReady(true))
      .catch(() => {
        Alert.alert('Model Load Error', 'Failed to load face model.');
        setModelReady(false);
      });
  }, []);

  const captureFace = async () => {
    if (!cameraRef.current || !frontCamera || !modelReady) return;

    setProcessing(true);

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
      });



      const sourcePath = photo.path;
      const destPath = `${RNFS.DocumentDirectoryPath}/temp_face.jpg`;

      await RNFS.copyFile(sourcePath, destPath);
      console.log('Saved to:', destPath);

      // Decode the image to RGB format
      const rgbBuffer = await decodeImageToRGB(destPath, 112, 112);

      runFaceRecognitionFromRGB(rgbBuffer, (matched, id) => {
        setProcessing(false);
        if (matched) {
          Alert.alert('✅ Verified', `Matched with: ${id}`);
        } else {
          Alert.alert('❌ Not Verified', 'No match found');
        }
      });
    } catch (err) {
      console.error('Error during capture or processing:', err);
      setProcessing(false);
      Alert.alert('Error', 'Failed to capture or process face');
    }
  };

  if (!hasPermission) {
    console.log('hasPermission :', hasPermission);
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Waiting for camera permission...</Text>
    </View>
  );
}

if (!frontCamera) {
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Loading camera device...</Text>
    </View>
  );
}

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={frontCamera}
        isActive={true}
        photo={true}
      />
      <View style={styles.buttonBox}>
        <Button
          title="📸 Capture & Verify"
          onPress={captureFace}
          disabled={processing || !modelReady}
        />
      </View>
      {processing && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="orange" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonBox: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  loadingText: {
    marginTop: 100,
    fontSize: 18,
    textAlign: 'center',
  },
});

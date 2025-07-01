// // src/screens/CameraScreen.js
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Button,
//   Alert,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import { Camera, useCameraDevices } from 'react-native-vision-camera';
// import { captureRef } from 'react-native-view-shot';
// import RNFS from 'react-native-fs';
// import { loadModel, matchFace } from '../utils/faceHelper';

// export default function CameraScreen() {
//   const cameraRef = useRef(null);
//   const [hasPermission, setHasPermission] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [modelReady, setModelReady] = useState(false);

//   const devices = useCameraDevices();
//   const device = devices.front;

//   useEffect(() => {
//     (async () => {
//       const permission = await Camera.requestCameraPermission();
//       setHasPermission(permission === 'authorized');
//     })();
//     loadModel((ok) => setModelReady(ok));
//   }, []);

//   const captureFace = async () => {
//     if (!cameraRef.current || !device) return;

//     setProcessing(true);

//     try {
//       const photo = await cameraRef.current.takePhoto({
//         flash: 'off',
//         qualityPrioritization: 'quality',
//       });

//       const sourcePath = photo.path;
//       const destPath = `${RNFS.DocumentDirectoryPath}/temp_face.jpg`;

//       // Copy captured image to temp path
//       await RNFS.copyFile(sourcePath, destPath);
//       console.log('Saved to:', destPath);

//       matchFace((matched, id) => {
//         setProcessing(false);
//         if (matched) {
//           Alert.alert('✅ Verified', `Matched with: ${id}`);
//         } else {
//           Alert.alert('❌ Not Verified', 'No match found');
//         }
//       });
//     } catch (err) {
//       console.error(err);
//       setProcessing(false);
//       Alert.alert('Error', 'Failed to capture or process');
//     }
//   };

//   if (!device || !hasPermission) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.loadingText}>Waiting for camera permission...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Camera
//         ref={cameraRef}
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={true}
//         photo={true}
//       />
//       <View style={styles.buttonBox}>
//         <Button title="📸 Capture & Verify" onPress={captureFace} disabled={processing} />
//       </View>
//       {processing && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="orange" />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   buttonBox: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 10,
//   },
//   loadingText: {
//     marginTop: 100,
//     fontSize: 18,
//     textAlign: 'center',
//   },
// });
// src/screens/CameraScreen.js

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
import { loadModel, matchFace } from '../utils/fastTFLiteHelper';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'authorized');
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
    if (!cameraRef.current || !device || !modelReady) return;

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

      matchFace(destPath, (matched, id) => {
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

  if (!device || !hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Waiting for camera permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
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

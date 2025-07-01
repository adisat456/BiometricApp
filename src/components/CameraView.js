import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { startCamera, captureAndProcess } from '../utils/faceHelper';

export default function CameraView() {
  useEffect(() => {
    startCamera();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Button title="Capture & Verify" onPress={captureAndProcess} />
    </View>
  );
}
// This component initializes the camera and provides a button to capture and process the image.
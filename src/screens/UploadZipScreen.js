// src/screens/UploadZipScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {
  unzipReferencePhotos,
  generateEmbeddings,
} from '../utils/faceDatasetHelper';

export default function UploadZipScreen() {
  const [status, setStatus] = useState('No file selected');
  const [processing, setProcessing] = useState(false);

  const handleZipUpload = async () => {
    try {
      setStatus('Selecting file...');
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.zip],
      });

      const zipPath = `${RNFS.DocumentDirectoryPath}/references.zip`;

      // Copy the zip to internal storage
      await RNFS.copyFile(res.uri, zipPath);
      setStatus('ZIP file copied to internal storage');

      setProcessing(true);
      setStatus('Unzipping...');
      await unzipReferencePhotos();

      setStatus('Generating embeddings...');
      const result = await generateEmbeddings(true); // Merge mode

      setStatus(`✅ Done: ${result.length} total reference faces cached`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Error: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/face_embeddings.json`);
      setStatus('✅ Reference cache cleared');
    } catch {
      setStatus('No cache to clear.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Reference ZIP</Text>
      <Button title="📁 Select ZIP from Device" onPress={handleZipUpload} />
      <View style={{ marginTop: 10 }}>
        <Button title="🧹 Clear Face Cache" color="red" onPress={handleClearCache} />
      </View>
      {processing && <ActivityIndicator size="large" color="orange" style={{ marginTop: 20 }} />}
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 30 },
  status: { marginTop: 20, fontSize: 16, textAlign: 'center', color: '#333' },
});

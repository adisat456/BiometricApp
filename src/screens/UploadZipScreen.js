// // src/screens/UploadZipScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import DocumentPicker from 'react-native-document-picker';
// import RNFS from 'react-native-fs';
// import {
//   unzipReferencePhotos,
//   generateEmbeddings,
// } from '../utils/faceDatasetHelper';

// export default function UploadZipScreen() {
//   const [status, setStatus] = useState('No file selected');
//   const [processing, setProcessing] = useState(false);

//   const handleZipUpload = async () => {
//     try {
//       setStatus('Selecting file...');
//       const res = await DocumentPicker.pickSingle({
//         type: [DocumentPicker.types.zip],
//       });

//       const zipPath = `${RNFS.DocumentDirectoryPath}/references.zip`;

//       // Copy the zip to internal storage
//       await RNFS.copyFile(res.uri, zipPath);
//       setStatus('ZIP file copied to internal storage');

//       setProcessing(true);
//       setStatus('Unzipping...');
//       await unzipReferencePhotos();

//       setStatus('Generating embeddings...');
//       const result = await generateEmbeddings(true); // Merge mode

//       setStatus(`✅ Done: ${result.length} total reference faces cached`);
//     } catch (err) {
//       console.error(err);
//       setStatus('❌ Error: ' + (err.message || 'Unknown error'));
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleClearCache = async () => {
//     try {
//       await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/face_embeddings.json`);
//       setStatus('✅ Reference cache cleared');
//     } catch {
//       setStatus('No cache to clear.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Upload Reference ZIP</Text>
//       <Button title="📁 Select ZIP from Device" onPress={handleZipUpload} />
//       <View style={{ marginTop: 10 }}>
//         <Button title="🧹 Clear Face Cache" color="red" onPress={handleClearCache} />
//       </View>
//       {processing && <ActivityIndicator size="large" color="orange" style={{ marginTop: 20 }} />}
//       <Text style={styles.status}>{status}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: 'center' },
//   header: { fontSize: 24, textAlign: 'center', marginBottom: 30 },
//   status: { marginTop: 20, fontSize: 16, textAlign: 'center', color: '#333' },
// });
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

  const zipPath = `${RNFS.DocumentDirectoryPath}/references.zip`;
  const extractedPath = `${RNFS.DocumentDirectoryPath}/reference_faces`;
  const embeddingsPath = `${RNFS.DocumentDirectoryPath}/face_embeddings.json`;

  const handleZipUpload = async () => {
    try {
      setStatus('Selecting file...');
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.zip],
      });

      // Copy the ZIP file to internal storage
      await RNFS.copyFile(res.uri, zipPath);
      setStatus('ZIP file copied to internal storage');

      setProcessing(true);

      setStatus('Unzipping...');
      await unzipReferencePhotos(); // Assumes it extracts to /references

      setStatus('Generating embeddings...');
      const result = await generateEmbeddings(true); // true = merge mode

      setStatus(`✅ Done: ${result.length} total reference faces cached`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Error: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCache = async () => {
    setProcessing(true);
    try {
      let clearedAny = false;

      if (await RNFS.exists(embeddingsPath)) {
        await RNFS.unlink(embeddingsPath);
        clearedAny = true;
      }

      if (await RNFS.exists(zipPath)) {
        await RNFS.unlink(zipPath);
        clearedAny = true;
      }

      if (await RNFS.exists(extractedPath)) {
        await RNFS.unlink(extractedPath);
        clearedAny = true;
      }

      if (clearedAny) {
        setStatus('✅ All cached data cleared');
      } else {
        setStatus('Nothing to clear');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error clearing cache: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Reference ZIP</Text>
      <Button title="📁 Select ZIP from Device" onPress={handleZipUpload} />
      <View style={{ marginTop: 10 }}>
        <Button
          title="🧹 Clear Face Cache"
          color="red"
          onPress={handleClearCache}
        />
      </View>
      {processing && (
        <ActivityIndicator size="large" color="orange" style={{ marginTop: 20 }} />
      )}
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 30 },
  status: { marginTop: 20, fontSize: 16, textAlign: 'center', color: '#333' },
});

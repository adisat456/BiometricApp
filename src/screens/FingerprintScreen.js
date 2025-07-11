// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet, Alert, Image, ScrollView } from 'react-native';
// import { NativeModules } from 'react-native';

// const { Mfs100Module } = NativeModules;

// export default function FingerprintScreen() {
//   const [fingerData, setFingerData] = useState(null);

//   const captureFingerprint = async () => {
//     try {
//       const result = await Mfs100Module.captureFingerprint();
//       setFingerData(result);
//     } catch (e) {
//       console.error('❌ Capture failed:', e);
//       Alert.alert('Error', e.message || 'Fingerprint capture failed');
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Fingerprint Capture</Text>
//       <Button title="🖐️ Capture Fingerprint" onPress={captureFingerprint} />
//       {fingerData && (
//         <View style={styles.resultBox}>
//           <Text style={styles.label}>ISO Template:</Text>
//           <Text style={styles.text}>{fingerData.isoTemplate?.slice(0, 100)}...</Text>

//           <Text style={styles.label}>Quality: {fingerData.quality}</Text>
//           <Text style={styles.label}>NFIQ: {fingerData.nfiq}</Text>

//           <Text style={styles.label}>Preview:</Text>
//           <Image
//             source={{ uri: `data:image/png;base64,${fingerData.image}` }}
//             style={styles.image}
//             resizeMode="contain"
//           />
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, alignItems: 'center' },
//   title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
//   label: { marginTop: 10, fontWeight: 'bold' },
//   text: { fontSize: 12, marginTop: 5 },
//   resultBox: { marginTop: 20, width: '100%' },
//   image: {
//     width: 200,
//     height: 200,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     marginTop: 10,
//     alignSelf: 'center',
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { NativeModules } from 'react-native';

const { Mfs100Module } = NativeModules;

export default function FingerprintScreen() {
  const [fingerData, setFingerData] = useState(null);

  const captureFingerprint = async () => {
    try {
      const result = await Mfs100Module.captureFingerprint();
      setFingerData(result);
    } catch (e) {
      console.error('❌ Capture failed:', e);
      Alert.alert('Error', e.message || 'Fingerprint capture failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fingerprint Capture</Text>
      <Button title="🖐️ Capture Fingerprint" onPress={captureFingerprint} />
      {fingerData && (
        <View style={styles.resultBox}>
          <Text style={styles.label}>ISO Template (partial):</Text>
          <Text style={styles.text}>{fingerData.isoTemplate?.slice(0, 100)}...</Text>

          <Text style={styles.label}>Quality: {fingerData.quality}</Text>
          <Text style={styles.label}>NFIQ: {fingerData.nfiq}</Text>

          <Text style={styles.label}>Captured Fingerprint:</Text>
          <Image
            source={{ uri: `data:image/png;base64,${fingerData.image}` }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  label: { marginTop: 10, fontWeight: 'bold' },
  text: { fontSize: 12, marginTop: 5 },
  resultBox: { marginTop: 20, width: '100%' },
  image: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    alignSelf: 'center',
  },
});

// src/utils/faceDatasetHelper.js

import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { loadTensorflowModel } from 'react-native-fast-tflite';

const ZIP_PATH = `${RNFS.DocumentDirectoryPath}/references.zip`;
const EXTRACT_PATH = `${RNFS.DocumentDirectoryPath}/reference_faces`;
const CACHE_PATH = `${RNFS.DocumentDirectoryPath}/face_embeddings.json`;

let model = null;

/**
 * Load the TFLite model (mobilefacenet) from assets.
 */
async function loadModelIfNeeded() {
  if (!model) {
    try {
      // model = await loadTensorflowModel(require('../assets/models/mobilefacenet.tflite'));
      loadTensorflowModel({
  url: 'https://github.com/atharvakale31/Real-Time_Face_Recognition_Android/blob/master/app/src/main/assets/mobile_face_net.tflite',
})
      console.log('✅ Face model loaded in faceDatasetHelper');
    } catch (err) {
      console.error('❌ Failed to load TFLite model:', err);
      throw err;
    }
  }
}

/**
 * Unzips reference images into the document folder.
 */
export async function unzipReferencePhotos() {
  try {
    await unzip(ZIP_PATH, EXTRACT_PATH);
    console.log('📦 Unzipped to:', EXTRACT_PATH);
    return EXTRACT_PATH;
  } catch (err) {
    console.error('❌ Unzip failed:', err);
    throw err;
  }
}

/**
 * Loads the existing embedding cache from local storage.
 */
async function loadExistingCache() {
  try {
    const content = await RNFS.readFile(CACHE_PATH);
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Saves embedding data to cache.
 */
async function saveCache(data) {
  await RNFS.writeFile(CACHE_PATH, JSON.stringify(data), 'utf8');
}

/**
 * Extracts embeddings from unzipped face images.
 */
export async function generateEmbeddings(merge = true) {
  await loadModelIfNeeded();

  const files = await RNFS.readDir(EXTRACT_PATH);
  const imageFiles = files.filter(f => f.isFile() && /\.(jpg|jpeg|png)$/i.test(f.name));

  const existing = merge ? await loadExistingCache() : [];
  const newEmbeddings = [];

  for (const file of imageFiles) {
    const id = file.name.replace(/\.[^.]+$/, '');

    // Skip if already cached
    if (existing.some(e => e.id === id)) continue;

    try {
      const result = model.runModelOnImage({
        path: file.path,
        mean: 128,
        std: 128,
      });

      if (result?.[0]?.output) {
        newEmbeddings.push({ id, embedding: result[0].output });
        console.log(`✅ Embedded: ${id}`);
      } else {
        console.warn(`⚠️ No output for ${id}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${id}:`, err);
    }
  }

  const fullCache = [...existing, ...newEmbeddings];
  await saveCache(fullCache);
  console.log(`🧠 Updated embedding cache with ${newEmbeddings.length} new entries`);

  return fullCache;
}

/**
 * Loads the current embedding cache.
 */
export async function loadCachedEmbeddings() {
  return await loadExistingCache();
}

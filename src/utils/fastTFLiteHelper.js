// src/utils/fastTFLiteHelper.js
import { loadTensorflowModel } from 'react-native-fast-tflite';
import { loadCachedEmbeddings } from './faceDatasetHelper';

let model = null;

/**
 * Load the TFLite model from assets.
 */
export async function loadModel() {
  try {
    // model = await loadTensorflowModel(require('../assets/models/mobilefacenet.tflite'));
    loadTensorflowModel({
  url: 'https://github.com/atharvakale31/Real-Time_Face_Recognition_Android/blob/master/app/src/main/assets/mobile_face_net.tflite',
})
    console.log('✅ Model loaded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to load model:', error);
    return false;
  }
}

/**
 * Calculates cosine similarity between two embedding vectors.
 */
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

/**
 * Runs the face recognition model on a given image path and compares with cached embeddings.
 * @param {string} imagePath - Absolute path to the captured image
 * @param {(matched: boolean, matchedId: string|null) => void} callback
 */
export async function matchFace(imagePath, callback) {
  if (!model) {
    console.error('❌ Model not loaded. Call loadModel() first.');
    callback(false, null);
    return;
  }

  try {
    const referenceEmbeddings = await loadCachedEmbeddings();

    const result = model.runModelOnImage({
      path: imagePath,
      mean: 128,
      std: 128,
      numResults: 1,
      threshold: 0.05,
    });

    if (!result || !result[0]?.output) {
      console.error('❌ Invalid inference result.');
      callback(false, null);
      return;
    }

    const inputEmbedding = result[0].output;
    console.log('📊 Embedding from image:', inputEmbedding);

    let bestMatch = null;
    let bestScore = -1;

    for (const reference of referenceEmbeddings) {
      const score = cosineSimilarity(inputEmbedding, reference.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = reference;
      }
    }

    const isMatch = bestScore > 0.6;
    console.log(`🔍 Best match: ${bestMatch?.id} | Score: ${bestScore}`);
    callback(isMatch, bestMatch?.id || null);
  } catch (error) {
    console.error('❌ Error during inference:', error);
    callback(false, null);
  }
}

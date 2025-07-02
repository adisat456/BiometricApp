import { NativeModules } from 'react-native';

const { ImageDecoder } = NativeModules;

export async function decodeImageToRGB(imagePath, width = 112, height = 112) {
  const rgbArray = await ImageDecoder.decodeToRGB(imagePath, width, height);
  return new Uint8Array(rgbArray); // ready to pass into your TFLite model
}

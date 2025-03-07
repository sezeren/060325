import { Audio } from 'expo-av';

export interface AudioStats {
  duration: number;
  peakAmplitude: number;
  averageAmplitude: number;
  noiseLevel: number;
  quality: 'low' | 'medium' | 'high';
}

export async function configureAudioSession() {
  if (Platform.OS !== 'web') {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }
}

export function getHighQualityRecordingOptions(): Audio.RecordingOptions {
  return {
    android: {
      extension: '.m4a',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };
}

export function calculateAudioStats(amplitudes: number[]): AudioStats {
  if (amplitudes.length === 0) {
    return {
      duration: 0,
      peakAmplitude: 0,
      averageAmplitude: 0,
      noiseLevel: 0,
      quality: 'low',
    };
  }

  const peakAmplitude = Math.max(...amplitudes);
  const averageAmplitude = amplitudes.reduce((a, b) => a + b) / amplitudes.length;
  const noiseLevel = calculateNoiseLevel(amplitudes);
  
  let quality: 'low' | 'medium' | 'high' = 'low';
  if (averageAmplitude > 0.6 && noiseLevel < 0.3) {
    quality = 'high';
  } else if (averageAmplitude > 0.3 && noiseLevel < 0.5) {
    quality = 'medium';
  }

  return {
    duration: amplitudes.length * 100, // Her 100ms'de bir örnek alındığını varsayıyoruz
    peakAmplitude,
    averageAmplitude,
    noiseLevel,
    quality,
  };
}

function calculateNoiseLevel(amplitudes: number[]): number {
  const mean = amplitudes.reduce((a, b) => a + b) / amplitudes.length;
  const variance = amplitudes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amplitudes.length;
  return Math.sqrt(variance);
}
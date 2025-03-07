import axios from 'axios';
import FormData from 'form-data';
import * as FileSystem from 'expo-file-system';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function transcribeAudio(uri: string): Promise<string> {
  try {
    const formData = new FormData();
    
    // Ses dosyasını FormData'ya ekle
    const fileInfo = await FileSystem.getInfoAsync(uri);
    formData.append('file', {
      uri: uri,
      name: 'audio.m4a',
      type: 'audio/m4a'
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'tr');

    const response = await axios.post(WHISPER_API_URL, formData, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.text;
  } catch (error) {
    console.error('Transkripsiyon hatası:', error);
    throw error;
  }
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const response = await axios.post(GPT_API_URL, {
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Sen bir toplantı asistanısın. Verilen toplantı transkriptini özetle ve önemli noktaları çıkaracaksın."
        },
        {
          role: "user",
          content: `Lütfen bu toplantı transkriptini özetle ve önemli noktaları, kararları ve aksiyon maddelerini listele:\n\n${transcript}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Özetleme hatası:', error);
    throw error;
  }
}
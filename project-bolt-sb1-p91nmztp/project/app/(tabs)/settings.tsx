import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Moon, Sun, Volume2, Languages, Bell, Trash2, CircleHelp as HelpCircle, ChevronRight, LogOut, Shield, Mic, FileText } from 'lucide-react-native';

interface Settings {
  autoTranscribe: boolean;
  darkMode: boolean;
  highQualityAudio: boolean;
  notifications: boolean;
  language: string;
  transcriptFormat: string;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    autoTranscribe: true,
    darkMode: false,
    highQualityAudio: true,
    notifications: true,
    language: 'Türkçe',
    transcriptFormat: 'Markdown'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  }

  async function saveSettings(newSettings: Settings) {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error);
    }
  }

  async function handleLogout() {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/');
            } catch (error) {
              console.error('Çıkış yapılırken hata oluştu:', error);
            }
          },
        },
      ]
    );
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // Tüm verileri temizle
              await AsyncStorage.clear();
              // Kullanıcıyı giriş sayfasına yönlendir
              router.replace('/');
            } catch (error) {
              console.error('Hesap silinirken hata oluştu:', error);
            }
          },
        },
      ]
    );
  }

  function handleLanguageChange() {
    Alert.alert(
      'Dil Seçimi',
      'Tercih ettiğiniz dili seçin',
      [
        {
          text: 'Türkçe',
          onPress: () => saveSettings({ ...settings, language: 'Türkçe' }),
        },
        {
          text: 'English',
          onPress: () => saveSettings({ ...settings, language: 'English' }),
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  }

  function handleTranscriptFormatChange() {
    Alert.alert(
      'Transkript Formatı',
      'Tercih ettiğiniz formatı seçin',
      [
        {
          text: 'Markdown',
          onPress: () => saveSettings({ ...settings, transcriptFormat: 'Markdown' }),
        },
        {
          text: 'Plain Text',
          onPress: () => saveSettings({ ...settings, transcriptFormat: 'Plain Text' }),
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  }

  function handlePrivacySettings() {
    Alert.alert(
      'Gizlilik Ayarları',
      'Bu özellik henüz geliştirme aşamasındadır.',
      [{ text: 'Tamam' }]
    );
  }

  function handleHelp() {
    Alert.alert(
      'Yardım ve Destek',
      'Yardım için support@example.com adresine e-posta gönderebilirsiniz.',
      [{ text: 'Tamam' }]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayarlar</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kayıt Ayarları</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Mic size={22} color="#007AFF" />
            <Text style={styles.settingLabel}>Otomatik Transkript</Text>
          </View>
          <Switch
            value={settings.autoTranscribe}
            onValueChange={(value) => saveSettings({ ...settings, autoTranscribe: value })}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Volume2 size={22} color="#007AFF" />
            <Text style={styles.settingLabel}>Yüksek Kalite Ses</Text>
          </View>
          <Switch
            value={settings.highQualityAudio}
            onValueChange={(value) => saveSettings({ ...settings, highQualityAudio: value })}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
          />
        </View>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleTranscriptFormatChange}
        >
          <View style={styles.settingLeft}>
            <FileText size={22} color="#007AFF" />
            <Text style={styles.settingLabel}>Transkript Formatı</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{settings.transcriptFormat}</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            {settings.darkMode ? (
              <Moon size={22} color="#007AFF" />
            ) : (
              <Sun size={22} color="#007AFF" />
            )}
            <Text style={styles.settingLabel}>Karanlık Mod</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => saveSettings({ ...settings, darkMode: value })}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
          />
        </View>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleLanguageChange}
        >
          <View style={styles.settingLeft}>
            <Languages size={22} color="#007AFF" />
            <Text style={styles.settingLabel}>Dil</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{settings.language}</Text>
            <ChevronRight size={20} color="#8E8E93" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={22} color="#007AFF" />
            <Text style={styles.settingLabel}>Bildirimler</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => saveSettings({ ...settings, notifications: value })}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap</Text>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handlePrivacySettings}
        >
          <View style={styles.settingLeft}>
            <Shield size={22} color="#007AFF" />
            <Text style={styles.settingLabel}>Gizlilik Ayarları</Text>
          </View>
          <ChevronRight size={20} color="#8E8E93" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleLogout}
        >
          <View style={styles.settingLeft}>
            <LogOut size={22} color="#FF9500" />
            <Text style={[styles.settingLabel, { color: '#FF9500' }]}>Çıkış Yap</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleDeleteAccount}
        >
          <View style={styles.settingLeft}>
            <Trash2 size={22} color="#FF3B30" />
            <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Hesabı Sil</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yardım</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleHelp}
        >
          <View style={styles.settingLeft}>
            <HelpCircle size={22} color="#007AFF" />
            <Text style={styles.settingLabel}>SSS ve Destek</Text>
          </View>
          <ChevronRight size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Sürüm 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
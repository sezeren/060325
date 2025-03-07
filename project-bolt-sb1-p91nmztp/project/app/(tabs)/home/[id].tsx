import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Meeting } from '../../../types/meeting';
import { getMeetings, deleteMeeting } from '../../../utils/storage';
import { Trash2, Clock, Calendar, Share2, FileText, Tag } from 'lucide-react-native';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    loadMeeting();
  }, [id]);

  async function loadMeeting() {
    try {
      const meetings = await getMeetings();
      const foundMeeting = meetings.find(m => m.id === id);
      if (foundMeeting) {
        setMeeting(foundMeeting);
      }
    } catch (error) {
      console.error('Toplantı yüklenemedi:', error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} dakika`;
  }

  async function handleShare() {
    if (!meeting) return;

    const shareText = `
Toplantı: ${meeting.title}
Tarih: ${formatDate(meeting.date)}
Süre: ${formatDuration(meeting.duration)}

Özet:
${meeting.summary}

Transkript:
${meeting.transcript}
    `.trim();

    try {
      await Share.share({
        message: shareText,
        title: meeting.title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Toplantıyı Sil',
      'Bu toplantıyı silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeeting(id as string);
              router.back();
            } catch (error) {
              console.error('Toplantı silinemedi:', error);
            }
          }
        }
      ]
    );
  }

  if (!meeting) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Toplantı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{meeting.title}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Share2 size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Trash2 size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Calendar size={20} color="#8E8E93" />
          <Text style={styles.infoText}>{formatDate(meeting.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={20} color="#8E8E93" />
          <Text style={styles.infoText}>{formatDuration(meeting.duration)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {meeting.tags && meeting.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {meeting.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Tag size={16} color="#007AFF" />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özet</Text>
          <Text style={styles.sectionText}>{meeting.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transkript</Text>
          <Text style={styles.sectionText}>{meeting.transcript}</Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 24,
  },
});
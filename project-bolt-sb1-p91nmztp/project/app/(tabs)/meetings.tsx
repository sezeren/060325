import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Meeting } from '../../types/meeting';
import { getMeetings, deleteMeeting } from '../../utils/storage';
import { Trash2 } from 'lucide-react-native';

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const loadedMeetings = await getMeetings();
      setMeetings(loadedMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Toplantılar yüklenemedi:', error);
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

  async function handleDelete(id: string) {
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
              await deleteMeeting(id);
              await loadMeetings();
            } catch (error) {
              console.error('Toplantı silinemedi:', error);
            }
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Toplantılarım</Text>
      </View>
      
      <FlatList
        data={meetings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.meetingCard}>
            <View style={styles.meetingHeader}>
              <Text style={styles.meetingTitle}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <Text style={styles.meetingDate}>{formatDate(item.date)}</Text>
            <Text style={styles.meetingDuration}>{formatDuration(item.duration)}</Text>
            
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Özet:</Text>
              <Text style={styles.summaryText}>{item.summary}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
  listContent: {
    padding: 16,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  meetingDate: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  meetingDuration: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  summaryContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
});
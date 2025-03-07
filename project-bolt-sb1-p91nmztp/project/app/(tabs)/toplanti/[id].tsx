import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Platform, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Meeting } from '../../../types/meeting';
import { getMeetings, deleteMeeting, updateMeeting } from '../../../utils/storage';
import { exportMeetingToPDF } from '../../../utils/export';
import { Trash2, Clock, Calendar, Share2, FileText, FileCheck, Tag, FileOutput, Plus, X, StickyNote, Play, Pause, CreditCard as Edit3, Save } from 'lucide-react-native';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'notes'>('summary');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  useEffect(() => {
    loadMeeting();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  async function loadMeeting() {
    try {
      const meetings = await getMeetings();
      const foundMeeting = meetings.find(m => m.id === id);
      if (foundMeeting) {
        setMeeting(foundMeeting);
        if (foundMeeting.audioUri) {
          await loadAudio(foundMeeting.audioUri);
        }
      }
    } catch (error) {
      console.error('Toplantı yüklenemedi:', error);
    }
  }

  async function loadAudio(uri: string) {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { progressUpdateIntervalMillis: 1000 },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error('Ses dosyası yüklenemedi:', error);
    }
  }

  function onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  }

  async function togglePlayback() {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Ses oynatma hatası:', error);
    }
  }

  function formatTime(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  async function handleAddNote() {
    if (!meeting || !newNote.trim()) return;

    try {
      const updatedMeeting: Meeting = {
        ...meeting,
        notes: [...(meeting.notes || []), newNote.trim()]
      };

      await updateMeeting(updatedMeeting);
      setMeeting(updatedMeeting);
      setNewNote('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Not eklenemedi:', error);
      Alert.alert('Hata', 'Not eklenirken bir hata oluştu.');
    }
  }

  async function handleDeleteNote(index: number) {
    if (!meeting) return;

    Alert.alert(
      'Notu Sil',
      'Bu notu silmek istediğinizden emin misiniz?',
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
              const updatedNotes = [...(meeting.notes || [])];
              updatedNotes.splice(index, 1);
              
              const updatedMeeting: Meeting = {
                ...meeting,
                notes: updatedNotes
              };

              await updateMeeting(updatedMeeting);
              setMeeting(updatedMeeting);
            } catch (error) {
              console.error('Not silinemedi:', error);
              Alert.alert('Hata', 'Not silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
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

${meeting.notes && meeting.notes.length > 0 ? `
Notlar:
${meeting.notes.join('\n')}
` : ''}
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

  async function handleExport() {
    if (!meeting) return;

    try {
      await exportMeetingToPDF(meeting);
    } catch (error) {
      console.error('Dışa aktarma hatası:', error);
      Alert.alert('Hata', 'Toplantı dışa aktarılırken bir hata oluştu.');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{meeting?.title}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleExport} style={styles.iconButton}>
            <FileOutput size={24} color="#007AFF" />
          </TouchableOpacity>
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
          <Text style={styles.infoText}>{meeting && formatDate(meeting.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={20} color="#8E8E93" />
          <Text style={styles.infoText}>{meeting && formatDuration(meeting.duration)}</Text>
        </View>
      </View>

      {meeting?.audioUri && (
        <View style={styles.audioPlayer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayback}
          >
            {isPlaying ? (
              <Pause size={24} color="#FFFFFF" />
            ) : (
              <Play size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={[
              styles.progressBar,
              { width: `${(playbackPosition / playbackDuration) * 100}%` }
            ]} />
          </View>
          
          <Text style={styles.timeText}>
            {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
          </Text>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <FileCheck size={20} color={activeTab === 'summary' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            Özet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transcript' && styles.activeTab]}
          onPress={() => setActiveTab('transcript')}
        >
          <FileText size={20} color={activeTab === 'transcript' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'transcript' && styles.activeTabText]}>
            Transkript
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <StickyNote size={20} color={activeTab === 'notes' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            Notlar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'summary' && (
          <View style={styles.card}>
            {meeting?.tags && meeting.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {meeting.tags.map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <Tag size={16} color="#007AFF" />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.contentText}>{meeting?.summary}</Text>
          </View>
        )}

        {activeTab === 'transcript' && (
          <View style={styles.card}>
            <Text style={styles.contentText}>{meeting?.transcript}</Text>
          </View>
        )}

        {activeTab === 'notes' && (
          <View style={styles.notesContainer}>
            <TouchableOpacity 
              style={styles.addNoteButton}
              onPress={() => setIsAddingNote(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addNoteText}>Yeni Not Ekle</Text>
            </TouchableOpacity>

            {meeting?.notes?.map((note, index) => (
              <View key={index} style={styles.noteCard}>
                <Text style={styles.noteText}>{note}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteNote(index)}
                  style={styles.deleteNoteButton}
                >
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isAddingNote}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Not</Text>
              <TouchableOpacity onPress={() => setIsAddingNote(false)}>
                <X size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Notunuzu buraya yazın..."
              multiline
              textAlignVertical="top"
              placeholderTextColor="#8E8E93"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddNote}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    alignItems: 'center',
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
  audioPlayer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginRight: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
    minWidth: 100,
    textAlign: 'right',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F2F2F7',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
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
  contentText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  notesContainer: {
    paddingBottom: 16,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addNoteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noteCard: {
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginRight: 16,
  },
  deleteNoteButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  noteInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    height: 200,
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
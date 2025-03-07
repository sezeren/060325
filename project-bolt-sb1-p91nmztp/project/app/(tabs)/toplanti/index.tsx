import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { Meeting } from '../../../types/meeting';
import { getMeetings } from '../../../utils/storage';
import { useRouter } from 'expo-router';
import { ChevronRight, Search, Clock, CalendarDays, Tag, X } from 'lucide-react-native';

export default function ToplantiScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const router = useRouter();

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

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    meetings.forEach(meeting => {
      meeting.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [meetings]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchesSearch = 
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => meeting.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [meetings, searchQuery, selectedTags]);

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

  function groupMeetingsByDate(meetings: Meeting[]) {
    const groups: { [key: string]: Meeting[] } = {};
    
    meetings.forEach(meeting => {
      const date = new Date(meeting.date);
      const dateKey = date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(meeting);
    });
    
    return Object.entries(groups);
  }

  const groupedMeetings = useMemo(() => 
    groupMeetingsByDate(filteredMeetings),
    [filteredMeetings]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Toplantılarım</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Toplantılarda ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {allTags.length > 0 && (
        <View style={styles.tagsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}
          >
            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag) && styles.selectedTagChip
                ]}
                onPress={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                <Tag size={16} color={selectedTags.includes(tag) ? '#FFFFFF' : '#007AFF'} />
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.selectedTagText
                  ]}
                >
                  {tag}
                </Text>
                {selectedTags.includes(tag) && (
                  <X size={16} color="#FFFFFF" style={styles.tagIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={groupedMeetings}
        keyExtractor={([date]) => date}
        renderItem={({ item: [date, meetings] }) => (
          <View style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <CalendarDays size={20} color="#007AFF" />
              <Text style={styles.dateTitle}>{date}</Text>
            </View>
            
            {meetings.map((meeting) => (
              <TouchableOpacity 
                key={meeting.id}
                style={styles.meetingCard}
                onPress={() => router.push(`/toplanti/${meeting.id}`)}
              >
                <View style={styles.meetingContent}>
                  <Text style={styles.meetingTitle} numberOfLines={1}>
                    {meeting.title}
                  </Text>
                  <View style={styles.meetingInfo}>
                    <View style={styles.infoItem}>
                      <Clock size={16} color="#8E8E93" />
                      <Text style={styles.infoText}>
                        {new Date(meeting.date).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <Text style={styles.infoText}>•</Text>
                    <Text style={styles.infoText}>
                      {formatDuration(meeting.duration)}
                    </Text>
                  </View>
                  {meeting.tags && meeting.tags.length > 0 && (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.meetingTags}
                    >
                      {meeting.tags.map((tag, index) => (
                        <View key={index} style={styles.meetingTagChip}>
                          <Tag size={14} color="#8E8E93" />
                          <Text style={styles.meetingTagText}>{tag}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  <Text style={styles.summaryPreview} numberOfLines={2}>
                    {meeting.summary}
                  </Text>
                </View>
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedTags.length > 0 
                ? 'Arama sonucu bulunamadı' 
                : 'Henüz toplantı kaydı yok'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedTags.length > 0
                ? 'Farklı bir arama terimi deneyin veya filtreleri temizleyin'
                : 'Yeni bir toplantı kaydı oluşturmak için kayıt ekranına gidin'}
            </Text>
          </View>
        }
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000000',
  },
  tagsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tagsList: {
    paddingHorizontal: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTagChip: {
    backgroundColor: '#007AFF',
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  tagIcon: {
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingContent: {
    flex: 1,
    marginRight: 12,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
    marginRight: 4,
  },
  meetingTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  meetingTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  meetingTagText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  summaryPreview: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});
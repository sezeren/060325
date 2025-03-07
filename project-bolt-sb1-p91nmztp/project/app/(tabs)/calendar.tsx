import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Meeting } from '../../types/meeting';
import { getMeetings } from '../../utils/storage';
import { router } from 'expo-router';
import { Calendar as CalendarIcon, Clock, ChevronRight, Users } from 'lucide-react-native';

type GroupedMeetings = {
  [key: string]: Meeting[];
};

export default function CalendarScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [groupedMeetings, setGroupedMeetings] = useState<GroupedMeetings>({});

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const loadedMeetings = await getMeetings();
      setMeetings(loadedMeetings);
      groupMeetingsByDate(loadedMeetings);
    } catch (error) {
      console.error('Toplantılar yüklenemedi:', error);
    }
  }

  function groupMeetingsByDate(meetings: Meeting[]) {
    const grouped = meetings.reduce((acc, meeting) => {
      const date = new Date(meeting.date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(meeting);
      return acc;
    }, {} as GroupedMeetings);

    // Her gün için toplantıları saate göre sırala
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    setGroupedMeetings(grouped);
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}d` : `${mins}d`;
  }

  function generateDateButtons() {
    const dates = [];
    const today = new Date();
    
    for (let i = -15; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }

  function isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  function isSameDay(date1: Date, date2: Date) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  const dateButtons = generateDateButtons();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Takvim</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScroller}
        contentContainerStyle={styles.dateScrollerContent}
      >
        {dateButtons.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateButton,
              isSameDay(date, selectedDate) && styles.selectedDateButton,
              isToday(date) && styles.todayButton,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[
              styles.dayName,
              isSameDay(date, selectedDate) && styles.selectedDateText,
              isToday(date) && styles.todayText,
            ]}>
              {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
            </Text>
            <Text style={[
              styles.dayNumber,
              isSameDay(date, selectedDate) && styles.selectedDateText,
              isToday(date) && styles.todayText,
            ]}>
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {Object.entries(groupedMeetings).map(([date, dayMeetings]) => (
          <View key={date} style={styles.daySection}>
            <View style={styles.daySectionHeader}>
              <CalendarIcon size={20} color="#007AFF" />
              <Text style={styles.daySectionTitle}>{date}</Text>
            </View>

            {dayMeetings.map((meeting) => (
              <TouchableOpacity
                key={meeting.id}
                style={styles.meetingCard}
                onPress={() => router.push(`/meetings/${meeting.id}`)}
              >
                <View style={styles.meetingTime}>
                  <Text style={styles.timeText}>{formatTime(meeting.date)}</Text>
                  <View style={styles.durationContainer}>
                    <Clock size={14} color="#8E8E93" />
                    <Text style={styles.durationText}>
                      {formatDuration(meeting.duration)}
                    </Text>
                  </View>
                </View>

                <View style={styles.meetingContent}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  
                  <View style={styles.meetingInfo}>
                    <View style={styles.participantsContainer}>
                      <Users size={14} color="#8E8E93" />
                      <Text style={styles.participantsText}>5 Katılımcı</Text>
                    </View>
                  </View>

                  {meeting.tags && meeting.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {meeting.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {Object.keys(groupedMeetings).length === 0 && (
          <View style={styles.emptyContainer}>
            <CalendarIcon size={48} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Toplantı Yok</Text>
            <Text style={styles.emptyText}>
              Bu tarihte planlanmış toplantı bulunmuyor
            </Text>
          </View>
        )}
      </ScrollView>
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
  dateScroller: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dateScrollerContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  dateButton: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  selectedDateButton: {
    backgroundColor: '#007AFF',
  },
  todayButton: {
    backgroundColor: '#34C759',
  },
  dayName: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  daySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  meetingTime: {
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  meetingContent: {
    flex: 1,
    marginRight: 12,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  participantsText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Mic, Clock, Calendar, Users, Share2, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Meeting } from '../../types/meeting';
import { getMeetings } from '../../utils/storage';

export default function HomeScreen() {
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalDuration: 0,
    averageDuration: 0,
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const meetings = await getMeetings();
      const sorted = meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentMeetings(sorted.slice(0, 3));

      const total = meetings.length;
      const duration = meetings.reduce((sum, m) => sum + m.duration, 0);
      setStats({
        totalMeetings: total,
        totalDuration: duration,
        averageDuration: total > 0 ? duration / total : 0
      });
    } catch (error) {
      console.error('Toplantılar yüklenemedi:', error);
    }
  }

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}d` : `${mins}d`;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
          <Text style={styles.userName}>Ahmet Yılmaz</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&fit=crop' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2000&fit=crop' }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>AI ile Toplantı Yönetimi</Text>
          <Text style={styles.bannerDescription}>
            Toplantılarınızı kaydedin, özetleyin ve ekibinizle paylaşın
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Calendar size={24} color="#FFFFFF" />
          <Text style={styles.statValue}>{stats.totalMeetings}</Text>
          <Text style={styles.statLabel}>Toplam Toplantı</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Clock size={24} color="#FFFFFF" />
          <Text style={styles.statValue}>{formatDuration(stats.averageDuration)}</Text>
          <Text style={styles.statLabel}>Ortalama Süre</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.recordButton}
        onPress={() => router.push('/(tabs)/record')}
      >
        <View style={styles.recordContent}>
          <View style={styles.recordIcon}>
            <Mic size={24} color="#FFFFFF" />
          </View>
          <View style={styles.recordTextContainer}>
            <Text style={styles.recordTitle}>Yeni Toplantı Kaydet</Text>
            <Text style={styles.recordDescription}>
              Toplantınızı kaydedin ve özetleyin
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#8E8E93" />
      </TouchableOpacity>

      {recentMeetings.length > 0 && (
        <View style={styles.recentMeetings}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Toplantılar</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/meetings')}>
              <Text style={styles.seeAllButton}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {recentMeetings.map((meeting) => (
            <TouchableOpacity
              key={meeting.id}
              style={styles.meetingCard}
              onPress={() => router.push(`/meetings/${meeting.id}`)}
            >
              <View style={styles.meetingHeader}>
                <Text style={styles.meetingTitle}>{meeting.title}</Text>
                <View style={styles.meetingDuration}>
                  <Clock size={14} color="#8E8E93" />
                  <Text style={styles.durationText}>
                    {formatDuration(meeting.duration)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.meetingSummary} numberOfLines={2}>
                {meeting.summary}
              </Text>

              {meeting.audioStats && (
                <View style={styles.audioQuality}>
                  <View style={[
                    styles.qualityIndicator,
                    { backgroundColor: meeting.audioStats.quality === 'high' ? '#34C759' : 
                      meeting.audioStats.quality === 'medium' ? '#FF9500' : '#FF3B30' }
                  ]} />
                  <Text style={styles.qualityText}>
                    {meeting.audioStats.quality === 'high' ? 'Yüksek Kalite' :
                     meeting.audioStats.quality === 'medium' ? 'Orta Kalite' : 'Düşük Kalite'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  banner: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryCard: {
    backgroundColor: '#007AFF',
  },
  secondaryCard: {
    backgroundColor: '#34C759',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  recordButton: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordTextContainer: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  recordDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recentMeetings: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  seeAllButton: {
    fontSize: 16,
    color: '#007AFF',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  meetingDuration: {
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
  meetingSummary: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 8,
  },
  audioQuality: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  qualityText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
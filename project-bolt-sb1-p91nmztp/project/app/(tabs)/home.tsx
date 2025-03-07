import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { Meeting } from '../../types/meeting';
import { getMeetings } from '../../utils/storage';
import { router } from 'expo-router';
import { Mic, Clock, ChevronRight, Calendar, Users, Share2, ChartBar as Chart } from 'lucide-react-native';

export default function DashboardScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalDuration: 0,
    averageDuration: 0,
    mostUsedTags: [] as string[],
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const loadedMeetings = await getMeetings();
      setMeetings(loadedMeetings);
      calculateStats(loadedMeetings);
    } catch (error) {
      console.error('Toplantılar yüklenemedi:', error);
    }
  }

  function calculateStats(meetings: Meeting[]) {
    const totalMeetings = meetings.length;
    const totalDuration = meetings.reduce((sum, meeting) => sum + meeting.duration, 0);
    const averageDuration = totalMeetings > 0 ? totalDuration / totalMeetings : 0;

    const tagCounts = new Map<string, number>();
    meetings.forEach(meeting => {
      meeting.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const mostUsedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    setStats({
      totalMeetings,
      totalDuration,
      averageDuration,
      mostUsedTags,
    });
  }

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}d` : `${mins}d`;
  }

  const recentMeetings = meetings
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
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

      <View style={styles.dashboardGrid}>
        <View style={[styles.dashboardCard, styles.cardPrimary]}>
          <View style={styles.cardIcon}>
            <Calendar size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.cardValue}>{stats.totalMeetings}</Text>
          <Text style={styles.cardLabel}>Toplam Toplantı</Text>
        </View>

        <View style={[styles.dashboardCard, styles.cardSuccess]}>
          <View style={styles.cardIcon}>
            <Clock size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.cardValue}>
            {formatDuration(Math.floor(stats.averageDuration))}
          </Text>
          <Text style={styles.cardLabel}>Ortalama Süre</Text>
        </View>

        <View style={[styles.dashboardCard, styles.cardWarning]}>
          <View style={styles.cardIcon}>
            <Users size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.cardValue}>12</Text>
          <Text style={styles.cardLabel}>Aktif Katılımcı</Text>
        </View>

        <View style={[styles.dashboardCard, styles.cardInfo]}>
          <View style={styles.cardIcon}>
            <Share2 size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.cardValue}>8</Text>
          <Text style={styles.cardLabel}>Paylaşılan Rapor</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/record')}
        >
          <View style={styles.actionContent}>
            <View style={styles.actionIcon}>
              <Mic size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Yeni Toplantı Kaydet</Text>
              <Text style={styles.actionDescription}>
                Toplantınızı kaydedin ve özetleyin
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#8E8E93" />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Toplantılar</Text>
            <TouchableOpacity onPress={() => router.push('/meetings')}>
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

              {meeting.tags && meeting.tags.length > 0 && (
                <View style={styles.tagContainer}>
                  {meeting.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {meeting.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{meeting.tags.length - 3}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    position: 'relative',
    marginBottom: 16,
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerContent: {
    padding: 24,
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    marginBottom: 16,
  },
  dashboardCard: {
    width: '50%',
    padding: 8,
  },
  cardPrimary: {
    backgroundColor: '#007AFF',
  },
  cardSuccess: {
    backgroundColor: '#34C759',
  },
  cardWarning: {
    backgroundColor: '#FF9500',
  },
  cardInfo: {
    backgroundColor: '#5856D6',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
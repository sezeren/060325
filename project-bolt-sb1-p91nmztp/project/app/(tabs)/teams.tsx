import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Team, TeamMember } from '../../types/team';
import { getTeams, saveTeam, updateTeam, deleteTeam } from '../../utils/storage';
import { Users, Plus, X, Save, Trash2, UserPlus, Settings, ChevronRight } from 'lucide-react-native';

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const loadedTeams = await getTeams();
      setTeams(loadedTeams);
    } catch (error) {
      console.error('Ekipler yüklenemedi:', error);
    }
  }

  async function handleAddTeam() {
    if (!newTeam.name.trim()) {
      Alert.alert('Hata', 'Ekip adı boş olamaz.');
      return;
    }

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name.trim(),
      description: newTeam.description.trim(),
      members: [{
        id: 'current-user',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        role: 'admin'
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveTeam(team);
      setNewTeam({ name: '', description: '' });
      setIsAddModalVisible(false);
      loadTeams();
    } catch (error) {
      console.error('Ekip eklenemedi:', error);
      Alert.alert('Hata', 'Ekip eklenirken bir hata oluştu.');
    }
  }

  async function handleDeleteTeam(teamId: string) {
    Alert.alert(
      'Ekibi Sil',
      'Bu ekibi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTeam(teamId);
              loadTeams();
            } catch (error) {
              console.error('Ekip silinemedi:', error);
              Alert.alert('Hata', 'Ekip silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ekipler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: team }) => (
          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={styles.teamInfo}>
                <Users size={24} color="#007AFF" />
                <View style={styles.teamTextContainer}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.memberCount}>
                    {team.members.length} Üye
                  </Text>
                </View>
              </View>
              <View style={styles.teamActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Üye Ekle', 'Bu özellik yakında eklenecek.')}
                >
                  <UserPlus size={20} color="#34C759" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Ayarlar', 'Bu özellik yakında eklenecek.')}
                >
                  <Settings size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteTeam(team.id)}
                >
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            {team.description && (
              <Text style={styles.teamDescription}>{team.description}</Text>
            )}

            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>Üyeler</Text>
              {team.members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitials}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.memberRole,
                    member.role === 'admin' && styles.adminRole
                  ]}>
                    {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.sharedMeetingsButton}>
              <Text style={styles.sharedMeetingsText}>Paylaşılan Toplantılar</Text>
              <ChevronRight size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={48} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Henüz ekip yok</Text>
            <Text style={styles.emptyText}>
              Toplantılarınızı paylaşmak için ekipler oluşturun
            </Text>
          </View>
        }
      />

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Ekip</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewTeam({ name: '', description: '' });
                }}
              >
                <X size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ekip Adı"
              value={newTeam.name}
              onChangeText={(text) => setNewTeam({ ...newTeam, name: text })}
              placeholderTextColor="#8E8E93"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              value={newTeam.description}
              onChangeText={(text) => setNewTeam({ ...newTeam, description: text })}
              multiline
              numberOfLines={3}
              placeholderTextColor="#8E8E93"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddTeam}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Ekip Oluştur</Text>
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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  teamCard: {
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
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamTextContainer: {
    marginLeft: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  memberCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  teamActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  teamDescription: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 16,
  },
  membersSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 16,
    color: '#000000',
  },
  memberEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  memberRole: {
    fontSize: 14,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminRole: {
    color: '#007AFF',
    backgroundColor: '#E3F2FF',
  },
  sharedMeetingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  sharedMeetingsText: {
    fontSize: 16,
    color: '#007AFF',
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
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
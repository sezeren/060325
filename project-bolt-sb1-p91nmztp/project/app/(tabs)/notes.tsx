import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { Note } from '../../types/note';
import { getNotes, saveNote, deleteNote, updateNote } from '../../utils/storage';
import { Plus, Tag, Clock, Trash2, CreditCard as Edit3, X, Save, Search } from 'lucide-react-native';

const NOTE_COLORS = [
  '#FFE0E0', // Açık Kırmızı
  '#FFE8D6', // Açık Turuncu
  '#FFF4D6', // Açık Sarı
  '#E0FFE0', // Açık Yeşil
  '#E0F0FF', // Açık Mavi
  '#F0E0FF', // Açık Mor
];

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const loadedNotes = await getNotes();
      setNotes(loadedNotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Notlar yüklenemedi:', error);
    }
  }

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  async function handleAddNote() {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert('Hata', 'Başlık ve içerik alanları boş bırakılamaz.');
      return;
    }

    const tags = newNoteTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      tags,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveNote(newNote);
      setIsAddingNote(false);
      resetForm();
      loadNotes();
    } catch (error) {
      console.error('Not eklenemedi:', error);
      Alert.alert('Hata', 'Not eklenirken bir hata oluştu.');
    }
  }

  function resetForm() {
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
    setSelectedColor(NOTE_COLORS[0]);
  }

  async function handleDeleteNote(id: string) {
    Alert.alert(
      'Notu Sil',
      'Bu notu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(id);
              loadNotes();
            } catch (error) {
              console.error('Not silinemedi:', error);
            }
          }
        }
      ]
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notlarım</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddingNote(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Notlarda ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredNotes.map((note) => (
          <View 
            key={note.id} 
            style={[styles.noteCard, { backgroundColor: note.color || NOTE_COLORS[0] }]}
          >
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <View style={styles.noteActions}>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingNote(note.id);
                    setNewNoteTitle(note.title);
                    setNewNoteContent(note.content);
                    setNewNoteTags(note.tags.join(', '));
                    setSelectedColor(note.color || NOTE_COLORS[0]);
                  }}
                  style={styles.actionButton}
                >
                  <Edit3 size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteNote(note.id)}
                  style={styles.actionButton}
                >
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.noteContent}>{note.content}</Text>
            
            {note.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {note.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Tag size={14} color="#007AFF" />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.noteFooter}>
              <Clock size={14} color="#8E8E93" />
              <Text style={styles.noteDate}>
                {formatDate(note.updatedAt)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={isAddingNote || isEditingNote !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditingNote !== null ? 'Notu Düzenle' : 'Yeni Not'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAddingNote(false);
                  setIsEditingNote(null);
                  resetForm();
                }}
              >
                <X size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Başlık"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              placeholderTextColor="#8E8E93"
            />

            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Not içeriği"
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              placeholderTextColor="#8E8E93"
            />

            <TextInput
              style={styles.input}
              placeholder="Etiketler (virgülle ayırın)"
              value={newNoteTags}
              onChangeText={setNewNoteTags}
              placeholderTextColor="#8E8E93"
            />

            <View style={styles.colorPicker}>
              <Text style={styles.colorPickerTitle}>Not Rengi</Text>
              <View style={styles.colorGrid}>
                {NOTE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddNote}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isEditingNote !== null ? 'Güncelle' : 'Kaydet'}
              </Text>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
    height: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noteCard: {
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
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
  contentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  colorPicker: {
    marginVertical: 16,
  },
  colorPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
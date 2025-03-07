import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, CreditCard as Edit2, Trash2, X, Save, Tag as TagIcon } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  color: string;
  description: string;
  meetingCount: number;
}

const COLORS = [
  '#007AFF', // Mavi
  '#34C759', // Yeşil
  '#FF9500', // Turuncu
  '#FF3B30', // Kırmızı
  '#5856D6', // Mor
  '#FF2D55', // Pembe
  '#AF52DE', // Eflatun
  '#000000', // Siyah
];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: COLORS[0],
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const savedCategories = await AsyncStorage.getItem('categories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  }

  async function saveCategories(updatedCategories: Category[]) {
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Kategoriler kaydedilemedi:', error);
    }
  }

  function handleAddCategory() {
    if (!newCategory.name.trim()) {
      Alert.alert('Hata', 'Kategori adı boş olamaz.');
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      color: newCategory.color,
      description: newCategory.description.trim(),
      meetingCount: 0,
    };

    saveCategories([...categories, category]);
    setNewCategory({ name: '', color: COLORS[0], description: '' });
    setIsAddModalVisible(false);
  }

  function handleEditCategory() {
    if (!selectedCategory || !selectedCategory.name.trim()) {
      Alert.alert('Hata', 'Kategori adı boş olamaz.');
      return;
    }

    const updatedCategories = categories.map(cat =>
      cat.id === selectedCategory.id ? selectedCategory : cat
    );

    saveCategories(updatedCategories);
    setSelectedCategory(null);
    setIsEditModalVisible(false);
  }

  function handleDeleteCategory(category: Category) {
    Alert.alert(
      'Kategoriyi Sil',
      'Bu kategoriyi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const updatedCategories = categories.filter(cat => cat.id !== category.id);
            saveCategories(updatedCategories);
          },
        },
      ]
    );
  }

  function renderColorPicker(selectedColor: string, onSelect: (color: string) => void) {
    return (
      <View style={styles.colorPicker}>
        <Text style={styles.colorPickerTitle}>Renk Seç</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => onSelect(color)}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kategoriler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleContainer}>
                <TagIcon size={20} color={item.color} />
                <Text style={[styles.categoryName, { color: item.color }]}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedCategory(item);
                    setIsEditModalVisible(true);
                  }}
                >
                  <Edit2 size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteCategory(item)}
                >
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
            {item.description && (
              <Text style={styles.categoryDescription}>{item.description}</Text>
            )}
            <Text style={styles.meetingCount}>
              {item.meetingCount} Toplantı
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <TagIcon size={48} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Henüz kategori yok</Text>
            <Text style={styles.emptyText}>
              Toplantılarınızı düzenlemek için kategoriler oluşturun
            </Text>
          </View>
        }
      />

      {/* Yeni Kategori Modalı */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Kategori</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewCategory({ name: '', color: COLORS[0], description: '' });
                }}
              >
                <X size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Kategori Adı"
              value={newCategory.name}
              onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
              placeholderTextColor="#8E8E93"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              value={newCategory.description}
              onChangeText={(text) => setNewCategory({ ...newCategory, description: text })}
              multiline
              numberOfLines={3}
              placeholderTextColor="#8E8E93"
            />

            {renderColorPicker(newCategory.color, (color) =>
              setNewCategory({ ...newCategory, color })
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddCategory}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Düzenleme Modalı */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategoriyi Düzenle</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditModalVisible(false);
                  setSelectedCategory(null);
                }}
              >
                <X size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Kategori Adı"
              value={selectedCategory?.name}
              onChangeText={(text) =>
                setSelectedCategory(prev => prev ? { ...prev, name: text } : null)
              }
              placeholderTextColor="#8E8E93"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              value={selectedCategory?.description}
              onChangeText={(text) =>
                setSelectedCategory(prev => prev ? { ...prev, description: text } : null)
              }
              multiline
              numberOfLines={3}
              placeholderTextColor="#8E8E93"
            />

            {selectedCategory && renderColorPicker(selectedCategory.color, (color) =>
              setSelectedCategory(prev => prev ? { ...prev, color } : null)
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleEditCategory}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Güncelle</Text>
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
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 8,
  },
  meetingCount: {
    fontSize: 14,
    color: '#8E8E93',
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
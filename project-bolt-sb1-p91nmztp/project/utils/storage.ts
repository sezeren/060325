import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meeting } from '../types/meeting';
import { Note } from '../types/note';
import { Team, SharedMeeting } from '../types/team';

const MEETINGS_KEY = '@meetings';
const NOTES_KEY = '@notes';
const TEAMS_KEY = '@teams';
const SHARED_MEETINGS_KEY = '@shared_meetings';

export async function saveMeeting(meeting: Meeting): Promise<void> {
  try {
    const existingMeetingsJson = await AsyncStorage.getItem(MEETINGS_KEY);
    const existingMeetings: Meeting[] = existingMeetingsJson ? JSON.parse(existingMeetingsJson) : [];
    
    const updatedMeetings = [...existingMeetings, meeting];
    await AsyncStorage.setItem(MEETINGS_KEY, JSON.stringify(updatedMeetings));
  } catch (error) {
    console.error('Toplantı kaydedilemedi:', error);
    throw error;
  }
}

export async function getMeetings(): Promise<Meeting[]> {
  try {
    const meetingsJson = await AsyncStorage.getItem(MEETINGS_KEY);
    return meetingsJson ? JSON.parse(meetingsJson) : [];
  } catch (error) {
    console.error('Toplantılar yüklenemedi:', error);
    return []; // Hata durumunda boş dizi döndür
  }
}

export async function updateMeeting(updatedMeeting: Meeting): Promise<void> {
  try {
    const meetings = await getMeetings();
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === updatedMeeting.id ? updatedMeeting : meeting
    );
    await AsyncStorage.setItem(MEETINGS_KEY, JSON.stringify(updatedMeetings));
  } catch (error) {
    console.error('Toplantı güncellenemedi:', error);
    throw error;
  }
}

export async function deleteMeeting(id: string): Promise<void> {
  try {
    const meetings = await getMeetings();
    const updatedMeetings = meetings.filter(meeting => meeting.id !== id);
    await AsyncStorage.setItem(MEETINGS_KEY, JSON.stringify(updatedMeetings));
  } catch (error) {
    console.error('Toplantı silinemedi:', error);
    throw error;
  }
}

export async function saveNote(note: Note): Promise<void> {
  try {
    const existingNotesJson = await AsyncStorage.getItem(NOTES_KEY);
    const existingNotes: Note[] = existingNotesJson ? JSON.parse(existingNotesJson) : [];
    
    const updatedNotes = [...existingNotes, note];
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Not kaydedilemedi:', error);
    throw error;
  }
}

export async function getNotes(): Promise<Note[]> {
  try {
    const notesJson = await AsyncStorage.getItem(NOTES_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Notlar yüklenemedi:', error);
    return []; // Hata durumunda boş dizi döndür
  }
}

export async function updateNote(updatedNote: Note): Promise<void> {
  try {
    const notes = await getNotes();
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Not güncellenemedi:', error);
    throw error;
  }
}

export async function deleteNote(id: string): Promise<void> {
  try {
    const notes = await getNotes();
    const updatedNotes = notes.filter(note => note.id !== id);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Not silinemedi:', error);
    throw error;
  }
}

export async function getTeams(): Promise<Team[]> {
  try {
    const teamsJson = await AsyncStorage.getItem(TEAMS_KEY);
    return teamsJson ? JSON.parse(teamsJson) : [];
  } catch (error) {
    console.error('Ekipler yüklenemedi:', error);
    return []; // Hata durumunda boş dizi döndür
  }
}

export async function saveTeam(team: Team): Promise<void> {
  try {
    const teams = await getTeams();
    const updatedTeams = [...teams, team];
    await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(updatedTeams));
  } catch (error) {
    console.error('Ekip kaydedilemedi:', error);
    throw error;
  }
}

export async function updateTeam(updatedTeam: Team): Promise<void> {
  try {
    const teams = await getTeams();
    const updatedTeams = teams.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    );
    await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(updatedTeams));
  } catch (error) {
    console.error('Ekip güncellenemedi:', error);
    throw error;
  }
}

export async function deleteTeam(id: string): Promise<void> {
  try {
    const teams = await getTeams();
    const updatedTeams = teams.filter(team => team.id !== id);
    await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(updatedTeams));
  } catch (error) {
    console.error('Ekip silinemedi:', error);
    throw error;
  }
}

export async function getSharedMeetings(): Promise<SharedMeeting[]> {
  try {
    const sharedMeetingsJson = await AsyncStorage.getItem(SHARED_MEETINGS_KEY);
    return sharedMeetingsJson ? JSON.parse(sharedMeetingsJson) : [];
  } catch (error) {
    console.error('Paylaşılan toplantılar yüklenemedi:', error);
    return []; // Hata durumunda boş dizi döndür
  }
}

export async function shareMeeting(sharedMeeting: SharedMeeting): Promise<void> {
  try {
    const sharedMeetings = await getSharedMeetings();
    const updatedSharedMeetings = [...sharedMeetings, sharedMeeting];
    await AsyncStorage.setItem(SHARED_MEETINGS_KEY, JSON.stringify(updatedSharedMeetings));
  } catch (error) {
    console.error('Toplantı paylaşılamadı:', error);
    throw error;
  }
}

export async function updateSharedMeeting(updatedSharing: SharedMeeting): Promise<void> {
  try {
    const sharedMeetings = await getSharedMeetings();
    const updatedSharedMeetings = sharedMeetings.map(sharing => 
      sharing.meetingId === updatedSharing.meetingId && sharing.teamId === updatedSharing.teamId
        ? updatedSharing
        : sharing
    );
    await AsyncStorage.setItem(SHARED_MEETINGS_KEY, JSON.stringify(updatedSharedMeetings));
  } catch (error) {
    console.error('Paylaşım güncellenemedi:', error);
    throw error;
  }
}

export async function removeSharedMeeting(meetingId: string, teamId: string): Promise<void> {
  try {
    const sharedMeetings = await getSharedMeetings();
    const updatedSharedMeetings = sharedMeetings.filter(sharing => 
      !(sharing.meetingId === meetingId && sharing.teamId === teamId)
    );
    await AsyncStorage.setItem(SHARED_MEETINGS_KEY, JSON.stringify(updatedSharedMeetings));
  } catch (error) {
    console.error('Paylaşım kaldırılamadı:', error);
    throw error;
  }
}
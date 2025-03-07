export interface Note {
  id: string;
  meetingId?: string;
  title: string;
  content: string;
  tags: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}
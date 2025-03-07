import { AudioStats } from '../utils/webAudio';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  transcript: string;
  summary: string;
  tags?: string[];
  notes?: string[];
  audioUri?: string;
  audioStats?: AudioStats;
}
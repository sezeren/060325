export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedMeeting {
  meetingId: string;
  teamId: string;
  sharedBy: string;
  sharedAt: string;
  accessLevel: 'view' | 'edit' | 'full';
}
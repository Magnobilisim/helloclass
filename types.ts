
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum GradeLevel {
  PRIMARY = 'PRIMARY', // 1-4
  MIDDLE = 'MIDDLE',   // 5-8
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gradeLevel: GradeLevel;
  subscriptionTier: SubscriptionTier;
  schoolName: string;
  freeTestsUsed: number;
  testsCompleted: number; // Added for stats
  points: number;
  avatar: string;
  notificationPreferences: string[]; 
}

export interface School {
  id: string;
  name: string;
  isPremium: boolean;
}

export interface ExamTopic {
  id: string;
  name: string;
  category: string;
  isPopular: boolean;
  isPremium: boolean;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string; // Added support for image questions
  options: string[];
  correctIndex: number;
  explanation?: string;
  topic?: string;     // Added: Main topic (e.g. "Matematik")
  subTopic?: string;  // Added: Specific sub-topic (e.g. "Kesirler")
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: number;
}

export interface Report {
  id: string;
  userId: string; // Who reported
  reason: string;
  timestamp: number;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userSchool: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  likedBy: string[]; 
  dislikes: number; // Added
  dislikedBy: string[]; // Added
  comments: Comment[]; 
  reports: Report[]; // Added for moderation
  timestamp: number;
  relatedContext?: string; 
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export type Language = 'TR' | 'EN';


export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

// Subject is now a string ID
export type Subject = string;

export type Language = 'tr' | 'en';

export interface School {
  id: string;
  name: string;
  city?: string;
  createdAt: string; // ISO Date
  updatedAt?: string; // ISO Date
  isDeleted?: boolean; // Soft Delete
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  points: number;
  inventory: string[];
  activeFrame?: string;
  purchasedExamIds: string[];
  classLevel?: number;
  englishLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  isBanned?: boolean;
  schoolId?: string;
  branch?: string;
  bio?: string;
  followers?: string[];
  following?: string[];
  notificationSettings?: {
    email: boolean;
    app: boolean;
  };
  createdAt?: string; // Audit
  updatedAt?: string; // Audit
  isDeleted?: boolean; // Soft Delete
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  totalReferralPoints?: number;
  totalPointsPurchased?: number;
  lifetimeExamPoints?: number;
  lifetimeAdPoints?: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  optionImages?: string[];
  correctIndex: number;
  imageUrl?: string;
  explanation?: string;
  explanationImage?: string;
}

export interface Exam {
  id: string;
  title: string;
  topic?: string;
  creatorId: string;
  creatorName: string;
  subjectId: string; // Changed from subject name to ID
  difficulty: 'Easy' | 'Medium' | 'Hard';
  classLevel?: number;
  englishLevel?: string;
  questions: Question[];
  price: number;
  timeLimit: number;
  sales: number;
  rating?: number;
  isPublished: boolean;
  isAI?: boolean;
  createdAt?: string; // Audit
  updatedAt?: string; // Audit
  isDeleted?: boolean; // Soft Delete
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  date: string;
  rewardsEarned: number;
  answers: number[];
  learningReport?: LearningReport;
  learningReportStatus?: 'pending' | 'ready' | 'failed';
}

export interface Transaction {
  id: string;
  examId: string;
  teacherId: string;
  studentId: string;
  amount: number; // The price at the moment of purchase
  timestamp: string;
}

export interface ExamSession {
  examId: string;
  studentId: string;
  startedAt: string; // ISO String for DB (Strict)
  status: 'started' | 'completed';
}

export interface LearningReport {
  summary: string;
  outcomes: string[];
  focusAreas: string[];
  generatedAt: string;
}

export enum ReportReason {
  SPAM = 'Spam',
  HARASSMENT = 'Harassment',
  INAPPROPRIATE = 'Inappropriate Content',
  MISINFORMATION = 'Misinformation',
  OTHER = 'Other'
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  timestamp: string;
  comments: Comment[];
  isReported?: boolean;
  reportReason?: ReportReason;
  tags?: string[]; // Can contain Subject IDs
  schoolId?: string;
  createdAt?: string; // Audit
  updatedAt?: string; // Audit
  isDeleted?: boolean; // Soft Delete
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  createdAt?: string; // Audit
  updatedAt?: string; // Audit
  isDeleted?: boolean; // Soft Delete
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'AVATAR_FRAME' | 'JOKER_5050' | 'JOKER_SKIP';
  price: number;
  icon: string;
  description: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'info' | 'warning' | 'danger';
}

export interface SystemSettings {
  commissionRate: number;
  maintenanceMode: boolean;
  pointConversionRate: number;
  studentTerms: string;
  teacherTerms: string;
  adRewardPoints: number;
  referralRewardPoints: number;
  pointPackages: PointPackage[];
  aiWizardCost: number;
  aiExplainCost: number;
  joker5050Cost: number;
}

export interface PointPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  description?: string;
}

export interface PointPurchase {
  id: string;
  userId: string;
  packageId: string;
  points: number;
  price: number;
  timestamp: string;
}

export interface Payout {
  id: string;
  teacherId: string;
  amountTL: number;
  date: string;
  adminId: string;
}

export interface TopicMetadata {
  name: string;
  grade?: number;
  level?: string;
}

export interface SubjectDef {
  id: string;
  name: string;
  grades: number[];
}

export interface PrizeExam {
  id: string;
  examId: string;
  grade: number;
  prizeTitle: string;
  prizeImage: string;
  prizeDescription: string;
  entryFee: number;
  month: string;
  isActive: boolean;
  winnerId?: string;
  winnerName?: string;
  drawDate?: string;
  createdAt?: string;
  participants?: string[]; // Array of User IDs who paid entry fee
}

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface StoreContextType {
  // Data
  user: User | null;
  users: User[];
  exams: Exam[];
  posts: Post[];
  results: ExamResult[];
  messages: Message[];
  language: Language;
  systemSettings: SystemSettings;
  logs: ActivityLog[];
  approvedTopics: Record<string, TopicMetadata[]>; // Key is Subject ID now
  schools: School[];
  notifications: Notification[];
  availableSubjects: SubjectDef[];
  shopItems: ShopItem[];
  payouts: Payout[];
  prizeExams: PrizeExam[];
  transactions: Transaction[]; 
  examSessions: Record<string, ExamSession>; 
  pointPurchases: PointPurchase[];
  
  // Auth
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  register: (user: User, options?: { referralCode?: string }) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;
  changeRole: (userId: string, newRole: UserRole) => void;
  banUser: (userId: string) => void;
  resetPassword: (email: string, newPass: string) => boolean;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;

  // Features
  addExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  purchaseExam: (examId: string) => boolean;
  purchaseItem: (item: ShopItem) => boolean;
  toggleEquip: (itemType: string) => void;
  startExamSession: (examId: string) => void; 
  saveResult: (examId: string, answers: number[]) => void; 
  addPost: (content: string, tags?: string[], schoolId?: string, imageUrl?: string) => Promise<{success: boolean, reason?: string}>;
  deletePost: (postId: string) => void;
  toggleLike: (postId: string) => void;
  toggleDislike: (postId: string) => void;
  addComment: (postId: string, text: string) => Promise<void>;
  reportPost: (postId: string, reason: string) => void;
  dismissReport: (postId: string) => void;
  sendMessage: (receiverId: string, content: string) => void;
  markMessageRead: (senderId: string) => void;
  updateSystemSettings: (settings: SystemSettings) => void;
  addTopic: (subjectId: string, topic: string, grade?: number, level?: string) => void;
  removeTopic: (subjectId: string, topic: string) => void;
  addSchool: (name: string) => void;
  removeSchool: (id: string) => void;
  markNotificationRead: (id: string) => void;
  addSubject: (name: string, grades: number[]) => void;
  removeSubject: (id: string) => void;
  toggleFollow: (targetUserId: string) => void;
  
  // Admin New Features
  addShopItem: (item: ShopItem) => void;
  deleteShopItem: (id: string) => void;
  sendBroadcast: (title: string, message: string, targetRole: UserRole | 'ALL') => void;
  adjustUserPoints: (userId: string, amount: number) => void;
  processPayout: (teacherId: string, amountTL: number) => void;
  deleteExamImage: (examId: string, questionId: string, type: 'question' | 'option' | 'explanation', optionIndex?: number) => void;
  watchAdForPoints: () => void;
  purchasePointPackage: (packageId: string) => boolean;
  
  // Prize Exam Features
  addPrizeExam: (exam: PrizeExam) => void;
  drawPrizeWinner: (prizeExamId: string) => void;
  payEntryFee: (prizeExamId: string, amount: number) => boolean;

  // Utils
  alert: { message: string; type: AlertType } | null;
  showAlert: (message: string, type: AlertType) => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string; 
}

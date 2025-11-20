
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GradeLevel, Language, SubscriptionTier, User, UserRole, ThemeColors, Question, SocialPost, Message, Notification, School, ExamTopic, Comment, Report } from './types';
import { generateQuizQuestions } from './services/geminiService';

// --- Theme Logic ---
const PrimaryTheme: ThemeColors = {
  primary: '#F59E0B', // Warm Amber (Updated from Neon Gold)
  secondary: '#32CD32', // Lime Green
  background: '#FFFDD0', // Cream
  text: '#4B5563',
  accent: '#FFA500',
};

const MiddleTheme: ThemeColors = {
  primary: '#4682B4', // Steel Blue
  secondary: '#8A2BE2', // Blue Violet
  background: '#F3F4F6', // Light Gray/Lavender-ish
  text: '#1F2937',
  accent: '#60A5FA',
};

// --- Mock Data (Used only if storage is empty) ---
const INITIAL_USERS: User[] = [
  {
    id: 'u123',
    name: 'Ali Yılmaz',
    email: 'student@test.com',
    role: UserRole.STUDENT,
    gradeLevel: GradeLevel.PRIMARY,
    subscriptionTier: SubscriptionTier.FREE,
    schoolName: 'Atatürk İlköğretim',
    freeTestsUsed: 0,
    testsCompleted: 12,
    points: 1250,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
    notificationPreferences: ['mentions', 'school_updates', 'exam_tips']
  },
  {
    id: 'u999',
    name: 'Zeynep Kaya',
    email: 'zeynep@test.com',
    role: UserRole.STUDENT,
    gradeLevel: GradeLevel.PRIMARY,
    subscriptionTier: SubscriptionTier.PREMIUM,
    schoolName: 'Cumhuriyet Koleji',
    freeTestsUsed: 0,
    testsCompleted: 45,
    points: 3000,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep',
    notificationPreferences: ['mentions']
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@helloclass.com',
    role: UserRole.ADMIN,
    gradeLevel: GradeLevel.MIDDLE,
    subscriptionTier: SubscriptionTier.PREMIUM,
    schoolName: 'HelloClass HQ',
    freeTestsUsed: 0,
    testsCompleted: 0,
    points: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    notificationPreferences: []
  }
];

const INITIAL_SCHOOLS: School[] = [
    { id: 's1', name: 'Atatürk İlköğretim', isPremium: false },
    { id: 's2', name: 'Cumhuriyet Koleji', isPremium: true }, 
    { id: 's3', name: 'ODTÜ Geliştirme Vakfı', isPremium: true },
    { id: 's4', name: 'Bilfen Koleji', isPremium: false },
];

const INITIAL_EXAM_TOPICS: ExamTopic[] = [
    { id: 'et1', name: '3. Sınıf Matematik', category: 'Primary', isPopular: true, isPremium: false },
    { id: 'et2', name: '5. Sınıf Fen Bilgisi', category: 'Middle', isPopular: true, isPremium: false },
    { id: 'et3', name: 'LGS Hazırlık', category: 'Exam', isPopular: true, isPremium: true },
    { id: 'et4', name: 'YKS Matematik', category: 'Exam', isPopular: false, isPremium: true },
    { id: 'et5', name: 'TOEFL Reading', category: 'Language', isPopular: true, isPremium: true }, 
    { id: 'et6', name: 'İş Güvenliği Uzmanlığı (C Sınıfı)', category: 'Professional', isPopular: false, isPremium: false },
    { id: 'et7', name: 'Ehliyet Sınavı', category: 'Professional', isPopular: true, isPremium: false },
    { id: 'et8', name: 'Test Sınavı', category: 'Demo', isPopular: true, isPremium: false },
];

const INITIAL_POSTS: SocialPost[] = [
  { 
    id: 'p1', 
    userId: 'u999', 
    userName: 'Zeynep Kaya', 
    userSchool: 'Cumhuriyet Koleji', 
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep', 
    content: 'Matematik sınavı çok zordu! 😅', 
    likes: 12, 
    likedBy: ['u123'],
    dislikes: 0,
    dislikedBy: [],
    comments: [
        { id: 'c1', userId: 'u888', userName: 'Mehmet T.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet', content: 'Aynen, 5. soru neydi öyle?', timestamp: Date.now() - 50000 }
    ],
    reports: [],
    timestamp: Date.now() - 100000, 
    relatedContext: '3. Sınıf Matematik' 
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u123', title: 'Hoşgeldin!', message: 'HelloClass ailesine katıldığın için teşekkürler.', type: 'success', read: false, timestamp: Date.now() },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u999', senderName: 'Zeynep Kaya', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep', receiverId: 'u123', content: 'Selam Ali! Sınav notların nasıl?', timestamp: Date.now() - 50000, read: false }
];

// Added 10 fixed questions for "Test Sınavı" > "Sabit Konu"
const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q_init_1',
    text: 'Aşağıdakilerden hangisi bir doğal sayıdır?',
    options: ['-5', '0.5', '10', '√2'],
    correctIndex: 2,
    explanation: '10 bir doğal sayıdır.',
    topic: '3. Sınıf Matematik',
    subTopic: 'Doğal Sayılar'
  },
  {
    id: 'q_init_2',
    text: 'Hangisi tek sayıdır?',
    options: ['2', '4', '7', '10'],
    correctIndex: 2,
    explanation: '7 bir tek sayıdır.',
    topic: '3. Sınıf Matematik',
    subTopic: 'Tek ve Çift Sayılar'
  },
  // --- Fixed Test Questions (10 Count) ---
  { id: 'ft1', text: 'Sabit Soru 1: Türkiye\'nin başkenti?', options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], correctIndex: 1, explanation: 'Başkent Ankara\'dır.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft2', text: 'Sabit Soru 2: 5 x 5?', options: ['10', '20', '25', '30'], correctIndex: 2, explanation: '25.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft3', text: 'Sabit Soru 3: İngilizce "Elma"?', options: ['Pear', 'Apple', 'Banana', 'Grape'], correctIndex: 1, explanation: 'Apple.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft4', text: 'Sabit Soru 4: H2O nedir?', options: ['Hava', 'Toprak', 'Ateş', 'Su'], correctIndex: 3, explanation: 'Su.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft5', text: 'Sabit Soru 5: En büyük gezegen?', options: ['Mars', 'Jüpiter', 'Dünya', 'Venüs'], correctIndex: 1, explanation: 'Jüpiter.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft6', text: 'Sabit Soru 6: Bir yıl kaç gündür?', options: ['360', '364', '365', '366'], correctIndex: 2, explanation: '365 gün 6 saat.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft7', text: 'Sabit Soru 7: Cumhuriyet ne zaman ilan edildi?', options: ['1920', '1923', '1919', '1938'], correctIndex: 1, explanation: '1923.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft8', text: 'Sabit Soru 8: "Kırmızı"nın zıt rengi?', options: ['Mavi', 'Sarı', 'Yeşil', 'Mor'], correctIndex: 2, explanation: 'Tamamlayıcı renk Yeşildir.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft9', text: 'Sabit Soru 9: HTML açılımı?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correctIndex: 0, explanation: 'Hyper Text Markup Language.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
  { id: 'ft10', text: 'Sabit Soru 10: İnsan vücudundaki en büyük organ?', options: ['Kalp', 'Karaciğer', 'Deri', 'Akciğer'], correctIndex: 2, explanation: 'Deridir.', topic: 'Test Sınavı', subTopic: 'Sabit Konu' },
];

const FALLBACK_QUESTIONS: Question[] = [
    { id: 'fb1', text: 'Yapay zeka şu an yoğun, ancak genel bir soru: 3 + 3?', options: ['5', '6', '7', '8'], correctIndex: 1, explanation: '3+3=6', topic: 'Genel', subTopic: 'Genel' },
    { id: 'fb2', text: 'Türkiye\'nin en büyük gölü?', options: ['Tuz Gölü', 'Van Gölü', 'Beyşehir', 'Eğirdir'], correctIndex: 1, explanation: 'Van Gölü.', topic: 'Genel', subTopic: 'Genel' },
    { id: 'fb3', text: 'İngilizce "Kedi" ne demek?', options: ['Dog', 'Bird', 'Cat', 'Fish'], correctIndex: 2, explanation: 'Cat.', topic: 'Genel', subTopic: 'Genel' },
    { id: 'fb4', text: 'Hangi renk ana renktir?', options: ['Mor', 'Turuncu', 'Mavi', 'Yeşil'], correctIndex: 2, explanation: 'Mavi ana renktir.', topic: 'Genel', subTopic: 'Genel' },
    { id: 'fb5', text: '1 saat kaç dakikadır?', options: ['100', '60', '50', '24'], correctIndex: 1, explanation: '60 dakika.', topic: 'Genel', subTopic: 'Genel' },
];

interface AppContextType {
  user: User | null;
  allUsers: User[];
  allQuestions: Question[];
  allSchools: School[];
  allExamTopics: ExamTopic[];
  posts: SocialPost[];
  notifications: Notification[];
  messages: Message[];
  theme: ThemeColors;
  language: Language;
  gradeLevel: GradeLevel; 
  specificClass: number; 
  
  setLanguage: (lang: Language) => void;
  setGradeLevel: (level: GradeLevel) => void;
  setSpecificClass: (cls: number) => void;
  
  login: (email: string) => void;
  register: (name: string, email: string, schoolName: string) => void;
  loginWithSocial: (provider: 'google' | 'apple') => void;
  logout: () => void;
  
  upgradeToPremium: () => void;
  consumeFreeTest: () => void;
  completeTest: (score: number) => void; // Updates user stats
  addPoints: (pts: number) => void;
  updateUserProfile: (name: string, schoolName: string) => void;
  updateUserAvatar: (seed: string) => void;
  toggleNotificationPreference: (tagOrId: string) => void;
  shareAppAndGetReward: () => void; // Referral logic

  // Hybrid Fetch
  getHybridQuestions: (topic: string, subTopic: string, count: number) => Promise<Question[]>;

  // Social Actions
  addPost: (content: string, contextTag: string, imageUrl?: string) => void;
  deletePost: (postId: string) => void; // New
  reportPost: (postId: string, reason: string) => void; // New
  toggleLike: (postId: string) => void;
  toggleDislike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  sendMessage: (receiverId: string, content: string) => void;
  markNotificationsRead: () => void;

  // Admin Actions
  adminAddUser: (newUser: User) => void;
  adminDeleteUser: (userId: string) => void;
  adminUpdateUserTier: (userId: string, tier: SubscriptionTier) => void;
  adminAddQuestion: (q: Question) => void;
  adminDeleteQuestion: (id: string) => void;
  
  adminAddSchool: (name: string) => void;
  adminDeleteSchool: (id: string) => void;
  adminAddExamTopic: (name: string, category: string) => void;
  adminDeleteExamTopic: (id: string) => void;
  adminTogglePopularTopic: (id: string) => void;
  adminTogglePremiumMetadata: (id: string, type: 'school' | 'topic') => void;
  adminResolveReports: (postId: string, action: 'keep' | 'delete') => void; // New
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to load from storage
const loadFromStorage = <T,>(key: string, initial: T): T => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : initial;
    } catch (e) {
        return initial;
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage if available, else Initial Mock Data
  const [user, setUser] = useState<User | null>(() => loadFromStorage('activeUser', null));
  
  const [allUsers, setAllUsers] = useState<User[]>(() => loadFromStorage('allUsers', INITIAL_USERS));
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => loadFromStorage('allQuestions', INITIAL_QUESTIONS));
  const [allSchools, setAllSchools] = useState<School[]>(() => loadFromStorage('allSchools', INITIAL_SCHOOLS));
  const [allExamTopics, setAllExamTopics] = useState<ExamTopic[]>(() => loadFromStorage('allExamTopics', INITIAL_EXAM_TOPICS));
  
  const [posts, setPosts] = useState<SocialPost[]>(() => loadFromStorage('posts', INITIAL_POSTS));
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState<Message[]>(() => loadFromStorage('messages', INITIAL_MESSAGES));

  const [language, setLanguage] = useState<Language>('TR');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(GradeLevel.PRIMARY);
  const [specificClass, setSpecificClass] = useState<number>(1);

  const theme = gradeLevel === GradeLevel.PRIMARY ? PrimaryTheme : MiddleTheme;

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('activeUser', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('allUsers', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem('allQuestions', JSON.stringify(allQuestions)); }, [allQuestions]);
  useEffect(() => { localStorage.setItem('allSchools', JSON.stringify(allSchools)); }, [allSchools]);
  useEffect(() => { localStorage.setItem('allExamTopics', JSON.stringify(allExamTopics)); }, [allExamTopics]);
  useEffect(() => { localStorage.setItem('posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('messages', JSON.stringify(messages)); }, [messages]);


  useEffect(() => {
    if (user) {
      setGradeLevel(user.gradeLevel);
      if (user.gradeLevel === GradeLevel.MIDDLE && specificClass < 5) {
        setSpecificClass(5);
      }
    }
  }, [user, gradeLevel]);

  const login = (email: string) => {
    const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
    } else {
      alert('Kullanıcı bulunamadı!');
    }
  };

  const register = (name: string, email: string, schoolName: string) => {
    const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        alert('Bu e-posta adresi zaten kayıtlı.');
        return;
    }
    const newUser: User = {
        id: Date.now().toString(),
        name: name,
        email: email,
        role: UserRole.STUDENT,
        gradeLevel: GradeLevel.PRIMARY,
        subscriptionTier: SubscriptionTier.FREE,
        schoolName: schoolName || 'HelloClass Academy',
        freeTestsUsed: 0,
        testsCompleted: 0,
        points: 50,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ','')}`,
        notificationPreferences: ['mentions', 'school_updates']
    };
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
  };

  const loginWithSocial = (provider: 'google' | 'apple') => {
      const mockEmail = provider === 'google' ? 'googleuser@gmail.com' : 'appleuser@icloud.com';
      const mockName = provider === 'google' ? 'Google User' : 'Apple User';
      const mockId = provider === 'google' ? 'g_user_1' : 'a_user_1';
      let foundUser = allUsers.find(u => u.id === mockId);
      if (!foundUser) {
          foundUser = {
            id: mockId,
            name: mockName,
            email: mockEmail,
            role: UserRole.STUDENT,
            gradeLevel: GradeLevel.PRIMARY,
            subscriptionTier: SubscriptionTier.FREE,
            schoolName: 'Social High',
            freeTestsUsed: 0,
            testsCompleted: 0,
            points: 100,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
            notificationPreferences: ['mentions']
          };
          setAllUsers(prev => [...prev, foundUser!]);
      }
      setUser(foundUser);
  };

  const logout = () => setUser(null);

  const upgradeToPremium = () => {
    if (user) {
      const updated = { ...user, subscriptionTier: SubscriptionTier.PREMIUM };
      setUser(updated);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    }
  };

  const consumeFreeTest = () => {
    if (user && user.subscriptionTier === SubscriptionTier.FREE) {
      const updated = { ...user, freeTestsUsed: user.freeTestsUsed + 1 };
      setUser(updated);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    }
  };

  const completeTest = (score: number) => {
      if (user) {
          const updated = { 
              ...user, 
              testsCompleted: (user.testsCompleted || 0) + 1,
              points: user.points + (score * 10) 
          };
          setUser(updated);
          setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      }
  };

  const addPoints = (pts: number) => {
    if (user) {
      const updated = { ...user, points: user.points + pts };
      setUser(updated);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    }
  };

  const updateUserProfile = (name: string, schoolName: string) => {
    if (user) {
      const updated = { ...user, name, schoolName };
      setUser(updated);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    }
  };

  const updateUserAvatar = (seed: string) => {
    if (user) {
        const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        const updated = { ...user, avatar: newAvatarUrl };
        setUser(updated);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    }
  };

  const shareAppAndGetReward = () => {
      if (user && user.subscriptionTier === SubscriptionTier.FREE) {
          const updated = { ...user, subscriptionTier: SubscriptionTier.PREMIUM };
          setUser(updated);
          setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
          setNotifications(prev => [{
              id: Date.now().toString(),
              userId: user.id,
              title: 'Tebrikler! 🎁',
              message: 'Arkadaşını davet ettiğin için 1 Ay Premium kazandın!',
              type: 'success',
              read: false,
              timestamp: Date.now()
          }, ...prev]);
      } else {
          alert('Zaten Premium üyesin veya davet ödülü alındı.');
      }
  };

  const toggleNotificationPreference = (tagOrId: string) => {
      if (user) {
          const currentPrefs = user.notificationPreferences || [];
          const newPrefs = currentPrefs.includes(tagOrId) ? currentPrefs.filter(t => t !== tagOrId) : [...currentPrefs, tagOrId];
          const updated = { ...user, notificationPreferences: newPrefs };
          setUser(updated);
          setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      }
  };

  // Hybrid Question Fetch Logic
  const getHybridQuestions = async (topic: string, subTopic: string, count: number): Promise<Question[]> => {
      // 1. Check Local DB
      const dbQuestions = allQuestions.filter(q => {
          // Simple matching logic
          const topicMatch = q.topic?.toLowerCase().includes(topic.toLowerCase());
          const subMatch = subTopic && subTopic !== 'Genel Deneme Sınavı' && subTopic !== 'General Practice Exam' && subTopic !== 'Sabit Konu' ? q.subTopic?.toLowerCase().includes(subTopic.toLowerCase()) : true;
          
          // Exact match for 'Sabit Konu'
          if (subTopic === 'Sabit Konu') return topicMatch && q.subTopic === subTopic;

          return topicMatch && subMatch;
      });

      if (dbQuestions.length > 0) {
          // If we have questions in DB for this topic, use them
          // If count is less than available, slice. If more, just return what we have (locked in UI)
          return dbQuestions.slice(0, count);
      }

      // 2. Fetch remaining from AI
      const needed = count - dbQuestions.length;
      try {
          const aiQuestions = await generateQuizQuestions(topic, subTopic, needed, gradeLevel, specificClass, language);
          if (!aiQuestions || aiQuestions.length === 0) throw new Error("AI returned empty");

          // Add AI questions to DB for future use (Cache logic)
          setAllQuestions(prev => [...prev, ...aiQuestions.map(q => ({...q, topic, subTopic}))]);
          
          return [...dbQuestions, ...aiQuestions];
      } catch (e) {
          console.warn("AI Generation failed, using fallback questions");
          // 3. CRITICAL FALLBACK: If AI fails and DB is empty, return generic questions to prevent app lock
          return FALLBACK_QUESTIONS.slice(0, count); 
      }
  };

  const addPost = (content: string, contextTag: string, imageUrl?: string) => {
      if (!user) return;
      const newPost: SocialPost = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userSchool: user.schoolName,
          userAvatar: user.avatar,
          content,
          imageUrl,
          likes: 0,
          likedBy: [],
          dislikes: 0,
          dislikedBy: [],
          comments: [],
          reports: [],
          timestamp: Date.now(),
          relatedContext: contextTag
      };
      setPosts(prev => [newPost, ...prev]);
      addPoints(5);
  };

  const deletePost = (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const reportPost = (postId: string, reason: string) => {
      if (!user) return;
      const report: Report = {
          id: Date.now().toString(),
          userId: user.id,
          reason: reason,
          timestamp: Date.now()
      };
      setPosts(prev => prev.map(p => {
          if (p.id === postId) {
              return { ...p, reports: [...(p.reports || []), report] };
          }
          return p;
      }));
  };

  const toggleLike = (postId: string) => {
      if (!user) return;
      setPosts(prev => prev.map(post => {
          if (post.id === postId) {
              const hasLiked = post.likedBy.includes(user.id);
              // If liking, remove dislike if exists
              const hasDisliked = post.dislikedBy.includes(user.id);
              
              return {
                  ...post,
                  likes: hasLiked ? post.likes - 1 : post.likes + 1,
                  likedBy: hasLiked ? post.likedBy.filter(id => id !== user.id) : [...post.likedBy, user.id],
                  dislikes: hasDisliked ? post.dislikes - 1 : post.dislikes,
                  dislikedBy: hasDisliked ? post.dislikedBy.filter(id => id !== user.id) : post.dislikedBy
              };
          }
          return post;
      }));
  };

  const toggleDislike = (postId: string) => {
      if (!user) return;
      setPosts(prev => prev.map(post => {
          if (post.id === postId) {
              const hasDisliked = post.dislikedBy.includes(user.id);
              // If disliking, remove like if exists
              const hasLiked = post.likedBy.includes(user.id);
              
              return {
                  ...post,
                  dislikes: hasDisliked ? post.dislikes - 1 : post.dislikes + 1,
                  dislikedBy: hasDisliked ? post.dislikedBy.filter(id => id !== user.id) : [...post.dislikedBy, user.id],
                  likes: hasLiked ? post.likes - 1 : post.likes,
                  likedBy: hasLiked ? post.likedBy.filter(id => id !== user.id) : post.likedBy
              };
          }
          return post;
      }));
  };

  const addComment = (postId: string, content: string) => {
      if (!user) return;
      const newComment: Comment = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content,
          timestamp: Date.now()
      };
      setPosts(prev => prev.map(post => {
          if (post.id === postId) {
              return { ...post, comments: [...post.comments, newComment] };
          }
          return post;
      }));
      addPoints(2);
  };

  const sendMessage = (receiverId: string, content: string) => {
      if (!user) return;
      const newMessage: Message = {
          id: Date.now().toString(),
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatar,
          receiverId: receiverId,
          content,
          timestamp: Date.now(),
          read: false
      };
      setMessages(prev => [newMessage, ...prev]);
  };

  const markNotificationsRead = () => {
      if (user) {
          setNotifications(prev => prev.map(n => n.userId === user.id ? { ...n, read: true } : n));
      }
  };

  const adminAddUser = (newUser: User) => setAllUsers(prev => [...prev, newUser]);
  const adminDeleteUser = (userId: string) => setAllUsers(prev => prev.filter(u => u.id !== userId));
  const adminUpdateUserTier = (userId: string, tier: SubscriptionTier) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionTier: tier } : u));
    if (user && user.id === userId) setUser(prev => prev ? { ...prev, subscriptionTier: tier } : null);
  };
  const adminAddQuestion = (q: Question) => setAllQuestions(prev => [...prev, q]);
  const adminDeleteQuestion = (id: string) => setAllQuestions(prev => prev.filter(q => q.id !== id));
  const adminAddSchool = (name: string) => setAllSchools(prev => [...prev, { id: Date.now().toString(), name, isPremium: false }]);
  const adminDeleteSchool = (id: string) => setAllSchools(prev => prev.filter(s => s.id !== id));
  const adminAddExamTopic = (name: string, category: string) => setAllExamTopics(prev => [...prev, { id: Date.now().toString(), name, category, isPopular: false, isPremium: false }]);
  const adminDeleteExamTopic = (id: string) => setAllExamTopics(prev => prev.filter(t => t.id !== id));
  const adminTogglePopularTopic = (id: string) => setAllExamTopics(prev => prev.map(t => t.id === id ? { ...t, isPopular: !t.isPopular } : t));
  const adminTogglePremiumMetadata = (id: string, type: 'school' | 'topic') => {
      if (type === 'school') {
          setAllSchools(prev => prev.map(s => s.id === id ? { ...s, isPremium: !s.isPremium } : s));
      } else {
          setAllExamTopics(prev => prev.map(t => t.id === id ? { ...t, isPremium: !t.isPremium } : t));
      }
  };

  const adminResolveReports = (postId: string, action: 'keep' | 'delete') => {
      if (action === 'delete') {
          setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
          // Clear reports but keep post
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, reports: [] } : p));
      }
  };

  return (
    <AppContext.Provider
      value={{
        user, allUsers, allQuestions, allSchools, allExamTopics, posts,
        notifications: user ? notifications.filter(n => n.userId === user.id) : [],
        messages: user ? messages.filter(m => m.receiverId === user.id || m.senderId === user.id) : [],
        theme, language, gradeLevel, specificClass,
        setLanguage, setGradeLevel: (l) => setGradeLevel(l), setSpecificClass,
        login, register, loginWithSocial, logout,
        upgradeToPremium, consumeFreeTest, completeTest, addPoints,
        updateUserProfile, updateUserAvatar, toggleNotificationPreference, shareAppAndGetReward,
        getHybridQuestions,
        addPost, deletePost, reportPost, toggleLike, toggleDislike, addComment, sendMessage, markNotificationsRead,
        adminAddUser, adminDeleteUser, adminUpdateUserTier, adminAddQuestion, adminDeleteQuestion,
        adminAddSchool, adminDeleteSchool, adminAddExamTopic, adminDeleteExamTopic, adminTogglePopularTopic, adminTogglePremiumMetadata, adminResolveReports
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
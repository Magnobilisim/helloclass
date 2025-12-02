
import { User, UserRole, Subject, ShopItem, Exam, Post, Message, School, Notification } from './types';

// Genişletilmiş Türkiye Okul Listesi (Örneklem)
export const INITIAL_SCHOOLS: School[] = [
  // İstanbul
  { id: 'ist1', name: 'İstanbul Atatürk Fen Lisesi', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist2', name: 'Kabataş Erkek Lisesi', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist3', name: 'Cağaloğlu Anadolu Lisesi', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist4', name: 'Kadıköy Anadolu Lisesi', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist5', name: 'Beşiktaş Sakıp Sabancı Anadolu Lisesi', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist6', name: 'Şişli Terakki Lisesi', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist7', name: 'Darüşşafaka Eğitim Kurumları', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist8', name: 'İstanbul İlkokulu', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist9', name: 'Kadıköy Ortaokulu', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ist10', name: 'Üsküdar Cumhuriyet İlkokulu', city: 'İstanbul', createdAt: '2024-01-01T00:00:00.000Z' },
  
  // Ankara
  { id: 'ank1', name: 'Ankara Fen Lisesi', city: 'Ankara', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ank2', name: 'Atatürk Anadolu Lisesi', city: 'Ankara', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ank3', name: 'Gazi Anadolu Lisesi', city: 'Ankara', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ank4', name: 'TED Ankara Koleji', city: 'Ankara', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ank5', name: 'Ankara Cumhuriyet Fen Lisesi', city: 'Ankara', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ank6', name: 'Çankaya İlkokulu', city: 'Ankara', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ank7', name: 'Keçiören Ortaokulu', city: 'Ankara', createdAt: '2024-01-01T00:00:00.000Z' },

  // İzmir
  { id: 'iz1', name: 'İzmir Fen Lisesi', city: 'İzmir', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'iz2', name: 'Bornova Anadolu Lisesi', city: 'İzmir', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'iz3', name: 'İzmir Atatürk Lisesi', city: 'İzmir', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'iz4', name: 'Karşıyaka İlkokulu', city: 'İzmir', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'iz5', name: 'Göztepe Ortaokulu', city: 'İzmir', createdAt: '2024-01-01T00:00:00.000Z' },

  // Diğer İller
  { id: 'bur1', name: 'Bursa Anadolu Lisesi', city: 'Bursa', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ant1', name: 'Antalya Adem Tolunay Anadolu Lisesi', city: 'Antalya', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ada1', name: 'Adana Fen Lisesi', city: 'Adana', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'kon1', name: 'Konya Meram Fen Lisesi', city: 'Konya', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'tra1', name: 'Trabzon Yomra Fen Lisesi', city: 'Trabzon', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'sam1', name: 'Samsun Garip Zeycan Yıldırım Fen Lisesi', city: 'Samsun', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'diy1', name: 'Diyarbakır Rekabet Kurumu Fen Lisesi', city: 'Diyarbakır', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'esk1', name: 'Eskişehir Fatih Fen Lisesi', city: 'Eskişehir', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'gaz1', name: 'Gaziantep Vehbi Dinçerler Fen Lisesi', city: 'Gaziantep', createdAt: '2024-01-01T00:00:00.000Z' },
  
  // Generic
  { id: 'gen1', name: 'Cumhuriyet İlkokulu', city: 'Genel', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'gen2', name: 'Atatürk Ortaokulu', city: 'Genel', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'gen3', name: 'Fatih Sultan Mehmet Lisesi', city: 'Genel', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'gen4', name: 'Yunus Emre İlköğretim Okulu', city: 'Genel', createdAt: '2024-01-01T00:00:00.000Z' }
];

export const TEACHER_BRANCHES = [
  'Sınıf Öğretmenliği',
  'Matematik',
  'Fen Bilimleri',
  'Türkçe',
  'Sosyal Bilgiler',
  'İngilizce',
  'Tarih',
  'Coğrafya',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Din Kültürü ve Ahlak Bilgisi',
  'Bilişim Teknolojileri',
  'Görsel Sanatlar',
  'Müzik',
  'Beden Eğitimi',
  'Rehberlik ve Psikolojik Danışmanlık',
  'Okul Öncesi',
  'Felsefe',
  'Edebiyat'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Super Admin',
    email: 'admin@helloclass.com',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
    points: 0,
    inventory: [],
    purchasedExamIds: [],
    activeFrame: undefined
  },
  {
    id: 'teacher1',
    name: 'Mr. John Keating',
    email: 'teacher@helloclass.com',
    role: UserRole.TEACHER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
    points: 500,
    inventory: [],
    purchasedExamIds: [],
    activeFrame: undefined,
    schoolId: 'ist2',
    branch: 'Matematik',
    bio: 'Mathematics Teacher | Math Enthusiast'
  },
  {
    id: 'student1',
    name: 'Alice Wonder',
    email: 'student@helloclass.com',
    role: UserRole.STUDENT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
    points: 120,
    inventory: ['JOKER_5050', 'AVATAR_FRAME'],
    purchasedExamIds: [],
    classLevel: 5,
    englishLevel: 'B1',
    activeFrame: undefined,
    schoolId: 'ist8',
    bio: 'I love Math and Coding! 🚀',
    followers: ['student2'],
    following: ['teacher1']
  },
  {
    id: 'student2',
    name: 'Bob Builder',
    email: 'bob@helloclass.com',
    role: UserRole.STUDENT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    points: 80,
    inventory: [],
    purchasedExamIds: [],
    classLevel: 5,
    englishLevel: 'A2',
    activeFrame: undefined,
    schoolId: 'ist8',
    bio: 'Building dreams one block at a time.',
    followers: [],
    following: ['student1']
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam1',
    title: '5. Sınıf Matematik - Doğal Sayılar',
    topic: 'Doğal Sayılar',
    creatorId: 'teacher1',
    creatorName: 'Mr. John Keating',
    subjectId: 'sub-math',
    difficulty: 'Easy',
    classLevel: 5,
    price: 0,
    timeLimit: 10,
    sales: 15,
    rating: 4.5,
    isPublished: true,
    questions: [
      { id: 'q1', text: '5 + 7 kaçtır?', options: ['10', '11', '12', '13'], correctIndex: 2, explanation: 'Basit toplama işlemi.' },
      { id: 'q2', text: 'x için çözün: 2x = 10', options: ['2', '5', '8', '20'], correctIndex: 1, explanation: 'Her iki tarafı 2ye bölün.' },
      { id: 'q3', text: '3 ün karesi kaçtır?', options: ['6', '9', '12', '33'], correctIndex: 1, explanation: '3 * 3 = 9' },
      { id: 'q4', text: '10 - 4 = ?', options: ['5', '6', '7', '8'], correctIndex: 1 },
      { id: 'q5', text: '20 nin yarısı kaçtır?', options: ['5', '10', '15', '2'], correctIndex: 1 }
    ]
  },
  {
    id: 'exam2',
    title: '8. Sınıf İnkılap Tarihi - Milli Uyanış',
    topic: 'Milli Uyanış',
    creatorId: 'teacher1',
    creatorName: 'Mr. John Keating',
    subjectId: 'sub-his',
    difficulty: 'Medium',
    classLevel: 8,
    price: 50,
    timeLimit: 20,
    sales: 42,
    rating: 4.8,
    isPublished: true,
    questions: [
      { id: 'q1', text: '1. Dünya Savaşı ne zaman bitti?', options: ['1914', '1918', '1920', '1923'], correctIndex: 1 },
      { id: 'q2', text: 'Mondros Ateşkes Antlaşması hangi yıl imzalandı?', options: ['1918', '1919', '1920', '1922'], correctIndex: 0 },
      { id: 'q3', text: 'Aşağıdakilerden hangisi İttifak Devletlerinden biridir?', options: ['Almanya', 'İngiltere', 'Fransa', 'Rusya'], correctIndex: 0 },
      { id: 'q4', text: 'Mustafa Kemal Samsuna ne zaman çıktı?', options: ['19 Mayıs 1919', '23 Nisan 1920', '29 Ekim 1923', '30 Ağustos 1922'], correctIndex: 0 },
      { id: 'q5', text: 'TBMM hangi tarihte açıldı?', options: ['1920', '1919', '1923', '1921'], correctIndex: 0 }
    ]
  },
  {
    id: 'exam3',
    title: 'İngilizce B1 - Past Tense',
    topic: 'Grammar',
    creatorId: 'teacher1',
    creatorName: 'Mr. John Keating',
    subjectId: 'sub-eng',
    difficulty: 'Medium',
    englishLevel: 'B1',
    price: 0,
    timeLimit: 15,
    sales: 10,
    rating: 4.0,
    isPublished: true,
    questions: [
      { id: 'q1', text: 'Yesterday, I ___ to the park.', options: ['go', 'gone', 'went', 'going'], correctIndex: 2 },
      { id: 'q2', text: 'She ___ seen the movie.', options: ['has', 'have', 'is', 'was'], correctIndex: 0 },
      { id: 'q3', text: 'They ___ playing football.', options: ['was', 'were', 'is', 'did'], correctIndex: 1 },
      { id: 'q4', text: 'I ___ breakfast at 8am.', options: ['eat', 'ate', 'eaten', 'eating'], correctIndex: 1 },
      { id: 'q5', text: 'He ___ not know the answer.', options: ['do', 'did', 'does', 'done'], correctIndex: 2 }
    ]
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'item1', name: 'Golden Frame', type: 'AVATAR_FRAME', price: 500, icon: '👑', description: 'Shine on the leaderboard!' },
  { id: 'item2', name: '50/50 Joker', type: 'JOKER_5050', price: 100, icon: '🎭', description: 'Remove 2 wrong answers.' },
  { id: 'item3', name: 'Skip Joker', type: 'JOKER_SKIP', price: 200, icon: '⏭️', description: 'Skip a hard question.' },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post1',
    authorId: 'student1',
    authorName: 'Alice Wonder',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
    content: 'Matematik sınavından tam puan aldım! 🚀 #matematik',
    likes: 5,
    dislikes: 0,
    timestamp: new Date().toISOString(),
    comments: [
      { 
        id: 'c1', 
        authorId: 'teacher1',
        authorName: 'Mr. John Keating', 
        text: 'Tebrikler Alice!', 
        timestamp: new Date(Date.now() - 3600000).toISOString() 
      }
    ],
    tags: ['sub-math'],
    schoolId: 'ist8'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'teacher1',
    receiverId: 'student1',
    content: 'Merhaba Alice, tarih ödevini tamamlamayı unutma.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: false
  },
  {
    id: 'm2',
    senderId: 'student1',
    receiverId: 'teacher1',
    content: 'Tamam Hocam, üzerinde çalışıyorum!',
    timestamp: new Date(Date.now() - 82000000).toISOString(),
    isRead: true
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'student1',
    title: 'Hoşgeldin!',
    message: 'HelloClass platformuna hoşgeldin. Puan kazanmak için profilini tamamla.',
    type: 'info',
    isRead: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 'n2',
    userId: 'student1',
    title: 'Sınav Sonucu',
    message: 'Matematik - Doğal Sayılar sınavından 90/100 aldın.',
    type: 'success',
    isRead: true,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

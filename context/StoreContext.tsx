
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Exam, Post, UserRole, AlertType, ExamResult, ShopItem, Message, Language, ActivityLog, School, Notification, ReportReason, SystemSettings, Comment, Payout, TopicMetadata, StoreContextType, SubjectDef, PrizeExam, Transaction, ExamSession } from '../types';
import { INITIAL_USERS, INITIAL_EXAMS, INITIAL_POSTS, INITIAL_MESSAGES, INITIAL_SCHOOLS, INITIAL_NOTIFICATIONS, SHOP_ITEMS } from '../constants';
import { TRANSLATIONS, TranslationKeys } from '../translations';
import { checkContentSafety } from '../services/geminiService';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

const INITIAL_SUBJECTS: SubjectDef[] = [
    { id: 'sub-math', name: 'Matematik', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'sub-sci', name: 'Fen Bilimleri', grades: [3, 4, 5, 6, 7, 8] },
    { id: 'sub-tur', name: 'Türkçe', grades: [1, 2, 3, 4, 5, 6, 7, 8] },
    { id: 'sub-soc', name: 'Sosyal Bilgiler', grades: [4, 5, 6, 7] },
    { id: 'sub-eng', name: 'İngilizce', grades: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'sub-his', name: 'T.C. İnkılap Tarihi', grades: [8, 12] },
    { id: 'sub-rel', name: 'Din Kültürü', grades: [4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'sub-it', name: 'Bilişim Teknolojileri', grades: [5, 6] },
    { id: 'sub-phy', name: 'Fizik', grades: [9, 10, 11, 12] },
    { id: 'sub-che', name: 'Kimya', grades: [9, 10, 11, 12] },
    { id: 'sub-bio', name: 'Biyoloji', grades: [9, 10, 11, 12] },
    { id: 'sub-lit', name: 'Türk Dili ve Edebiyatı', grades: [9, 10, 11, 12] },
    { id: 'sub-geo', name: 'Coğrafya', grades: [9, 10, 11, 12] },
    { id: 'sub-his2', name: 'Tarih', grades: [9, 10, 11, 12] },
    { id: 'sub-phi', name: 'Felsefe', grades: [10, 11] },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [shopItems, setShopItems] = useState<ShopItem[]>(SHOP_ITEMS);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [prizeExams, setPrizeExams] = useState<PrizeExam[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]); 
  const [examSessions, setExamSessions] = useState<Record<string, ExamSession>>({}); 
  
  const buildSessionKey = (studentId: string, examId: string) => `${studentId}_${examId}`;
  
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null);
  const [language, setLanguage] = useState<Language>('tr');
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ 
      commissionRate: 20, 
      maintenanceMode: false, 
      pointConversionRate: 0.1,
      studentTerms: TRANSLATIONS['tr'].default_student_terms,
      teacherTerms: TRANSLATIONS['tr'].default_teacher_terms
  });
  
  const [availableSubjects, setAvailableSubjects] = useState<SubjectDef[]>(INITIAL_SUBJECTS);

  const [approvedTopics, setApprovedTopics] = useState<Record<string, TopicMetadata[]>>({
    'sub-math': [
      { name: 'Doğal Sayılar', grade: 5 }, { name: 'Doğal Sayılar', grade: 6 },
      { name: 'Kesirler', grade: 5 }, { name: 'Ondalık Gösterim', grade: 5 },
      { name: 'Tam Sayılar', grade: 6 }, { name: 'Cebirsel İfadeler', grade: 6 },
      { name: 'Rasyonel Sayılar', grade: 7 }, { name: 'Eşitlik ve Denklem', grade: 7 },
      { name: 'Çarpanlar ve Katlar', grade: 8 }, { name: 'Üslü İfadeler', grade: 8 },
      { name: 'Kareköklü İfadeler', grade: 8 }, { name: 'Veri Analizi', grade: 8 },
      { name: 'Olasılık', grade: 8 }, { name: 'Üçgenler', grade: 8 }
    ],
    'sub-sci': [
      { name: 'Güneş, Dünya ve Ay', grade: 5 }, { name: 'Kuvvetin Ölçülmesi', grade: 5 },
      { name: 'Güneş Sistemi', grade: 6 }, { name: 'Vücudumuzdaki Sistemler', grade: 6 },
      { name: 'Kuvvet ve Hareket', grade: 6 }, { name: 'Güneş Sistemi ve Ötesi', grade: 7 },
      { name: 'Hücre ve Bölünmeler', grade: 7 }, { name: 'Kuvvet ve Enerji', grade: 7 },
      { name: 'Mevsimler ve İklim', grade: 8 }, { name: 'DNA ve Genetik Kod', grade: 8 },
      { name: 'Basınç', grade: 8 }, { name: 'Madde ve Endüstri', grade: 8 }
    ],
    'sub-tur': [
      { name: 'Sözcükte Anlam', grade: 5 }, { name: 'Cümlede Anlam', grade: 5 },
      { name: 'Paragraf', grade: 5 }, { name: 'Yazım Kuralları', grade: 5 },
      { name: 'Sözcükte Anlam', grade: 6 }, { name: 'Zamirler', grade: 6 },
      { name: 'Fiiller', grade: 7 }, { name: 'Zarflar', grade: 7 },
      { name: 'Fiilimsiler', grade: 8 }, { name: 'Cümlenin Ögeleri', grade: 8 },
      { name: 'Fiilde Çatı', grade: 8 }, { name: 'Cümle Türleri', grade: 8 }
    ],
    'sub-soc': [
      { name: 'Birey ve Toplum', grade: 5 }, { name: 'Kültür ve Miras', grade: 5 },
      { name: 'İnsanlar, Yerler ve Çevreler', grade: 5 }, { name: 'Birey ve Toplum', grade: 6 },
      { name: 'Kültür ve Miras', grade: 6 }, { name: 'İpek Yolu', grade: 6 },
      { name: 'İletişim ve İnsan İlişkileri', grade: 7 }, { name: 'Türk Tarihinde Yolculuk', grade: 7 }
    ],
    'sub-his': [
      { name: 'Bir Kahraman Doğuyor', grade: 8 }, { name: 'Milli Uyanış', grade: 8 },
      { name: 'Ya İstiklal Ya Ölüm', grade: 8 }, { name: 'Atatürkçülük ve Çağdaşlaşan Türkiye', grade: 8 }
    ],
    'sub-eng': [
      { name: 'Greetings', level: 'A1' }, { name: 'My Family', level: 'A1' },
      { name: 'My Town', level: 'A1' }, { name: 'Games and Hobbies', level: 'A1' },
      { name: 'Yummy Breakfast', level: 'A2' }, { name: 'At the Fair', level: 'A2' },
      { name: 'Vacation', level: 'A2' }, { name: 'Appearance and Personality', level: 'A2' },
      { name: 'Friendship', level: 'B1' }, { name: 'Teen Life', level: 'B1' },
      { name: 'In The Kitchen', level: 'B1' }, { name: 'On The Phone', level: 'B1' }
    ],
    'sub-rel': [
      { name: 'Allah İnancı', grade: 5 }, { name: 'Ramazan ve Oruç', grade: 5 },
      { name: 'Peygamber ve İlahi Kitap İnancı', grade: 6 }, { name: 'Namaz', grade: 6 },
      { name: 'Melek ve Ahiret İnancı', grade: 7 }, { name: 'Hac ve Kurban', grade: 7 },
      { name: 'Kader İnancı', grade: 8 }, { name: 'Zekat ve Sadaka', grade: 8 }
    ],
    'sub-it': [
      { name: 'Bilişim Teknolojileri', grade: 5 }, { name: 'Etik ve Güvenlik', grade: 5 },
      { name: 'İşletim Sistemleri', grade: 6 }, { name: 'Problem Çözme ve Algoritma', grade: 6 }
    ]
  });

  useEffect(() => {
    const loadedUsers = localStorage.getItem('hc_users');
    const loadedExams = localStorage.getItem('hc_exams');
    const loadedPosts = localStorage.getItem('hc_posts');
    const loadedResults = localStorage.getItem('hc_results');
    const loadedUser = localStorage.getItem('hc_current_user');
    const loadedMessages = localStorage.getItem('hc_messages');
    const loadedLogs = localStorage.getItem('hc_logs');
    const loadedLang = localStorage.getItem('hc_language') as Language;
    const loadedSettings = localStorage.getItem('hc_settings');
    const loadedTopics = localStorage.getItem('hc_topics');
    const loadedSchools = localStorage.getItem('hc_schools');
    const loadedNotifs = localStorage.getItem('hc_notifs');
    const loadedSubjects = localStorage.getItem('hc_subjects');
    const loadedShop = localStorage.getItem('hc_shop');
    const loadedPayouts = localStorage.getItem('hc_payouts');
    const loadedPrizeExams = localStorage.getItem('hc_prize_exams');
    const loadedTransactions = localStorage.getItem('hc_transactions');
    const loadedSessions = localStorage.getItem('hc_sessions');

    if (loadedUsers) setUsers(JSON.parse(loadedUsers));
    if (loadedExams) setExams(JSON.parse(loadedExams));
    if (loadedPosts) setPosts(JSON.parse(loadedPosts));
    if (loadedResults) setResults(JSON.parse(loadedResults));
    if (loadedMessages) setMessages(JSON.parse(loadedMessages));
    if (loadedLogs) setLogs(JSON.parse(loadedLogs));
    if (loadedUser) setUser(JSON.parse(loadedUser));
    if (loadedLang) setLanguage(loadedLang);
    if (loadedSettings) setSystemSettings(JSON.parse(loadedSettings));
    if (loadedSchools) setSchools(JSON.parse(loadedSchools));
    if (loadedNotifs) setNotifications(JSON.parse(loadedNotifs));
    if (loadedSubjects) setAvailableSubjects(JSON.parse(loadedSubjects));
    if (loadedShop) setShopItems(JSON.parse(loadedShop));
    if (loadedPayouts) setPayouts(JSON.parse(loadedPayouts));
    if (loadedPrizeExams) setPrizeExams(JSON.parse(loadedPrizeExams));
    if (loadedTransactions) setTransactions(JSON.parse(loadedTransactions));
    if (loadedSessions) setExamSessions(JSON.parse(loadedSessions));
    
    if (loadedTopics) {
        try {
            const parsed = JSON.parse(loadedTopics);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
               setApprovedTopics(parsed);
            }
        } catch (e) {
            console.error("Failed to parse topics", e);
        }
    }
  }, []);

  useEffect(() => { localStorage.setItem('hc_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('hc_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('hc_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('hc_results', JSON.stringify(results)); }, [results]);
  useEffect(() => { localStorage.setItem('hc_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('hc_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('hc_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('hc_settings', JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { localStorage.setItem('hc_topics', JSON.stringify(approvedTopics)); }, [approvedTopics]);
  useEffect(() => { localStorage.setItem('hc_schools', JSON.stringify(schools)); }, [schools]);
  useEffect(() => { localStorage.setItem('hc_notifs', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('hc_subjects', JSON.stringify(availableSubjects)); }, [availableSubjects]);
  useEffect(() => { localStorage.setItem('hc_shop', JSON.stringify(shopItems)); }, [shopItems]);
  useEffect(() => { localStorage.setItem('hc_payouts', JSON.stringify(payouts)); }, [payouts]);
  useEffect(() => { localStorage.setItem('hc_prize_exams', JSON.stringify(prizeExams)); }, [prizeExams]);
  useEffect(() => { localStorage.setItem('hc_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('hc_sessions', JSON.stringify(examSessions)); }, [examSessions]);
  
  useEffect(() => {
    if (user) localStorage.setItem('hc_current_user', JSON.stringify(user));
    else localStorage.removeItem('hc_current_user');
  }, [user]);

  const t = (key: string): string => {
    return (TRANSLATIONS[language] && TRANSLATIONS[language][key as TranslationKeys]) || key;
  };

  const showAlert = (message: string, type: AlertType) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const addNotification = (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', link?: string) => {
      const newNotif: Notification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          userId,
          title,
          message,
          type,
          isRead: false,
          timestamp: new Date().toISOString(),
          link
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const addLog = (action: string, target: string, type: 'info' | 'warning' | 'danger') => {
    if (!user) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      adminId: user.id,
      adminName: user.name,
      action,
      target,
      timestamp: new Date().toISOString(),
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const login = (email: string, role: UserRole) => {
    if (systemSettings.maintenanceMode && role !== UserRole.ADMIN) {
        showAlert('System is currently under maintenance. Please try again later.', 'warning');
        return false;
    }

    const found = users.find(u => u.email === email && u.role === role);
    if (found) {
      if (found.isBanned) {
        showAlert('Account is banned.', 'error');
        return false;
      }
      setUser(found);
      showAlert(`${t('welcome')}, ${found.name}!`, 'success');
      return true;
    }
    showAlert('Invalid credentials', 'error');
    return false;
  };

  const logout = () => {
    setUser(null);
    showAlert('Logged out successfully', 'info');
  };

  const register = (newUser: User) => {
    if (users.some(u => u.email === newUser.email)) {
        showAlert('Email already exists', 'error');
        return;
    }
    const userWithBonus = { 
        ...newUser, 
        points: 100, 
        purchasedExamIds: [],
        notificationSettings: { email: true, app: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    setUsers([...users, userWithBonus]);
    setUser(userWithBonus);
    addNotification(userWithBonus.id, t('welcome'), t('welcome_msg'), 'success');
    showAlert(t('welcome'), 'success');
  };

  const updateUser = (updatedUser: User) => {
    const userWithTimestamp = { ...updatedUser, updatedAt: new Date().toISOString() };
    setUsers(users.map(u => u.id === updatedUser.id ? userWithTimestamp : u));
    if (user && user.id === updatedUser.id) setUser(userWithTimestamp);
  };

  const deleteUser = (userId: string) => {
    if (!user || user.role !== UserRole.ADMIN) {
        showAlert('Unauthorized', 'error');
        return;
    }
    if (user.id === userId) {
      showAlert(t('cannot_delete_self'), 'error');
      return;
    }
    
    const targetUser = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    addLog('Deleted User', targetUser?.email || userId, 'danger');
    showAlert(t('user_deleted'), 'info');
  };

  const changeRole = (userId: string, newRole: UserRole) => {
    if (!user || user.role !== UserRole.ADMIN) return;
    if (user.id === userId) {
        showAlert('Cannot change your own role', 'error');
        return;
    }
    const targetUser = users.find(u => u.id === userId);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, updatedAt: new Date().toISOString() } : u));
    addLog('Changed Role', `${targetUser?.name} -> ${newRole}`, 'warning');
    showAlert(t('role_updated'), 'success');
  };

  const addExam = (exam: Exam) => {
    if (!user) return;
    const secureExam = { 
        ...exam, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    if (user.role !== UserRole.ADMIN) {
        secureExam.creatorId = user.id;
        secureExam.creatorName = user.name;
    }
    setExams([...exams, secureExam]);
    showAlert(t('exam_created'), 'success');
    if (user.role === UserRole.ADMIN) addLog('Created Exam', exam.title, 'info');
  };

  const updateExam = (updatedExam: Exam) => {
    const original = exams.find(e => e.id === updatedExam.id);
    if (!original) return;
    if (user?.role !== UserRole.ADMIN && user?.id !== original.creatorId) {
        showAlert('Unauthorized to edit this exam', 'error');
        return;
    }
    const examWithTimestamp = { ...updatedExam, updatedAt: new Date().toISOString() };
    setExams(exams.map(e => e.id === updatedExam.id ? examWithTimestamp : e));
    showAlert(t('exam_updated'), 'success');
    if (user?.role === UserRole.ADMIN) addLog('Updated Exam', updatedExam.title, 'warning');
  };

  const deleteExam = (id: string) => {
    const targetExam = exams.find(e => e.id === id);
    if (!targetExam) return;
    if (user?.role !== UserRole.ADMIN && user?.id !== targetExam.creatorId) {
        showAlert('Unauthorized action', 'error');
        return;
    }
    setExams(exams.filter(e => e.id !== id));
    setUsers(users.map(u => ({
      ...u,
      purchasedExamIds: u.purchasedExamIds?.filter(eid => eid !== id) || []
    })));
    setResults(prevResults => prevResults.filter(r => r.examId !== id));

    if (user?.role === UserRole.ADMIN) {
       addLog('Deleted Exam', targetExam.title, 'danger');
    }
    showAlert(t('delete_confirm'), 'info');
  };

  const purchaseExam = (examId: string): boolean => {
    if (!user) return false;
    if (user.purchasedExamIds?.includes(examId)) return true;

    const exam = exams.find(e => e.id === examId);
    if (exam) {
      if (exam.price < 0) {
          showAlert('Error: Invalid price', 'error');
          return false;
      }
      if (user.points < exam.price) {
          showAlert(t('not_enough_points'), 'error');
          return false;
      }
      const updatedUser = {
          ...user,
          points: user.points - exam.price,
          purchasedExamIds: [...(user.purchasedExamIds || []), examId],
          updatedAt: new Date().toISOString()
      };
      updateUser(updatedUser);
      const updatedExams = exams.map(e => e.id === examId ? { ...e, sales: e.sales + 1 } : e);
      setExams(updatedExams);
      
      const newTransaction: Transaction = {
          id: `txn-${Date.now()}`,
          examId: exam.id,
          teacherId: exam.creatorId,
          studentId: user.id,
          amount: exam.price,
          timestamp: new Date().toISOString()
      };
      setTransactions([...transactions, newTransaction]);

      addNotification(user.id, t('purchase_success'), `${exam.title} ${t('exam_added')}`, 'success', `/student/exam/${exam.id}`);
      showAlert(t('purchase_success'), 'success');
      return true;
    }
    return false;
  };

  const purchaseItem = (item: ShopItem): boolean => {
    if (!user) return false;
    if (user.inventory.includes(item.type) && item.type === 'AVATAR_FRAME') {
        showAlert(t('owned'), 'info');
        return true; 
    }
    if (user.points >= item.price) {
      const updatedUser = { 
        ...user, 
        points: user.points - item.price,
        inventory: [...user.inventory, item.type],
        updatedAt: new Date().toISOString()
      };
      if (item.type === 'AVATAR_FRAME' && !updatedUser.activeFrame) {
          updatedUser.activeFrame = item.type;
      }
      updateUser(updatedUser);
      addNotification(user.id, t('purchase_success'), `${item.name} ${t('item_added')}`, 'success', '/student/shop');
      showAlert(t('purchase_success'), 'success');
      return true;
    }
    showAlert(t('not_enough_points'), 'error');
    return false;
  };

  const toggleEquip = (itemType: string) => {
    if (!user) return;
    if (user.activeFrame === itemType) {
        updateUser({ ...user, activeFrame: undefined });
        showAlert(t('unequipped'), 'info');
    } else {
        updateUser({ ...user, activeFrame: itemType });
        showAlert(t('equipped'), 'success');
    }
  };

  const startExamSession = (examId: string) => {
      if (!user) return;
      const sessionKey = buildSessionKey(user.id, examId);
      setExamSessions(prev => {
          const existing = prev[sessionKey];
          if (existing && existing.status === 'started') {
              return prev;
          }
          
          return {
              ...prev,
              [sessionKey]: {
                  examId,
                  studentId: user.id,
                  startedAt: existing?.status === 'started' ? existing.startedAt : new Date().toISOString(),
                  status: 'started'
              }
          };
      });
  };

  const saveResult = (examId: string, answers: number[]) => {
    if (!user) return;

    const sessionKey = buildSessionKey(user.id, examId);
    const session = examSessions[sessionKey] || examSessions[examId];
    if (!session) {
        showAlert('Invalid session. Please start the exam correctly.', 'error');
        return;
    }

    if (session.studentId && session.studentId !== user.id) {
        showAlert('Invalid session. Please start the exam correctly.', 'error');
        return;
    }

    if (session.status === 'completed') {
        showAlert('Exam already submitted.', 'warning');
        return;
    }

    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const startTime = new Date(session.startedAt).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - startTime) / 1000;
    
    if (elapsedSeconds < 10 && exam.questions.length > 1) {
        showAlert('Submission rejected: Time too short.', 'error');
        return;
    }

    if (!answers || answers.length !== exam.questions.length) {
        showAlert('Invalid submission data', 'error');
        return;
    }

    let calculatedScore = 0;
    exam.questions.forEach((q, index) => {
        if (answers[index] === q.correctIndex) {
            calculatedScore++;
        }
    });

    const difficultyMultiplier = exam.difficulty === 'Easy' ? 1 : exam.difficulty === 'Medium' ? 1.5 : 2;
    const rewardsEarned = Math.round(calculatedScore * 10 * difficultyMultiplier);

    const fullResult: ExamResult = {
        id: `res-${Date.now()}`,
        examId: examId,
        studentId: user.id,
        score: calculatedScore,
        totalQuestions: exam.questions.length,
        date: new Date().toISOString(),
        rewardsEarned,
        answers: answers
    };

    const existingResult = results.find(r => r.examId === examId && r.studentId === user.id);
    
    if (existingResult) {
        setResults(results.map(r => r.id === existingResult.id ? fullResult : r));
        showAlert('Exam result updated', 'info');
    } else {
        setResults([...results, fullResult]);
        const updatedUser = { ...user, points: user.points + rewardsEarned, updatedAt: new Date().toISOString() };
        updateUser(updatedUser);
        addNotification(user.id, t('exam_completed'), `${exam.title}: +${rewardsEarned} ${t('points')}!`, 'success', '/student/results');
        showAlert(`${t('points_gained')}: +${rewardsEarned}`, 'success');
    }
    
    setExamSessions(prev => ({
        ...prev,
        [sessionKey]: {
            examId,
            studentId: user.id,
            startedAt: session.startedAt,
            status: 'completed'
        }
    }));
  };

  const addPost = async (content: string, tags?: string[], schoolId?: string, imageUrl?: string): Promise<{success: boolean, reason?: string}> => {
    if (!user) return { success: false, reason: 'Auth error' };
    if (content.length > 280) {
        showAlert('Post too long', 'error');
        return { success: false, reason: 'Length error' };
    }
    
    const safetyResult = await checkContentSafety(content);
    if (!safetyResult.safe) {
        addNotification(user.id, t('content_unsafe'), `${t('content_unsafe')}: ${safetyResult.reason}`, 'error');
        return { success: false, reason: safetyResult.reason || 'Unsafe content' };
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      content,
      imageUrl, 
      likes: 0,
      dislikes: 0,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      comments: [],
      tags,
      schoolId
    };
    setPosts([newPost, ...posts]);
    updateUser({ ...user, points: user.points + 10 });
    addNotification(user.id, t('posted_msg'), t('posted_msg'), 'success');
    return { success: true };
  };

  const deletePost = (postId: string) => {
    if (!user || user.role !== UserRole.ADMIN) return;
    setPosts(posts.filter(p => p.id !== postId));
    addLog('Deleted Post', postId, 'warning');
    showAlert(t('post_deleted'), 'info');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };
  
  const toggleDislike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, dislikes: p.dislikes + 1 } : p));
  };

  const addComment = async (postId: string, text: string) => {
      if (!user || !text.trim()) return;

      const safetyResult = await checkContentSafety(text);
      if (!safetyResult.safe) {
          showAlert(`Comment blocked: ${safetyResult.reason}`, 'error');
          return;
      }

      const newComment: Comment = {
          id: `c-${Date.now()}`,
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatar,
          text: text.trim(),
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
  };

  const reportPost = (postId: string, reason: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isReported: true, reportReason: reason as ReportReason } : p));
    showAlert(t('report_msg'), 'info');
  };

  const dismissReport = (postId: string) => {
    if (!user || user.role !== UserRole.ADMIN) return;
    setPosts(posts.map(p => p.id === postId ? { ...p, isReported: false } : p));
    addLog('Dismissed Report', postId, 'info');
    showAlert(t('report_resolved'), 'success');
  };

  const banUser = (userId: string) => {
    if (!user || user.role !== UserRole.ADMIN) return;
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.id === user.id) {
       showAlert(t('cannot_delete_self'), 'error');
       return;
    }
    if (target.role === UserRole.ADMIN) {
      showAlert('Cannot ban an admin', 'error');
      return;
    }
    const newStatus = !target.isBanned;
    updateUser({ ...target, isBanned: newStatus });
    addLog(newStatus ? 'Banned User' : 'Unbanned User', target.name, newStatus ? 'danger' : 'warning');
    showAlert(`User ${newStatus ? 'banned' : 'unbanned'}`, 'info');
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!user || !content.trim()) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      senderId: user.id,
      receiverId: receiverId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages([...messages, newMessage]);
    addNotification(receiverId, t('new_message'), t('new_message_body').replace('{name}', user.name), 'info', '/chat');
  };

  const markMessageRead = (senderId: string) => {
      if (!user) return;
      const hasUnread = messages.some(m => m.receiverId === user.id && m.senderId === senderId && !m.isRead);
      if (!hasUnread) return;

      setMessages(messages.map(m => 
          (m.receiverId === user.id && m.senderId === senderId && !m.isRead)
          ? { ...m, isRead: true }
          : m
      ));
  };

  const updateSystemSettings = (settings: SystemSettings) => {
      if (user?.role !== UserRole.ADMIN) return;
      setSystemSettings(settings);
      addLog('Updated Settings', 'System Config', 'warning');
      showAlert(t('settings_saved'), 'success');
  };

  const addTopic = (subjectId: string, topic: string, grade?: number, level?: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      const currentTopics = approvedTopics[subjectId] || [];
      if (!currentTopics.some(t => t.name.toLowerCase() === topic.toLowerCase() && t.grade === grade && t.level === level)) {
          const newTopicObj: TopicMetadata = { name: topic, grade, level };
          setApprovedTopics({
              ...approvedTopics,
              [subjectId]: [...currentTopics, newTopicObj]
          });
          showAlert('Topic added', 'success');
      } else {
          showAlert('Topic already exists', 'error');
      }
  };

  const removeTopic = (subjectId: string, topic: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      const currentTopics = approvedTopics[subjectId] || [];
      setApprovedTopics({
          ...approvedTopics,
          [subjectId]: currentTopics.filter(t => t.name !== topic)
      });
      showAlert('Topic removed', 'info');
  };

  const addSchool = (name: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      const newSchool: School = { 
          id: `sch-${Date.now()}`, 
          name, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      setSchools([...schools, newSchool]);
      showAlert('School added', 'success');
  };

  const removeSchool = (id: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      setSchools(schools.filter(s => s.id !== id));
      showAlert('School removed', 'info');
  };

  const markNotificationRead = (id: string) => {
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addSubject = (name: string, grades: number[]) => {
      if (user?.role !== UserRole.ADMIN) return;
      if (!availableSubjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
          const newSubject: SubjectDef = { id: `sub-${Date.now()}`, name, grades };
          setAvailableSubjects([...availableSubjects, newSubject]);
          showAlert('Subject added', 'success');
      } else {
          showAlert('Subject already exists', 'error');
      }
  };

  const removeSubject = (id: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      setAvailableSubjects(availableSubjects.filter(s => s.id !== id));
      showAlert('Subject removed', 'info');
  };

  const toggleFollow = (targetUserId: string) => {
      if (!user) return;
      if (user.id === targetUserId) {
          showAlert('Cannot follow yourself', 'error');
          return;
      }

      const targetUser = users.find(u => u.id === targetUserId);
      if (!targetUser) return;

      const isFollowing = user.following?.includes(targetUserId);
      
      let updatedUser = { ...user, updatedAt: new Date().toISOString() };
      let updatedTarget = { ...targetUser, updatedAt: new Date().toISOString() };

      if (isFollowing) {
          updatedUser.following = (user.following || []).filter(id => id !== targetUserId);
          updatedTarget.followers = (targetUser.followers || []).filter(id => id !== user.id);
          showAlert(t('unfollowed'), 'info');
      } else {
          updatedUser.following = [...(user.following || []), targetUserId];
          updatedTarget.followers = [...(targetUser.followers || []), user.id];
          showAlert(t('followed'), 'success');
          addNotification(targetUserId, t('new_follower'), `${user.name} ${t('started_following')}`, 'info', '/student/profile');
      }

      const newUsers = users.map(u => {
          if (u.id === user.id) return updatedUser;
          if (u.id === targetUserId) return updatedTarget;
          return u;
      });
      
      setUsers(newUsers);
      setUser(updatedUser);
  };

  const addShopItem = (item: ShopItem) => {
      if (user?.role !== UserRole.ADMIN) return;
      setShopItems([...shopItems, { ...item, id: `item-${Date.now()}` }]);
      showAlert('Item added', 'success');
  };

  const deleteShopItem = (id: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      setShopItems(shopItems.filter(i => i.id !== id));
      showAlert('Item deleted', 'info');
  };

  const sendBroadcast = (title: string, message: string, targetRole: UserRole | 'ALL') => {
      if (user?.role !== UserRole.ADMIN) return;
      
      const targets = users.filter(u => targetRole === 'ALL' || u.role === targetRole);
      targets.forEach(u => {
          addNotification(u.id, title, message, 'info');
      });
      addLog('Broadcast Sent', `${targetRole} - ${title}`, 'info');
      showAlert(`Broadcast sent to ${targets.length} users`, 'success');
  };

  const adjustUserPoints = (userId: string, amount: number) => {
      if (user?.role !== UserRole.ADMIN) return;
      const target = users.find(u => u.id === userId);
      if (target) {
          const newPoints = Math.max(0, target.points + amount);
          updateUser({ ...target, points: newPoints, updatedAt: new Date().toISOString() });
          addNotification(target.id, t('points_adjustment'), t('points_adjusted_msg').replace('{amount}', (amount > 0 ? '+' : '') + amount), amount > 0 ? 'success' : 'warning');
          addLog('Points Adjusted', `${target.name} (${amount})`, 'warning');
          showAlert('Points updated', 'success');
      }
  };

  const processPayout = (teacherId: string, amountTL: number) => {
      if (user?.role !== UserRole.ADMIN) return;
      const newPayout: Payout = {
          id: `pay-${Date.now()}`,
          teacherId,
          amountTL,
          date: new Date().toISOString(),
          adminId: user.id
      };
      setPayouts([...payouts, newPayout]);
      addNotification(teacherId, 'Payment Received', `You have received a payout of ₺${amountTL.toFixed(2)}.`, 'success');
      addLog('Payout Processed', `${amountTL}TL to ${teacherId}`, 'info');
      showAlert('Payout recorded', 'success');
  };

  const deleteExamImage = (examId: string, questionId: string, type: 'question' | 'option' | 'explanation', optionIndex?: number) => {
      if (user?.role !== UserRole.ADMIN) return;
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;

      const newQuestions = exam.questions.map(q => {
          if (q.id === questionId) {
              if (type === 'question') {
                  return { ...q, imageUrl: undefined };
              } else if (type === 'explanation') {
                  return { ...q, explanationImage: undefined };
              } else if (type === 'option' && typeof optionIndex === 'number' && q.optionImages) {
                  const newOptionImages = [...q.optionImages];
                  newOptionImages[optionIndex] = ''; 
                  return { ...q, optionImages: newOptionImages };
              }
          }
          return q;
      });

      setExams(exams.map(e => e.id === examId ? { ...e, questions: newQuestions, updatedAt: new Date().toISOString() } : e));
      showAlert(t('image_deleted'), 'info');
  };

  const addPrizeExam = (prizeExam: PrizeExam) => {
      if (user?.role !== UserRole.ADMIN) return;
      setPrizeExams([...prizeExams, { ...prizeExam, createdAt: new Date().toISOString() }]);
      addLog('Added Prize Exam', `${prizeExam.month} - Grade ${prizeExam.grade}`, 'info');
      showAlert('Prize Exam Created', 'success');
  };

  const drawPrizeWinner = (prizeExamId: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      
      const prizeExam = prizeExams.find(pe => pe.id === prizeExamId);
      if (!prizeExam) return;

      const candidates = results.filter(r => 
          r.examId === prizeExam.examId && 
          prizeExam.participants?.includes(r.studentId)
      );
      
      if (candidates.length === 0) {
          showAlert('No valid participants found (Paid & Completed).', 'warning');
          return;
      }

      const maxScore = Math.max(...candidates.map(c => c.score));
      const topScorers = candidates.filter(c => c.score === maxScore);
      
      const winnerResult = topScorers[Math.floor(Math.random() * topScorers.length)];
      const winnerUser = users.find(u => u.id === winnerResult.studentId);

      if (!winnerUser) return;

      const updatedPrizeExams = prizeExams.map(pe => 
          pe.id === prizeExamId 
          ? { ...pe, isActive: false, winnerId: winnerUser.id, winnerName: winnerUser.name, drawDate: new Date().toISOString() } 
          : pe
      );

      setPrizeExams(updatedPrizeExams);
      addNotification(winnerUser.id, '🎉 You Won!', `Congratulations! You won the prize for ${prizeExam.prizeTitle}!`, 'success', '/student/prize-exams');
      addLog('Prize Draw', `${prizeExam.month} Winner: ${winnerUser.name}`, 'info');
      showAlert(`Winner drawn: ${winnerUser.name}`, 'success');
  };

  const payEntryFee = (prizeExamId: string, amount: number): boolean => {
      if (!user) return false;
      if (user.points >= amount) {
          updateUser({ ...user, points: user.points - amount, updatedAt: new Date().toISOString() });
          
          const updatedPrizeExams = prizeExams.map(pe => {
              if (pe.id === prizeExamId) {
                  return { ...pe, participants: [...(pe.participants || []), user.id] };
              }
              return pe;
          });
          setPrizeExams(updatedPrizeExams);

          addLog('Entry Fee Paid', `${user.name} paid ${amount} for contest`, 'info');
          return true;
      }
      return false;
  }

  const resetPassword = (email: string, newPass: string) => {
      const targetUser = users.find(u => u.email === email);
      if (!targetUser) {
          showAlert(t('user_not_found'), 'error');
          return false;
      }
      const updatedUser = { ...targetUser, updatedAt: new Date().toISOString() };
      // In a real app we'd hash the new password here
      // For mock, we just pretend it's updated. 
      // If we were storing passwords, we'd do: updatedUser.password = newPass;
      updateUser(updatedUser);
      
      showAlert(t('reset_success'), 'success');
      return true;
  }

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const targetUser = users.find(u => u.email === email);
      if (targetUser) {
          return true;
      }
      return false;
  };

  return (
    <StoreContext.Provider value={{
      user, users, exams, posts, results, messages, language, systemSettings, logs, approvedTopics, schools, notifications, availableSubjects, shopItems, payouts, prizeExams, transactions, examSessions,
      login, logout, register, updateUser, banUser, deleteUser, changeRole, resetPassword, sendPasswordResetEmail,
      addExam, updateExam, deleteExam, purchaseExam, purchaseItem, toggleEquip, startExamSession, saveResult, addPost, deletePost, toggleLike, toggleDislike, addComment, reportPost, dismissReport, sendMessage, markMessageRead, updateSystemSettings,
      addTopic, removeTopic, addSchool, removeSchool, markNotificationRead, addSubject, removeSubject, toggleFollow,
      addShopItem, deleteShopItem, sendBroadcast, adjustUserPoints, processPayout, deleteExamImage,
      addPrizeExam, drawPrizeWinner, payEntryFee,
      alert, showAlert, setLanguage, t
    }}>
      {children}
    </StoreContext.Provider>
  );
};

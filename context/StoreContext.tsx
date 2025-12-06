
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Exam, Post, UserRole, AlertType, ExamResult, ShopItem, Message, Language, ActivityLog, School, Notification, ReportReason, SystemSettings, Comment, Payout, TopicMetadata, StoreContextType, SubjectDef, PrizeExam, PrizeFinalist, Transaction, ExamSession, PointPurchase, AiUsageLog, PayoutRequest, ManualAd } from '../types';
import { INITIAL_USERS, INITIAL_EXAMS, INITIAL_POSTS, INITIAL_MESSAGES, INITIAL_SCHOOLS, INITIAL_NOTIFICATIONS, SHOP_ITEMS, DEFAULT_POINT_PACKAGES, CURRICULUM_TOPICS, INITIAL_PRIZE_EXAMS, TEACHER_CREDIT_PACKAGES, INITIAL_TRANSACTIONS, INITIAL_MANUAL_ADS } from '../constants';
import { TRANSLATIONS, TranslationKeys } from '../translations';
import { checkContentSafety, generateLearningReport, setSafetyLanguage } from '../services/aiService';

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

const ensureReferralFields = (u: User): User => ({
    ...u,
    referralCode: u.referralCode || `HC-${u.id}`,
    referralCount: u.referralCount || 0,
    totalReferralPoints: u.totalReferralPoints || 0,
    totalPointsPurchased: u.totalPointsPurchased || 0,
    lifetimeExamPoints: u.lifetimeExamPoints || 0,
    lifetimeAdPoints: u.lifetimeAdPoints || 0
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS.map(ensureReferralFields));
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [shopItems, setShopItems] = useState<ShopItem[]>(SHOP_ITEMS);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [prizeExams, setPrizeExams] = useState<PrizeExam[]>(INITIAL_PRIZE_EXAMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS); 
  const [pointPurchases, setPointPurchases] = useState<PointPurchase[]>([]);
  const [examSessions, setExamSessions] = useState<Record<string, ExamSession>>({}); 
  const [aiUsageLogs, setAiUsageLogs] = useState<AiUsageLog[]>([]);
  const [manualAds, setManualAds] = useState<ManualAd[]>(INITIAL_MANUAL_ADS);
  
  const buildSessionKey = (studentId: string, examId: string) => `${studentId}_${examId}`;
  const generateReferralCode = () => `HC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null);
  const [language, setLanguage] = useState<Language>('tr');
  const defaultSettings: SystemSettings = { 
      commissionRate: 20, 
      maintenanceMode: false, 
      pointConversionRate: 0.1,
      studentTerms: TRANSLATIONS['tr'].default_student_terms,
      teacherTerms: TRANSLATIONS['tr'].default_teacher_terms,
      adRewardPoints: 50,
      referralRewardPoints: 100,
      pointPackages: DEFAULT_POINT_PACKAGES,
      aiWizardCost: 200,
      aiExplainCost: 25,
      joker5050Cost: 30,
      teacherCreditPackages: TEACHER_CREDIT_PACKAGES,
      socialLinks: {
        youtube: '',
        instagram: '',
        x: '',
        linkedin: ''
      }
  };
  const mergeSettings = (incoming?: Partial<SystemSettings>): SystemSettings => ({
      ...defaultSettings,
      ...incoming,
      pointPackages: incoming?.pointPackages && incoming.pointPackages.length ? incoming.pointPackages : defaultSettings.pointPackages,
      teacherCreditPackages: incoming?.teacherCreditPackages && incoming.teacherCreditPackages.length ? incoming.teacherCreditPackages : defaultSettings.teacherCreditPackages,
      aiWizardCost: typeof incoming?.aiWizardCost === 'number' ? incoming.aiWizardCost : defaultSettings.aiWizardCost,
      aiExplainCost: typeof incoming?.aiExplainCost === 'number' ? incoming.aiExplainCost : defaultSettings.aiExplainCost,
      joker5050Cost: typeof incoming?.joker5050Cost === 'number' ? incoming.joker5050Cost : defaultSettings.joker5050Cost,
      socialLinks: {
        ...(defaultSettings.socialLinks || {}),
        ...(incoming?.socialLinks || {})
      }
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSettings);
  
  const [availableSubjects, setAvailableSubjects] = useState<SubjectDef[]>(INITIAL_SUBJECTS);

  const mergeTopicsMap = (incoming?: Record<string, TopicMetadata[]>) => {
      const merged: Record<string, TopicMetadata[]> = { ...CURRICULUM_TOPICS };
      if (incoming) {
          Object.entries(incoming).forEach(([subjectId, topics]) => {
              const base = merged[subjectId] ? [...merged[subjectId]] : [];
              topics.forEach(topic => {
                  const exists = base.some(
                      t => t.name.toLowerCase() === topic.name.toLowerCase() &&
                           t.grade === topic.grade &&
                           t.level === topic.level
                  );
                  if (!exists) base.push(topic);
              });
              merged[subjectId] = base;
          });
      }
      return merged;
  };

  const [approvedTopics, setApprovedTopics] = useState<Record<string, TopicMetadata[]>>(mergeTopicsMap());

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
    const loadedPayoutRequests = localStorage.getItem('hc_payout_requests');
    const loadedPrizeExams = localStorage.getItem('hc_prize_exams');
    const loadedTransactions = localStorage.getItem('hc_transactions');
    const loadedSessions = localStorage.getItem('hc_sessions');
    const loadedPointPurchases = localStorage.getItem('hc_point_purchases');
    const loadedAiLogs = localStorage.getItem('hc_ai_logs');
    const loadedManualAds = localStorage.getItem('hc_manual_ads');

    if (loadedUsers) {
        try {
            const parsedUsers: User[] = JSON.parse(loadedUsers).map(ensureReferralFields);
            setUsers(parsedUsers);
        } catch (e) {
            console.error('Failed to parse users', e);
        }
    }
    if (loadedExams) setExams(JSON.parse(loadedExams));
    if (loadedPosts) setPosts(JSON.parse(loadedPosts));
    if (loadedResults) setResults(JSON.parse(loadedResults));
    if (loadedMessages) setMessages(JSON.parse(loadedMessages));
    if (loadedLogs) setLogs(JSON.parse(loadedLogs));
    if (loadedUser) setUser(JSON.parse(loadedUser));
    if (loadedLang) setLanguage(loadedLang);
    if (loadedSettings) {
        try {
            const parsedSettings = JSON.parse(loadedSettings);
            setSystemSettings(mergeSettings(parsedSettings));
        } catch (e) {
            console.error('Failed to parse system settings', e);
            setSystemSettings(defaultSettings);
        }
    } else {
        setSystemSettings(defaultSettings);
    }
    if (loadedSchools) setSchools(JSON.parse(loadedSchools));
    if (loadedNotifs) setNotifications(JSON.parse(loadedNotifs));
    if (loadedSubjects) setAvailableSubjects(JSON.parse(loadedSubjects));
    if (loadedShop) setShopItems(JSON.parse(loadedShop));
    if (loadedPayouts) setPayouts(JSON.parse(loadedPayouts));
    if (loadedPayoutRequests) {
        try {
            setPayoutRequests(JSON.parse(loadedPayoutRequests));
        } catch (e) {
            console.error('Failed to parse payout requests', e);
        }
    }
    if (loadedPrizeExams) {
        try {
            const parsedPrize = JSON.parse(loadedPrizeExams);
            if (Array.isArray(parsedPrize) && parsedPrize.length > 0) {
                setPrizeExams(parsedPrize);
            } else {
                setPrizeExams(INITIAL_PRIZE_EXAMS);
            }
        } catch (e) {
            console.error('Failed to parse prize exams', e);
            setPrizeExams(INITIAL_PRIZE_EXAMS);
        }
    } else {
        setPrizeExams(INITIAL_PRIZE_EXAMS);
    }
    if (loadedTransactions) {
        try {
            setTransactions(JSON.parse(loadedTransactions));
        } catch (e) {
            console.error('Failed to parse transactions', e);
            setTransactions(INITIAL_TRANSACTIONS);
        }
    } else {
        setTransactions(INITIAL_TRANSACTIONS);
    }
    if (loadedSessions) setExamSessions(JSON.parse(loadedSessions));
    if (loadedPointPurchases) {
        try {
            setPointPurchases(JSON.parse(loadedPointPurchases));
        } catch (e) {
            console.error('Failed to parse point purchases', e);
        }
    }
    if (loadedAiLogs) {
        try {
            setAiUsageLogs(JSON.parse(loadedAiLogs));
        } catch (e) {
            console.error('Failed to parse AI logs', e);
        }
    }
    if (loadedManualAds) {
        try {
            const parsedAds: ManualAd[] = JSON.parse(loadedManualAds);
            if (Array.isArray(parsedAds)) {
                setManualAds(parsedAds);
            }
        } catch (e) {
            console.error('Failed to parse manual ads', e);
            setManualAds(INITIAL_MANUAL_ADS);
        }
    }
    
    if (loadedTopics) {
        try {
            const parsed = JSON.parse(loadedTopics);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
               setApprovedTopics(mergeTopicsMap(parsed));
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
  useEffect(() => { 
    localStorage.setItem('hc_language', language); 
    setSafetyLanguage(language);
  }, [language]);
  useEffect(() => { localStorage.setItem('hc_settings', JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { localStorage.setItem('hc_topics', JSON.stringify(approvedTopics)); }, [approvedTopics]);
  useEffect(() => { localStorage.setItem('hc_schools', JSON.stringify(schools)); }, [schools]);
  useEffect(() => { localStorage.setItem('hc_notifs', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('hc_subjects', JSON.stringify(availableSubjects)); }, [availableSubjects]);
  useEffect(() => { localStorage.setItem('hc_shop', JSON.stringify(shopItems)); }, [shopItems]);
  useEffect(() => { localStorage.setItem('hc_payouts', JSON.stringify(payouts)); }, [payouts]);
  useEffect(() => { localStorage.setItem('hc_payout_requests', JSON.stringify(payoutRequests)); }, [payoutRequests]);
  useEffect(() => { localStorage.setItem('hc_prize_exams', JSON.stringify(prizeExams)); }, [prizeExams]);
  useEffect(() => { localStorage.setItem('hc_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('hc_sessions', JSON.stringify(examSessions)); }, [examSessions]);
  useEffect(() => { localStorage.setItem('hc_point_purchases', JSON.stringify(pointPurchases)); }, [pointPurchases]);
  useEffect(() => { localStorage.setItem('hc_ai_logs', JSON.stringify(aiUsageLogs)); }, [aiUsageLogs]);
  useEffect(() => { localStorage.setItem('hc_manual_ads', JSON.stringify(manualAds)); }, [manualAds]);
  
  useEffect(() => {
    if (user) localStorage.setItem('hc_current_user', JSON.stringify(user));
    else localStorage.removeItem('hc_current_user');
  }, [user]);

  const t = (key: string): string => {
    return (TRANSLATIONS[language] && TRANSLATIONS[language][key as TranslationKeys]) || key;
  };

  const getSafetyFeedback = (aiReason?: string) => {
    if (language === 'tr') {
        return t('safety_warning_detail');
    }
    return aiReason || t('safety_warning_desc');
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

  const register = (newUser: User, options?: { referralCode?: string }) => {
    if (users.some(u => u.email === newUser.email)) {
        showAlert('Email already exists', 'error');
        return;
    }
    const referralInput = options?.referralCode?.trim();
    const referrer = referralInput
        ? users.find(u => u.referralCode?.toLowerCase() === referralInput.toLowerCase())
        : undefined;
    const normalizedNewUser = ensureReferralFields({
        ...newUser,
        points: 100,
        purchasedExamIds: [],
        notificationSettings: { email: true, app: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        referralCode: newUser.referralCode || generateReferralCode(),
        referredBy: referrer && referrer.id !== newUser.id ? referrer.id : undefined
    });
    setUsers(prev => [...prev, normalizedNewUser]);
    setUser(normalizedNewUser);
    addNotification(normalizedNewUser.id, t('welcome'), t('welcome_msg'), 'success');
    showAlert(t('welcome'), 'success');

    if (referrer && referrer.id !== normalizedNewUser.id) {
        const reward = systemSettings.referralRewardPoints || 0;
        const updatedReferrer = {
            ...referrer,
            points: referrer.points + reward,
            referralCount: (referrer.referralCount || 0) + 1,
            totalReferralPoints: (referrer.totalReferralPoints || 0) + reward
        };
        setUsers(prev => prev.map(u => u.id === referrer.id ? updatedReferrer : u));
        if (user && user.id === referrer.id) {
            setUser(updatedReferrer);
        }
        addNotification(referrer.id, t('referral_bonus_received'), t('referral_bonus_body').replace('{points}', `${reward}`).replace('{name}', normalizedNewUser.name), 'success');
        showAlert(t('referral_bonus_received'), 'success');
    }
  };

  const updateUser = (updatedUser: User) => {
    const userWithTimestamp = ensureReferralFields({ ...updatedUser, updatedAt: new Date().toISOString() });
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
    if (item.type === 'AVATAR_FRAME' && user.inventory.includes(item.type)) {
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

  const watchAdForPoints = () => {
    if (!user) {
        showAlert(t('login_title'), 'error');
        return;
    }
    const reward = systemSettings.adRewardPoints || 0;
    if (reward <= 0) {
        showAlert(t('ad_reward_disabled'), 'warning');
        return;
    }
    updateUser({ 
        ...user, 
        points: user.points + reward,
        lifetimeAdPoints: (user.lifetimeAdPoints || 0) + reward 
    });
    addNotification(user.id, t('ad_reward_title'), t('ad_reward_body').replace('{points}', `${reward}`), 'success');
    showAlert(t('ad_reward_title'), 'success');
  };

  const purchasePointPackage = (packageId: string): boolean => {
    if (!user) {
        showAlert(t('login_title'), 'error');
        return false;
    }
    const pkg = systemSettings.pointPackages?.find(p => p.id === packageId);
    if (!pkg) {
        showAlert(t('package_not_found'), 'error');
        return false;
    }
    updateUser({
        ...user,
        points: user.points + pkg.points,
        totalPointsPurchased: (user.totalPointsPurchased || 0) + pkg.points
    });

    const purchase: PointPurchase = {
        id: `pp-${Date.now()}`,
        userId: user.id,
        packageId: pkg.id,
        points: pkg.points,
        price: pkg.price,
        timestamp: new Date().toISOString()
    };
    setPointPurchases(prev => [purchase, ...prev]);
    addNotification(user.id, t('points_added_title'), t('points_added_body').replace('{points}', `${pkg.points}`), 'success');
    showAlert(t('points_added_title'), 'success');
    return true;
  };

  const purchaseAiCredits = (packageId: string): boolean => {
    if (!user) {
        showAlert(t('login_title'), 'error');
        return false;
    }
    if (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN) {
        showAlert(t('teacher_only_feature'), 'error');
        return false;
    }
    const pkg = systemSettings.teacherCreditPackages?.find(p => p.id === packageId);
    if (!pkg) {
        showAlert(t('package_not_found'), 'error');
        return false;
    }
    updateUser({
        ...user,
        points: user.points + pkg.points
    });
    const purchase: PointPurchase = {
        id: `ai-pp-${Date.now()}`,
        userId: user.id,
        packageId: pkg.id,
        points: pkg.points,
        price: pkg.price,
        timestamp: new Date().toISOString()
    };
    setPointPurchases(prev => [purchase, ...prev]);
    showAlert(t('points_added_title'), 'success');
    addNotification(user.id, t('points_added_title'), t('ai_credits_added_body').replace('{points}', `${pkg.points}`), 'success');
    return true;
  };

  const logAiUsage = (entry: Omit<AiUsageLog, 'id' | 'timestamp'> & { note?: string }) => {
    const log: AiUsageLog = {
        id: `ai-usage-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry
    };
    setAiUsageLogs(prev => [log, ...prev]);
  };

  const requestPayout = (amountTL: number, note?: string): boolean => {
    if (!user) {
        showAlert(t('login_title'), 'error');
        return false;
    }
    if (user.role !== UserRole.TEACHER) {
        showAlert(t('teacher_only_feature'), 'error');
        return false;
    }
    if (!amountTL || amountTL <= 0) {
        showAlert(t('payout_amount_invalid'), 'error');
        return false;
    }
    const newRequest: PayoutRequest = {
        id: `payout-req-${Date.now()}`,
        teacherId: user.id,
        teacherName: user.name,
        amountTL,
        note,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    setPayoutRequests(prev => [newRequest, ...prev]);
    addNotification(user.id, t('payout_request_received'), t('payout_request_received_body'), 'info');
    addLog('Payout Requested', `${user.name} ₺${amountTL.toFixed(2)}`, 'info');
    showAlert(t('payout_request_received'), 'success');
    return true;
  };

  const resolvePayoutRequest = (requestId: string, decision: 'approved' | 'rejected', adminNote?: string) => {
    if (user?.role !== UserRole.ADMIN) return;
    const targetRequest = payoutRequests.find(r => r.id === requestId);
    if (!targetRequest) return;
    setPayoutRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: decision, resolvedAt: new Date().toISOString(), adminId: user.id, adminNote } : r));
    if (decision === 'approved') {
        showAlert(t('payout_request_marked_paid'), 'success');
    } else {
        addNotification(targetRequest.teacherId, t('payout_request_rejected'), t('payout_request_rejected_body'), 'warning');
        showAlert(t('payout_request_rejected_short'), 'info');
    }
    addLog('Payout Request Updated', `${targetRequest.teacherName} -> ${decision}`, decision === 'approved' ? 'info' : 'warning');
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
        answers: answers,
        learningReportStatus: 'pending'
    };

    const existingResult = results.find(r => r.examId === examId && r.studentId === user.id);
    
    if (existingResult) {
        setResults(results.map(r => r.id === existingResult.id ? fullResult : r));
        showAlert('Exam result updated', 'info');
    } else {
        setResults([...results, fullResult]);
        const updatedUser = { 
            ...user, 
            points: user.points + rewardsEarned, 
            lifetimeExamPoints: (user.lifetimeExamPoints || 0) + rewardsEarned,
            updatedAt: new Date().toISOString() 
        };
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

    const subjectName = availableSubjects.find(s => s.id === exam.subjectId)?.name || exam.subjectId;
    const questionsPayload = exam.questions.map((q, idx) => ({
        index: idx,
        question: q.text,
        correctAnswer: q.options[q.correctIndex],
        studentAnswer: answers[idx] === -1 || answers[idx] === undefined ? null : q.options[answers[idx]],
        isCorrect: answers[idx] === q.correctIndex
    }));

    (async () => {
        try {
            const report = await generateLearningReport({
                examTitle: exam.title,
                subjectName,
                topic: exam.topic,
                difficulty: exam.difficulty,
                score: calculatedScore,
                totalQuestions: exam.questions.length,
                language,
                gradeLevel: user.classLevel,
                questions: questionsPayload
            });
            setResults(prev => prev.map(r => r.id === fullResult.id ? { ...r, learningReport: { ...report, generatedAt: new Date().toISOString() }, learningReportStatus: 'ready' } : r));
        } catch (error) {
            console.error('Failed to generate learning report', error);
            setResults(prev => prev.map(r => r.id === fullResult.id ? { ...r, learningReportStatus: 'failed' } : r));
        }
    })();
  };

  const addPost = async (content: string, tags?: string[], schoolId?: string, imageUrl?: string): Promise<{success: boolean, reason?: string}> => {
    if (!user) return { success: false, reason: 'Auth error' };
    if (content.length > 280) {
        showAlert('Post too long', 'error');
        return { success: false, reason: 'Length error' };
    }
    
    const safetyResult = await checkContentSafety(content);
    if (!safetyResult.safe) {
        const localizedReason = getSafetyFeedback(safetyResult.reason);
        addNotification(user.id, t('content_unsafe'), localizedReason, 'error');
        return { success: false, reason: localizedReason };
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
          showAlert(getSafetyFeedback(safetyResult.reason), 'error');
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
      setSystemSettings(mergeSettings(settings));
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

  const bulkImportSchools = (entries: Array<{ id?: string; name: string; city?: string }>) => {
      setSchools(prev => {
          const updated = [...prev];
          entries.forEach(entry => {
              if (!entry.name) return;
              const target = entry.id ? updated.find(s => s.id === entry.id) : updated.find(s => s.name.toLowerCase() === entry.name.toLowerCase());
              if (target) {
                  target.name = entry.name || target.name;
                  target.city = entry.city || target.city;
              } else {
                  updated.push({
                      id: entry.id || `sch-${Date.now()}-${Math.random()}`,
                      name: entry.name,
                      city: entry.city || '',
                      createdAt: new Date().toISOString()
                  });
              }
          });
          return updated;
      });
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

  const bulkImportSubjects = (entries: Array<{ id?: string; name: string; grades?: number[] }>) => {
      setAvailableSubjects(prev => {
          const updated = [...prev];
          entries.forEach(entry => {
              if (!entry.name) return;
              const target = entry.id ? updated.find(s => s.id === entry.id) : updated.find(s => s.name.toLowerCase() === entry.name.toLowerCase());
              const grades = entry.grades && entry.grades.length ? entry.grades : target?.grades;
              if (target) {
                  target.name = entry.name || target.name;
                  target.grades = grades || target.grades;
              } else {
                  updated.push({
                      id: entry.id || `sub-${Date.now()}-${Math.random()}`,
                      name: entry.name,
                      grades: grades || []
                  });
              }
          });
          return updated;
      });
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

  const addManualAd = (payload: Omit<ManualAd, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (user?.role !== UserRole.ADMIN) return;
      const newAd: ManualAd = {
          ...payload,
          id: `ad-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      setManualAds(prev => [newAd, ...prev]);
      showAlert(t('ad_created'), 'success');
  };

  const updateManualAd = (updated: ManualAd) => {
      if (user?.role !== UserRole.ADMIN) return;
      setManualAds(prev => prev.map(ad => ad.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : ad));
      showAlert(t('ad_updated'), 'success');
  };

  const deleteManualAd = (id: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      setManualAds(prev => prev.filter(ad => ad.id !== id));
      showAlert(t('ad_deleted'), 'info');
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

  const pickRandomSubset = <T,>(items: T[], count: number): T[] => {
      const pool = [...items];
      for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, count);
  };

  const updatePrizeExamMeta = (prizeExamId: string, data: Partial<PrizeExam>) => {
      if (user?.role !== UserRole.ADMIN) return;
      setPrizeExams(prev => prev.map(pe => pe.id === prizeExamId ? { ...pe, ...data } : pe));
  };

  const bulkImportTopics = (entries: Array<{ subjectId: string; name: string; grade?: number; level?: string }>) => {
      setApprovedTopics(prev => {
          const updated = { ...prev };
          entries.forEach(entry => {
              if (!entry.subjectId || !entry.name) return;
              const list = updated[entry.subjectId] ? [...updated[entry.subjectId]] : [];
              if (!list.some(topic => topic.name.toLowerCase() === entry.name.toLowerCase() && topic.grade === entry.grade && topic.level === entry.level)) {
                  list.push({ name: entry.name, grade: entry.grade, level: entry.level });
              }
              updated[entry.subjectId] = list;
          });
          return updated;
      });
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
      
      const now = new Date().toISOString();
      if (topScorers.length === 1) {
          const winnerResult = topScorers[0];
          const winnerUser = users.find(u => u.id === winnerResult.studentId);
          if (!winnerUser) {
              showAlert('Winner user not found.', 'error');
              return;
          }
          const winnerSchool = winnerUser.schoolId ? schools.find(s => s.id === winnerUser.schoolId)?.name : undefined;
          setPrizeExams(prev => prev.map(pe => 
              pe.id === prizeExamId 
              ? { 
                  ...pe, 
                  isActive: false, 
                  winnerId: winnerUser.id, 
                  winnerName: winnerUser.name, 
                  winnerSchool,
                  winnerClassLevel: winnerUser.classLevel,
                  drawDate: now,
                  finalists: undefined,
                  finalistNote: undefined,
                  finalistQuizDate: undefined,
                  finalistQuizLink: undefined
                } 
              : pe
          ));
          addNotification(winnerUser.id, '🎉 You Won!', `Congratulations! You won the prize for ${prizeExam.prizeTitle}!`, 'success', '/student/prize-exams');
          addLog('Prize Draw', `${prizeExam.month} Winner: ${winnerUser.name}`, 'info');
          showAlert(t('prize_winner_declared').replace('{name}', winnerUser.name), 'success');
      } else {
          const finalistsCount = Math.min(3, topScorers.length);
          const selected = pickRandomSubset(topScorers, finalistsCount);
          const finalists = selected.map(result => {
              const finalistUser = users.find(u => u.id === result.studentId);
              if (!finalistUser) return null;
              const schoolName = finalistUser.schoolId ? schools.find(s => s.id === finalistUser.schoolId)?.name : undefined;
              return {
                  userId: finalistUser.id,
                  name: finalistUser.name,
                  schoolName,
                  classLevel: finalistUser.classLevel
              };
          }).filter((f): f is PrizeFinalist => !!f);

          if (!finalists.length) {
              showAlert('Unable to determine finalists.', 'error');
              return;
          }

          const finalistNote = t('prize_finalists_note');
          setPrizeExams(prev => prev.map(pe => 
              pe.id === prizeExamId 
              ? { 
                  ...pe, 
                  isActive: false, 
                  finalists,
                  finalistNote,
                  winnerId: undefined,
                  winnerName: undefined,
                  winnerSchool: undefined,
                  winnerClassLevel: undefined,
                  drawDate: now,
                  finalistQuizDate: pe.finalistQuizDate,
                  finalistQuizLink: pe.finalistQuizLink
                } 
              : pe
          ));
          finalists.forEach(finalist => {
              addNotification(finalist.userId, t('prize_finalists_title'), t('prize_finalist_notification'), 'info', '/student/prize-exams');
          });
          addLog('Prize Finalists Selected', `${prizeExam.month} • ${finalists.length} finalists`, 'info');
          showAlert(t('prize_finalists_selected').replace('{count}', `${finalists.length}`), 'info');
      }
  };

  const payEntryFee = (prizeExamId: string, amount: number): boolean => {
      if (!user) return false;
      if (user.points >= amount) {
          updateUser({ ...user, points: user.points - amount, updatedAt: new Date().toISOString() });
          
          const updatedPrizeExams = prizeExams.map(pe => {
              if (pe.id === prizeExamId) {
                  const participants = pe.participants || [];
                  if (participants.includes(user.id)) return pe;
                  return { ...pe, participants: [...participants, user.id] };
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
      user, users, exams, posts, results, messages, language, systemSettings, logs, approvedTopics, schools, notifications, availableSubjects, shopItems, payouts, payoutRequests, prizeExams, transactions, examSessions, pointPurchases, aiUsageLogs, manualAds,
      login, logout, register, updateUser, banUser, deleteUser, changeRole, resetPassword, sendPasswordResetEmail,
      addExam, updateExam, deleteExam, purchaseExam, purchaseItem, toggleEquip, startExamSession, saveResult, addPost, deletePost, toggleLike, toggleDislike, addComment, reportPost, dismissReport, sendMessage, markMessageRead, updateSystemSettings,
      addTopic, removeTopic, addSchool, removeSchool, markNotificationRead, addSubject, removeSubject, toggleFollow,
      addShopItem, deleteShopItem, sendBroadcast, adjustUserPoints, processPayout, deleteExamImage, watchAdForPoints, purchasePointPackage, purchaseAiCredits, logAiUsage, requestPayout, resolvePayoutRequest,
      addPrizeExam, drawPrizeWinner, payEntryFee,
      updatePrizeExamMeta, bulkImportSchools, bulkImportSubjects, bulkImportTopics, addManualAd, updateManualAd, deleteManualAd,
      alert, showAlert, setLanguage, t
    }}>
      {children}
    </StoreContext.Provider>
  );
};

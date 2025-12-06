
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserRole, ShopItem, PrizeExam, ManualAd, ManualAdPlacement, TopicMetadata } from '../../types';
import { ShieldAlert, CheckCircle, Ban, Search, Users, BookOpen, AlertTriangle, DollarSign, Trash2, Edit2, PieChart, Bookmark, Plus, LucideIcon, X, School as SchoolIcon, Layers, Megaphone, Radio, Image as ImageIcon, Coins, CreditCard, ShoppingBag, History, ChevronDown, Check, Eye, Gift, Trophy, Upload, Calendar, Star, Sparkles, Receipt, ArrowRight, Loader2, FileText, Image, AlertOctagon, Link as LinkIcon, Download, UploadCloud } from 'lucide-react';
import { getTrackedAdEvents, StoredAdTrackingEvent } from '../../services/adTrackingService';
import * as XLSX from 'xlsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadMedia } from '../../services/mediaService';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

export const AdminDashboard = () => {
  const { 
      users, exams, posts, logs, banUser, deleteUser, changeRole, deletePost, dismissReport, deleteExam, systemSettings, 
      approvedTopics, addTopic, removeTopic, schools, addSchool, removeSchool, availableSubjects, addSubject, removeSubject, 
      shopItems, addShopItem, deleteShopItem, sendBroadcast, adjustUserPoints, payouts, payoutRequests, processPayout, resolvePayoutRequest, deleteExamImage, reportPost,
      prizeExams, addPrizeExam, drawPrizeWinner, results, updatePrizeExamMeta, bulkImportSchools, bulkImportSubjects, bulkImportTopics,
      manualAds, addManualAd, updateManualAd, deleteManualAd, socialTopics, addSocialTopic, removeSocialTopic,
      user: currentUser, t, showAlert, formatDisplayName
  } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Tab Handling
  const getActiveTab = () => {
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/reports')) return 'reports';
    if (location.pathname.includes('/exams')) return 'exams';
    if (location.pathname.includes('/logs')) return 'logs';
    if (location.pathname.includes('/financials')) return 'financials';
    if (location.pathname.includes('/definitions')) return 'definitions';
    if (location.pathname.includes('/shop')) return 'shop';
    if (location.pathname.includes('/media')) return 'media';
    if (location.pathname.includes('/ads')) return 'ads';
    if (location.pathname.includes('/prize-exams')) return 'prize-exams';
    return 'overview';
  };
  const activeTab = getActiveTab();

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [examSearch, setExamSearch] = useState('');
  
  // Definitions State
  const [newTopic, setNewTopic] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectGrades, setNewSubjectGrades] = useState<number[]>([]);
  const [selectedSubjectIdForTopic, setSelectedSubjectIdForTopic] = useState<string>(availableSubjects[0]?.id || 'sub-math');
  const [topicGrade, setTopicGrade] = useState<number>(5);
  const [topicLevel, setTopicLevel] = useState<string>('A1');

  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastRole, setBroadcastRole] = useState<UserRole | 'ALL'>('ALL');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Shop State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemIcon, setNewItemIcon] = useState('');
  const [newItemType, setNewItemType] = useState<'AVATAR_FRAME' | 'JOKER_5050' | 'JOKER_SKIP'>('AVATAR_FRAME');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Points/Payout Modal State
  const [adjustPointsUserId, setAdjustPointsUserId] = useState<string | null>(null);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [payoutTeacherId, setPayoutTeacherId] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState(0);

  // Prize Exam State
  const [prizeExamId, setPrizeExamId] = useState('');
  const [prizeGrade, setPrizeGrade] = useState(1);
  const [prizeTitle, setPrizeTitle] = useState('');
  const [prizeDesc, setPrizeDesc] = useState('');
  const [prizeImage, setPrizeImage] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewParticipantsId, setViewParticipantsId] = useState<string | null>(null);
  const [editingQuizInfo, setEditingQuizInfo] = useState<{ id: string; date: string; link: string }>({ id: '', date: '', link: '' });
  const [showQuizModal, setShowQuizModal] = useState(false);
  const adPlacementOptions: { value: ManualAdPlacement; label: string }[] = [
      { value: 'exam', label: t('ad_placement_exam') },
      { value: 'social', label: t('ad_placement_social') },
      { value: 'both', label: t('ad_placement_both') },
  ];
  const emptyAdForm = (): Omit<ManualAd, 'id' | 'createdAt' | 'updatedAt'> => ({
      title: '',
      description: '',
      imageUrl: '',
      ctaText: '',
      ctaUrl: '',
      placement: 'exam',
      isActive: true,
      highlightLabel: ''
  });
  const [adForm, setAdForm] = useState<Omit<ManualAd, 'id' | 'createdAt' | 'updatedAt'>>(emptyAdForm());
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [adEvents, setAdEvents] = useState<StoredAdTrackingEvent[]>([]);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // Derived Values
  const totalUsers = users.length;
  const activeExamsCount = exams.filter(e => e.isPublished).length;
  const reportedPosts = posts.filter(p => p.isReported);
  const estimatedRevenuePoints = exams.reduce((acc, curr) => acc + (curr.sales * curr.price * (systemSettings.commissionRate / 100)), 0);
  const estimatedRevenueTL = estimatedRevenuePoints * systemSettings.pointConversionRate;
  const pendingPayoutRequests = payoutRequests.filter(req => req.status === 'pending');

  // Filtered Data
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(examSearch.toLowerCase()) ||
    e.creatorName.toLowerCase().includes(examSearch.toLowerCase())
  );

  const resolveUserDisplay = (userId: string, fallbackName: string, fallbackUsername?: string) => {
      const match = users.find(u => u.id === userId);
      if (match) return formatDisplayName(match, { withAt: true });
      if (fallbackUsername) return `@${fallbackUsername}`;
      return fallbackName;
  };

  // Logic for Valid Grades based on Selected Subject
  const currentSubjectDef = availableSubjects.find(s => s.id === selectedSubjectIdForTopic);
  const validGradesForTopic = useMemo(() => currentSubjectDef ? currentSubjectDef.grades : Array.from({length: 12}, (_, i) => i + 1), [currentSubjectDef]);

  useEffect(() => {
      if (validGradesForTopic.length > 0 && !validGradesForTopic.includes(topicGrade)) {
          setTopicGrade(validGradesForTopic[0]);
      }
  }, [validGradesForTopic, topicGrade]);

  useEffect(() => {
      setAdEvents(getTrackedAdEvents());
  }, []);

  // Handlers
  const handleTabChange = (tab: string) => {
      if (tab === 'overview') navigate('/admin');
      else navigate(`/admin/${tab}`);
  };

  const handleAddTopic = () => {
      if(newTopic.trim()) {
          const isEnglish = currentSubjectDef?.id === 'sub-eng';
          addTopic(
              selectedSubjectIdForTopic, 
              newTopic.trim(), 
              isEnglish ? undefined : topicGrade, 
              isEnglish ? topicLevel : undefined
          );
          setNewTopic('');
      }
  };

  const handleAddSchool = () => { if(newSchoolName.trim()) { addSchool(newSchoolName.trim()); setNewSchoolName(''); } };
  
  const handleToggleGrade = (grade: number) => {
      if (newSubjectGrades.includes(grade)) setNewSubjectGrades(newSubjectGrades.filter(g => g !== grade));
      else setNewSubjectGrades([...newSubjectGrades, grade].sort((a,b) => a-b));
  };

  const handleAddSubject = () => {
      if (newSubjectName.trim() && newSubjectGrades.length > 0) {
          addSubject(newSubjectName.trim(), newSubjectGrades);
          setNewSubjectName('');
          setNewSubjectGrades([]);
      }
  };

  const handleSendBroadcast = () => {
      if (broadcastTitle && broadcastMsg) {
          sendBroadcast(broadcastTitle, broadcastMsg, broadcastRole);
          setBroadcastTitle('');
          setBroadcastMsg('');
          setShowBroadcastModal(false);
      }
  };

  const handleAddItem = () => {
      if (newItemName && newItemPrice > 0 && newItemIcon) {
          addShopItem({
              id: `item-${Date.now()}`,
              name: newItemName,
              price: newItemPrice,
              icon: newItemIcon,
              type: newItemType,
              description: newItemDesc
          });
          setNewItemName(''); setNewItemPrice(0); setNewItemIcon(''); setNewItemDesc('');
      }
  };

  const handleAdjustPoints = () => {
      if (adjustPointsUserId && pointsAmount !== 0) {
          adjustUserPoints(adjustPointsUserId, pointsAmount);
          setAdjustPointsUserId(null); setPointsAmount(0);
      }
  };

  const handlePayout = () => {
      if (payoutTeacherId && payoutAmount > 0) {
          processPayout(payoutTeacherId, payoutAmount);
          setPayoutTeacherId(null); setPayoutAmount(0);
      }
  };

  const handleApproveRequest = (requestId: string) => {
      const req = payoutRequests.find(r => r.id === requestId);
      if (!req) return;
      processPayout(req.teacherId, req.amountTL);
      resolvePayoutRequest(req.id, 'approved');
  };

  const handleRejectRequest = (requestId: string) => {
      const note = window.prompt(t('optional_note_placeholder'), '');
      resolvePayoutRequest(requestId, 'rejected', note || undefined);
  };

  const handlePrizeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsUploading(true);
          try {
              const url = await uploadMedia(file);
              setPrizeImage(url);
          } catch (error) {
              console.error(error);
          } finally {
              setIsUploading(false);
          }
      }
  };

  const handleCreatePrizeExam = () => {
      if (prizeExamId && prizeGrade && prizeTitle && prizeDesc && prizeImage) {
          addPrizeExam({
              id: `pe-${Date.now()}`,
              examId: prizeExamId,
              grade: prizeGrade,
              prizeTitle,
              prizeDescription: prizeDesc,
              prizeImage,
              entryFee,
              month: new Date().toISOString().slice(0, 7),
              isActive: true
          });
          setPrizeExamId(''); setPrizeTitle(''); setPrizeDesc(''); setPrizeImage(''); setEntryFee(0);
      }
  };

  const resetAdForm = () => {
      setAdForm(emptyAdForm());
      setEditingAdId(null);
  };

  const handleAdSubmit = () => {
      if (!adForm.title.trim()) {
          showAlert(t('ad_title_required'), 'error');
          return;
      }
      if (editingAdId) {
          const existing = manualAds.find(ad => ad.id === editingAdId);
          if (!existing) return;
          updateManualAd({ ...existing, ...adForm });
      } else {
          addManualAd(adForm);
      }
      resetAdForm();
  };

  const handleEditAd = (ad: ManualAd) => {
      setAdForm({
          title: ad.title,
          description: ad.description || '',
          imageUrl: ad.imageUrl || '',
          ctaText: ad.ctaText || '',
          ctaUrl: ad.ctaUrl || '',
          placement: ad.placement,
          isActive: ad.isActive,
          highlightLabel: ad.highlightLabel || ''
      });
      setEditingAdId(ad.id);
  };

  const handleDeleteAd = (id: string) => {
      if (window.confirm(t('ad_delete_confirm') || 'Delete this ad?')) {
          deleteManualAd(id);
          if (editingAdId === id) {
              resetAdForm();
          }
      }
  };

  const toggleAdStatus = (ad: ManualAd) => {
      updateManualAd({ ...ad, isActive: !ad.isActive });
  };

  const handleExcelDownload = () => {
      const schoolSheet = schools.map(s => ({
          id: s.id,
          name: s.name,
          city: s.city || '',
          district: s.updatedAt || '',
          status: s.isDeleted ? 'inactive' : 'active'
      }));
      const subjectSheet = availableSubjects.map(sub => ({
          id: sub.id,
          name: sub.name,
          grades: sub.grades.join(','),
          status: 'active'
      }));
      const topicRows: Array<{ subject_id: string; name: string; grade?: number; level?: string }> = [];
      const topicEntries = Object.entries(approvedTopics) as Array<[string, TopicMetadata[]]>;
      topicEntries.forEach(([subId, topics]) => {
          topics.forEach(topic => {
              topicRows.push({
                  subject_id: subId,
                  name: topic.name,
                  grade: topic.grade,
                  level: topic.level
              });
          });
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(schoolSheet || []), 'Schools');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(subjectSheet || []), 'Subjects');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(topicRows || []), 'Topics');
      XLSX.writeFile(workbook, 'helloclass-hierarchy.xlsx');
  };

  const handleExcelUpload = (evt: React.ChangeEvent<HTMLInputElement>) => {
      const file = evt.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const schoolsSheet = workbook.Sheets['Schools'];
          const subjectsSheet = workbook.Sheets['Subjects'];
          const topicsSheet = workbook.Sheets['Topics'];

          if (schoolsSheet) {
              const rows: any[] = XLSX.utils.sheet_to_json(schoolsSheet);
              const entries = rows.map(row => ({
                  id: row.id,
                  name: row.name,
                  city: row.city
              })).filter(entry => entry.name);
              if (entries.length) bulkImportSchools(entries);
          }

          if (subjectsSheet) {
              const rows: any[] = XLSX.utils.sheet_to_json(subjectsSheet);
              const entries = rows.map(row => ({
                  id: row.id,
                  name: row.name,
                  grades: typeof row.grades === 'string'
                      ? row.grades.split(',').map((g: string) => Number(g.trim())).filter(Boolean)
                      : Array.isArray(row.grades) ? row.grades : undefined
              })).filter(entry => entry.name);
              if (entries.length) bulkImportSubjects(entries);
          }

          if (topicsSheet) {
              const rows: any[] = XLSX.utils.sheet_to_json(topicsSheet);
              const entries = rows.map(row => ({
                  subjectId: row.subject_id || row.subjectId,
                  name: row.name,
                  grade: row.grade ? Number(row.grade) : undefined,
                  level: row.level
              })).filter(entry => entry.subjectId && entry.name);
              if (entries.length) bulkImportTopics(entries);
          }

          showAlert(t('excel_import_success') || 'Excel imported', 'success');
      };
      reader.readAsArrayBuffer(file);
      evt.target.value = '';
  };
  const adMetrics = useMemo(() => {
      const map = new Map<string, {
          ad: ManualAd | undefined;
          impressions: number;
          clicks: number;
          locations: Record<string, number>;
          lastTimestamp?: string;
      }>();
      manualAds.forEach(ad => {
          map.set(ad.id, { ad, impressions: 0, clicks: 0, locations: {} });
      });
      adEvents.forEach(evt => {
          if (!map.has(evt.adId)) {
              map.set(evt.adId, { ad: manualAds.find(a => a.id === evt.adId), impressions: 0, clicks: 0, locations: {} });
          }
          const entry = map.get(evt.adId)!;
          if (evt.type === 'impression') entry.impressions += 1;
          if (evt.type === 'click') entry.clicks += 1;
          if (evt.locationHint) {
              entry.locations[evt.locationHint] = (entry.locations[evt.locationHint] || 0) + 1;
          }
          entry.lastTimestamp = evt.timestamp;
      });
      return Array.from(map.values()).filter(entry => entry.ad);
  }, [adEvents, manualAds]);

  const handleRefreshAdStats = () => {
      setAdEvents(getTrackedAdEvents());
  };

  const openQuizModal = (exam: PrizeExam) => {
      setEditingQuizInfo({
          id: exam.id,
          date: exam.finalistQuizDate ? exam.finalistQuizDate.slice(0, 16) : '',
          link: exam.finalistQuizLink || ''
      });
      setShowQuizModal(true);
  };

  const handleSaveQuizInfo = () => {
      if (!editingQuizInfo.id) return;
      updatePrizeExamMeta(editingQuizInfo.id, {
          finalistQuizDate: editingQuizInfo.date ? new Date(editingQuizInfo.date).toISOString() : undefined,
          finalistQuizLink: editingQuizInfo.link || undefined
      });
      setShowQuizModal(false);
  };

  const getParticipants = (examId: string) => {
      return results.filter(r => r.examId === examId).map(r => {
          const u = users.find(u => u.id === r.studentId);
          return { ...r, studentName: u?.name, studentAvatar: u?.avatar };
      });
  };

  const handleConfirmReport = (postId: string, action: 'dismiss' | 'delete') => {
      if (action === 'delete') deletePost(postId);
      else dismissReport(postId);
  };

  const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow group">
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
        </div>
    </div>
  );

  const tabOptions = ['overview', 'users', 'exams', 'financials', 'shop', 'media', 'ads', 'definitions', 'reports', 'logs', 'prize-exams'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6">
         <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('admin_panel')}</h2>
         
         <div className="md:hidden relative">
            <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="w-full appearance-none bg-white p-4 rounded-2xl border border-gray-300 text-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-gray-900 shadow-sm"
            >
                {tabOptions.map(tab => (
                    <option key={tab} value={tab}>{t(tab as any) || tab}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
         </div>

         <div className="hidden md:flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto max-w-full no-scrollbar pr-4">
             {tabOptions.map((tab) => (
                 <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                 >
                     {t(tab as any) || tab}
                     {tab === 'reports' && reportedPosts.length > 0 && (
                         <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{reportedPosts.length}</span>
                     )}
                 </button>
             ))}
         </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label={t('total_users')} value={totalUsers} color="bg-blue-500" />
                <StatCard icon={BookOpen} label={t('active_exams')} value={activeExamsCount} color="bg-purple-500" />
                <StatCard icon={AlertTriangle} label={t('pending_reports')} value={reportedPosts.length} color="bg-red-500" />
                <StatCard icon={DollarSign} label={t('est_revenue')} value={`₺${estimatedRevenueTL.toFixed(2)}`} color="bg-emerald-500" />
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-900">{t('broadcast')}</h3>
                    <button onClick={() => setShowBroadcastModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                        <Megaphone size={16} /> {t('send_broadcast')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-xl text-gray-900">{t('reports')}</h3>
              {reportedPosts.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500">
                      <CheckCircle size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
                      <p className="font-bold">{t('no_reports')}</p>
                  </div>
              ) : (
                  <div className="grid gap-4">
                      {reportedPosts.map(post => {
                          const authorDisplay = resolveUserDisplay(post.authorId, post.authorName, post.authorUsername);
                          return (
                          <div key={post.id} className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold uppercase">{post.reportReason || 'Unspecified'}</span>
                                      <span className="text-gray-400 text-xs">ID: {post.id}</span>
                                  </div>
                                  <p className="text-gray-900 font-medium mb-2 bg-gray-50 p-3 rounded-xl">{post.content}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                                      <span>
                                        Author:{' '}
                                        <span className="font-bold text-gray-800">
                                          {authorDisplay}
                                        </span>
                                      </span>
                                      {post.authorName && authorDisplay.startsWith('@') && (
                                        <span className="text-xs text-gray-400">({post.authorName})</span>
                                      )}
                                  </div>
                              </div>
                              <div className="flex flex-col justify-center gap-2 md:w-32">
                                  <button onClick={() => handleConfirmReport(post.id, 'delete')} className="bg-red-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-sm">Delete Post</button>
                                  <button onClick={() => handleConfirmReport(post.id, 'dismiss')} className="bg-gray-100 text-gray-600 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Ignore</button>
                              </div>
                          </div>
                      );})}
                  </div>
              )}
          </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 animate-fade-in">
              <h3 className="font-bold text-lg text-gray-900 mb-6">{t('logs')}</h3>
              <div className="overflow-x-auto relative">
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden pointer-events-none"></div>
                  <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold"><tr><th className="p-4 pl-6">Admin</th><th className="p-4">Action</th><th className="p-4">Target</th><th className="p-4">Date</th></tr></thead>
                      <tbody className="divide-y divide-gray-100">
                          {logs.map(log => (
                              <tr key={log.id} className="hover:bg-gray-50">
                                  <td className="p-4 pl-6 font-bold text-gray-800">{log.adminName}</td>
                                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'danger' ? 'bg-red-100 text-red-600' : log.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>{log.action}</span></td>
                                  <td className="p-4 text-gray-600 text-sm font-mono">{log.target}</td>
                                  <td className="p-4 text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Ads Tab */}
      {activeTab === 'ads' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                      <div>
                          <h3 className="font-bold text-lg text-gray-900">{t('ad_management')}</h3>
                          <p className="text-sm text-gray-500">{t('ad_preview')}</p>
                      </div>
                      {editingAdId && (
                          <button onClick={resetAdForm} className="text-sm font-bold text-gray-500 hover:text-gray-800">
                              {t('cancel')}
                          </button>
                      )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_title')}</label>
                              <input value={adForm.title} onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-500" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_description')}</label>
                              <textarea value={adForm.description} onChange={(e) => setAdForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-500"></textarea>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_cta_text')}</label>
                                  <input value={adForm.ctaText} onChange={(e) => setAdForm(prev => ({ ...prev, ctaText: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-500" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_cta_url')}</label>
                                  <input value={adForm.ctaUrl} onChange={(e) => setAdForm(prev => ({ ...prev, ctaUrl: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-500" />
                              </div>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_image_url')}</label>
                              <input value={adForm.imageUrl} onChange={(e) => setAdForm(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-500" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_highlight_label')}</label>
                              <input value={adForm.highlightLabel} onChange={(e) => setAdForm(prev => ({ ...prev, highlightLabel: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-500" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_placement')}</label>
                                  <select value={adForm.placement} onChange={(e) => setAdForm(prev => ({ ...prev, placement: e.target.value as ManualAdPlacement }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-500">
                                      {adPlacementOptions.map(option => (
                                          <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ad_status')}</label>
                                  <button onClick={() => setAdForm(prev => ({ ...prev, isActive: !prev.isActive }))} className={`w-full h-[50px] rounded-xl border font-bold ${adForm.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                      {adForm.isActive ? t('ad_active') : t('ad_inactive')}
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-6">
                      <button onClick={handleAdSubmit} className="px-6 py-3 rounded-2xl font-bold text-white bg-gray-900 hover:bg-gray-800">
                          {editingAdId ? t('ad_save') : t('ad_create')}
                      </button>
                      {editingAdId && (
                          <button onClick={resetAdForm} className="px-6 py-3 rounded-2xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50">
                              {t('cancel')}
                          </button>
                      )}
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {manualAds.length === 0 ? (
                      <div className="col-span-full bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400">
                          {t('ad_empty')}
                      </div>
                  ) : manualAds.map(ad => (
                      <div key={ad.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                          {ad.imageUrl && (
                              <div className="h-40 bg-gray-100 overflow-hidden">
                                  <img src={ad.imageUrl} className="w-full h-full object-cover" />
                              </div>
                          )}
                          <div className="p-5 flex-1 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                      {ad.isActive ? t('ad_active') : t('ad_inactive')}
                                  </span>
                                  <span className="text-xs font-bold text-gray-400 uppercase">{t('ad_placement')} · {adPlacementOptions.find(p => p.value === ad.placement)?.label}</span>
                              </div>
                              <div>
                                  {ad.highlightLabel && <span className="text-[10px] font-black text-amber-600 uppercase">{ad.highlightLabel}</span>}
                                  <h4 className="text-lg font-bold text-gray-900">{ad.title}</h4>
                                  {ad.description && <p className="text-sm text-gray-500 mt-1 line-clamp-3">{ad.description}</p>}
                              </div>
                              {ad.ctaText && ad.ctaUrl && (
                                  <a href={ad.ctaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800">
                                      {ad.ctaText}
                                  </a>
                              )}
                          </div>
                          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex gap-2">
                                  <button onClick={() => toggleAdStatus(ad)} className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                                      {ad.isActive ? t('ad_inactive') : t('ad_active')}
                                  </button>
                                  <button onClick={() => handleEditAd(ad)} className="px-3 py-2 rounded-xl text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50">
                                      {t('edit')}
                                  </button>
                              </div>
                              <button onClick={() => handleDeleteAd(ad.id)} className="px-3 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50">
                                  {t('delete')}
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                          <h4 className="font-bold text-lg text-gray-900">{t('ad_stats')}</h4>
                          <p className="text-sm text-gray-500">{t('ad_stats_desc')}</p>
                      </div>
                      <button onClick={handleRefreshAdStats} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50">
                          {t('refresh')}
                      </button>
                  </div>
                  {adMetrics.length === 0 ? (
                      <div className="text-sm text-gray-400 text-center py-6">{t('ad_no_stats')}</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {adMetrics.map(metric => (
                              <div key={`metric-${metric.ad?.id}`} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('ad_title')}</p>
                                          <p className="font-bold text-gray-900">{metric.ad?.title || metric.ad?.id}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-bold uppercase text-gray-400">{t('ad_last_event')}</p>
                                          <p className="text-xs text-gray-500">{metric.lastTimestamp ? new Date(metric.lastTimestamp).toLocaleString() : '-'}</p>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                                          <p className="text-xs font-bold text-gray-500 uppercase">{t('impressions')}</p>
                                          <p className="text-2xl font-black text-gray-900">{metric.impressions}</p>
                                      </div>
                                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                                          <p className="text-xs font-bold text-gray-500 uppercase">{t('clicks')}</p>
                                          <p className="text-2xl font-black text-gray-900">{metric.clicks}</p>
                                      </div>
                                  </div>
                                  {Object.keys(metric.locations).length > 0 && (
                                      <div>
                                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('ad_location_stats')}</p>
                                          <div className="flex flex-wrap gap-2">
                                              {Object.entries(metric.locations).map(([location, count]) => (
                                                  <span key={location} className="px-2 py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-700">
                                                      {location} · {count}
                                                  </span>
                                              ))}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 animate-fade-in">
              <h3 className="font-bold text-lg text-gray-900 mb-6">{t('media_lib')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {exams.flatMap(e => 
                      e.questions.flatMap((q, qIdx) => {
                          const images = [];
                          if (q.imageUrl) images.push({ id: `img-q-${q.id}`, url: q.imageUrl, examId: e.id, examTitle: e.title, type: 'question' as const, questionId: q.id });
                          if (q.explanationImage) images.push({ id: `img-exp-${q.id}`, url: q.explanationImage, examId: e.id, examTitle: e.title, type: 'explanation' as const, questionId: q.id });
                          q.optionImages?.forEach((optImg, oIdx) => {
                              if (optImg) images.push({ id: `img-opt-${q.id}-${oIdx}`, url: optImg, examId: e.id, examTitle: e.title, type: 'option' as const, questionId: q.id, index: oIdx });
                          });
                          return images;
                      })
                  ).map(img => (
                      <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                          <img src={img.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                              <p className="text-white text-[10px] font-bold line-clamp-2 mb-2">{img.examTitle}</p>
                              <button 
                                onClick={() => { if(window.confirm('Delete this image?')) deleteExamImage(img.examId, img.questionId, img.type, img.index); }}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                  ))}
                  {exams.flatMap(e => e.questions.filter(q => q.imageUrl || q.explanationImage || q.optionImages?.some(i => i))).length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-400">
                          <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                          <p>{t('no_media')}</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Prize Exams Tab - Competition Studio */}
      {activeTab === 'prize-exams' && (
          <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-[2] bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                      <div className="mb-8">
                          <h3 className="font-black text-2xl text-gray-900 flex items-center gap-3">
                              <span className="p-3 bg-pink-50 rounded-2xl text-pink-500"><Sparkles size={24} /></span>
                              {t('admin_prize_studio')}
                          </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('grade')}</label>
                                  <select value={prizeGrade} onChange={e => setPrizeGrade(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-pink-200">
                                      {Array.from({length: 12}, (_, i) => i + 1).map(g => <option key={g} value={g}>{g}. {t('grade')}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('select_exam')}</label>
                                  <select value={prizeExamId} onChange={e => setPrizeExamId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-pink-200">
                                  <option value="">{t('choose_exam')}</option>
                                      {exams.filter(e => e.classLevel === prizeGrade && e.isPublished).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <input value={prizeTitle} onChange={e => setPrizeTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-pink-300" placeholder={t('prize_title')} />
                              <input value={prizeDesc} onChange={e => setPrizeDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium text-gray-800 outline-none focus:border-pink-300" placeholder={t('prize_desc')} />
                              <input type="number" min="0" value={entryFee} onChange={e => setEntryFee(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium text-gray-800 outline-none focus:border-pink-300" placeholder={t('entry_fee')} />
                          </div>
                      </div>
                      <div className="mb-8" onClick={() => !isUploading && fileInputRef.current?.click()}>
                          <div className={`border-2 border-dashed border-gray-300 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 hover:border-pink-300 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePrizeImageUpload} />
                              {isUploading ? <Loader2 className="animate-spin text-brand-600 mb-2" /> : <Upload className="text-gray-400 mb-2" size={24} />}
                              <p className="text-xs font-bold text-gray-500">{isUploading ? t('uploading') : t('upload_prize_image')}</p>
                          </div>
                      </div>
                      <button onClick={handleCreatePrizeExam} disabled={!prizeExamId || !prizeTitle || !prizeImage || isUploading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:bg-gray-800 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Trophy className="text-yellow-400" size={24} /> {t('publish_contest')}</button>
                  </div>
                  <div className="flex-1">
                      <div className="lg:sticky lg:top-8">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Eye size={16} /> {t('live_preview')}</h4>
                          <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-gray-900 relative max-w-sm mx-auto">
                              <div className="bg-gray-50 p-4">
                                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-pink-100">
                                      <div className="h-32 bg-gray-200 relative">
                                          {prizeImage ? <img src={prizeImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-gray-400" /></div>}
                                      </div>
                                      <div className="p-4">
                                          <h2 className="text-lg font-black text-gray-900 mb-1">{prizeTitle || t('prize_title_preview')}</h2>
                                          <p className="text-xs text-gray-500 mb-2">{prizeDesc || t('prize_desc_preview')}</p>
                                          {entryFee > 0 && <div className="text-xs font-bold text-yellow-600">{entryFee} {t('points')} {t('entry_fee_suffix')}</div>}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="mt-12">
                  <h3 className="font-bold text-xl text-gray-800 mb-6">{t('active_and_past_contests')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {prizeExams.map(pe => (
                          <div key={pe.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
                              <div className="flex gap-4 mb-4">
                                  <img src={pe.prizeImage} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                  <div>
                                      <div className="font-bold text-gray-800 line-clamp-1">{pe.prizeTitle}</div>
                                      <div className={`text-[10px] font-black px-2 py-0.5 rounded uppercase w-fit ${pe.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{pe.isActive ? t('status_active') : t('status_ended')}</div>
                                  </div>
                              </div>
                              {pe.winnerName && <div className="mt-auto mb-4 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Trophy size={16} /> {pe.winnerName}</div>}
                              {pe.finalists && pe.finalists.length > 0 && (
                                  <div className="mb-4 space-y-1 text-xs text-gray-500 font-bold">
                                      {pe.finalistQuizDate && <div>{t('prize_finalist_quiz_date').replace('{date}', new Date(pe.finalistQuizDate).toLocaleString())}</div>}
                                      {pe.finalistQuizLink && (
                                          <a href={pe.finalistQuizLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline flex items-center gap-1 text-xs">
                                              <LinkIcon size={12} /> {pe.finalistQuizLink}
                                          </a>
                                      )}
                                  </div>
                              )}
                              <div className="flex gap-2 mt-auto">
                                  <button onClick={() => setViewParticipantsId(pe.examId)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 border border-gray-200">{t('view_participants')}</button>
                                  {(!pe.isActive && pe.finalists && pe.finalists.length > 0) && (
                                      <button onClick={() => openQuizModal(pe)} className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 border border-indigo-200">
                                          {t('prize_finalists_title')}
                                      </button>
                                  )}
                                  {pe.isActive && <button onClick={() => { if(window.confirm(t('confirm_draw_winner'))) drawPrizeWinner(pe.id); }} className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-gray-800">{t('draw_winner')}</button>}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Participants Modal */}
      {viewParticipantsId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">{t('participants')}</h3>
                      <button onClick={() => setViewParticipantsId(null)}><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {getParticipants(viewParticipantsId).map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3"><span className="font-bold text-gray-400">{idx + 1}</span><span className="font-bold text-gray-800">{p.studentName}</span></div>
                              <span className="font-black text-brand-600">{p.score} pts</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900">{t('user_mgmt')}</h3>
                  <input type="text" placeholder={t('search_users')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-brand-500" />
              </div>
              <div className="relative group overflow-x-auto shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] rounded-xl">
                  {/* SCROLL HINT */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden pointer-events-none"></div>
                  <div className="pb-2">
                      <table className="w-full text-left min-w-[600px]">
                          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold"><tr><th className="p-4 pl-6">User</th><th className="p-4">Role</th><th className="p-4">Action</th></tr></thead>
                          <tbody className="divide-y divide-gray-100">
                              {filteredUsers.map(u => (
                                  <tr key={u.id}>
                                      <td className="p-4 pl-6 font-bold text-gray-800">{u.name}</td>
                                      <td className="p-4"><span className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-700">{u.role}</span></td>
                                      <td className="p-4 flex gap-2">
                                          {currentUser?.id !== u.id && u.role !== UserRole.ADMIN && (
                                              <>
                                                  <button onClick={() => banUser(u.id)} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 border border-orange-100"><Ban size={16} /></button>
                                                  <button onClick={() => deleteUser(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100"><Trash2 size={16} /></button>
                                              </>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* Exams Tab (Admin View) */}
      {activeTab === 'exams' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900">{t('exam_mgmt')}</h3>
                  <div className="flex gap-4">
                      <input type="text" placeholder={t('search_exams')} value={examSearch} onChange={(e) => setExamSearch(e.target.value)} className="pl-4 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-500" />
                      <button onClick={() => navigate('/admin/exam/create')} className="bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-brand-600 transition-colors flex items-center gap-2"><Plus size={16} /> Create</button>
                  </div>
              </div>
              <div className="relative group overflow-x-auto shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] rounded-xl">
                  {/* SCROLL HINT */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden pointer-events-none"></div>
                  <div className="pb-2">
                      <table className="w-full text-left min-w-[700px]">
                          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold"><tr><th className="p-4 pl-6">Title</th><th className="p-4">Creator</th><th className="p-4">Sales</th><th className="p-4">Actions</th></tr></thead>
                          <tbody className="divide-y divide-gray-100">
                              {filteredExams.map(e => (
                                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="p-4 pl-6 font-bold text-gray-800">{e.title}</td>
                                      <td className="p-4 text-sm text-gray-600">{e.creatorName}</td>
                                      <td className="p-4 font-bold text-gray-800">{e.sales}</td>
                                      <td className="p-4 flex gap-2">
                                          <button onClick={() => navigate(`/admin/exam/edit/${e.id}`)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100"><Edit2 size={16} /></button>
                                          <button onClick={() => { if(window.confirm('Delete this exam?')) deleteExam(e.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100"><Trash2 size={16} /></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* Definitions Tab */}
      {activeTab === 'definitions' && (
          <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <UploadCloud size={18} className="text-brand-500" /> {t('import_excel')}
                          </h3>
                          <p className="text-sm text-gray-500">{t('excel_hint')}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleExcelDownload}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <Download size={16} /> {t('download_template')}
                          </button>
                          <button
                            onClick={() => fileUploadRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800"
                          >
                            <Upload size={16} /> {t('upload_excel')}
                          </button>
                          <input ref={fileUploadRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                      </div>
                  </div>
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
                      <p className="font-bold text-gray-800">{t('excel_guidelines_title')}</p>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>{t('excel_guideline_schools')}</li>
                          <li>{t('excel_guideline_subjects')}</li>
                          <li>{t('excel_guideline_topics')}</li>
                      </ul>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-6">{t('system_subjects')}</h3>
                  <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="Subject Name" className="flex-1 p-3 rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:border-brand-500" />
                      <div className="flex gap-1 flex-wrap items-center">
                          {Array.from({length: 12}, (_, i) => i + 1).map(g => (
                              <button key={g} onClick={() => handleToggleGrade(g)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${newSubjectGrades.includes(g) ? 'bg-brand-500 text-white' : 'bg-white border border-gray-300 text-gray-500 hover:border-brand-300'}`}>{g}</button>
                          ))}
                      </div>
                      <button onClick={handleAddSubject} className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 shadow-md transition-colors">Add Subject</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSubjects.map(s => (
                          <div key={s.id} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-200 shadow-sm">
                              <div>
                                  <div className="font-bold text-gray-900">{s.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">Grades: {s.grades.join(', ')}</div>
                              </div>
                              <button onClick={() => removeSubject(s.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-6">{t('approved_topics')}</h3>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-900">{t('social_topics')}</h3>
                      <button
                        onClick={() => {
                            const name = window.prompt(t('social_topics_prompt') || 'Add social topic');
                            if (name) addSocialTopic(name);
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                      >
                        {t('add')}
                      </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {socialTopics.map(topic => (
                          <span key={topic.id} className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-2">
                              {topic.name}
                              <button onClick={() => removeSocialTopic(topic.id)} className="text-gray-400 hover:text-red-500">
                                  <X size={14} />
                              </button>
                          </span>
                      ))}
                      {socialTopics.length === 0 && <p className="text-sm text-gray-400">{t('no_social_topics')}</p>}
                  </div>
              </div>
                  <div className="flex flex-wrap gap-4 mb-6">
                      <select value={selectedSubjectIdForTopic} onChange={e => setSelectedSubjectIdForTopic(e.target.value)} className="p-3 bg-gray-50 rounded-xl font-bold border border-gray-300 text-gray-800 focus:outline-none focus:border-brand-500">
                          {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      {currentSubjectDef?.id === 'sub-eng' ? (
                          <select value={topicLevel} onChange={e => setTopicLevel(e.target.value)} className="p-3 bg-gray-50 rounded-xl font-bold border border-gray-300 text-gray-800 focus:outline-none focus:border-brand-500"><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option></select>
                      ) : (
                          <select value={topicGrade} onChange={e => setTopicGrade(Number(e.target.value))} className="p-3 bg-gray-50 rounded-xl font-bold border border-gray-300 text-gray-800 focus:outline-none focus:border-brand-500">
                              {validGradesForTopic.map(g => <option key={g} value={g}>{g}. Grade</option>)}
                          </select>
                      )}
                      <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Topic Name" className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:border-brand-500" />
                      <button onClick={handleAddTopic} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {(approvedTopics[selectedSubjectIdForTopic] || []).filter(t => (currentSubjectDef?.id === 'sub-eng' ? t.level === topicLevel : t.grade === topicGrade)).map((t, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200 flex items-center gap-2">
                              {t.name} <button onClick={() => removeTopic(selectedSubjectIdForTopic, t.name)} className="hover:text-blue-900"><X size={12} /></button>
                          </span>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && (
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-900">{t('pending_payout_requests')}</h3>
                      <span className="text-xs font-bold text-gray-500 uppercase">{pendingPayoutRequests.length} {t('pending')}</span>
                  </div>
                  {pendingPayoutRequests.length === 0 ? (
                      <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
                          {t('no_pending_payouts')}
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {pendingPayoutRequests.map(req => (
                              <div key={req.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-2xl px-4 py-3">
                                  <div>
                                      <p className="text-sm font-bold text-gray-900">{req.teacherName}</p>
                                      <p className="text-xs text-gray-500">
                                          ₺{req.amountTL.toFixed(2)} • {new Date(req.createdAt).toLocaleString()}
                                          {req.note ? ` • ${req.note}` : ''}
                                      </p>
                                  </div>
                                  <div className="flex gap-2">
                                      <button
                                          onClick={() => handleRejectRequest(req.id)}
                                          className="px-4 py-2 rounded-xl border border-red-100 text-red-500 text-xs font-bold hover:bg-red-50"
                                      >
                                          {t('reject')}
                                      </button>
                                      <button
                                          onClick={() => handleApproveRequest(req.id)}
                                          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600"
                                      >
                                          {t('approve')}
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">{t('payout_history')}</h3>
                  <div className="overflow-x-auto relative shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] rounded-xl">
                      {/* SCROLL HINT */}
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden pointer-events-none"></div>
                      <div className="pb-2">
                          <table className="w-full text-left min-w-[500px]">
                              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold"><tr><th className="p-4 pl-6">Teacher</th><th className="p-4">Amount</th><th className="p-4">Date</th></tr></thead>
                              <tbody className="divide-y divide-gray-100">
                                  {payouts.map(p => (
                                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="p-4 pl-6 font-bold text-gray-800">{users.find(u => u.id === p.teacherId)?.name}</td>
                                          <td className="p-4 text-emerald-600 font-bold">₺{p.amountTL.toFixed(2)}</td>
                                          <td className="p-4 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex gap-4 mb-6">
                  <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item Name" className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-300 text-gray-800" />
                  <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(Number(e.target.value))} placeholder="Price" className="w-32 p-3 bg-gray-50 rounded-xl border border-gray-300 text-gray-800" />
                  <button onClick={handleAddItem} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition-colors">Add Item</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shopItems.map(item => (
                      <div key={item.id} className="bg-white border border-gray-200 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                          <div className="font-bold text-gray-900">{item.name} ({item.price} pts)</div>
                          <button onClick={() => deleteShopItem(item.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-gray-200">
                  <button onClick={() => setShowBroadcastModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
                    <h3 className="font-bold text-xl text-gray-900 mb-6">{t('broadcast')}</h3>
                  <div className="space-y-4">
                        <input
                            value={broadcastTitle}
                            onChange={e => setBroadcastTitle(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-indigo-500"
                            placeholder={t('broadcast_title_placeholder')}
                        />
                        <textarea
                            value={broadcastMsg}
                            onChange={e => setBroadcastMsg(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-indigo-500"
                            placeholder={t('broadcast_message_placeholder')}
                        />
                        <div>
                            <label className="text-sm font-semibold text-gray-600 mb-2 block">{t('select_target_role')}</label>
                            <select
                                value={broadcastRole}
                                onChange={e => setBroadcastRole(e.target.value as UserRole | 'ALL')}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="ALL">{t('target_all')}</option>
                                <option value="STUDENT">{t('target_students')}</option>
                                <option value="TEACHER">{t('target_teachers')}</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSendBroadcast}
                            disabled={!broadcastTitle.trim() || !broadcastMsg.trim()}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50"
                        >
                            {t('send_now')}
                        </button>
                  </div>
              </div>
          </div>
      )}

      {/* Finalist Quiz Modal */}
      {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative flex flex-col space-y-4 p-6">
                  <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{t('prize_finalists_title')}</h3>
                      <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t('prize_finalist_quiz_date').replace('{date}', '').trim()}</label>
                          <input
                              type="datetime-local"
                              value={editingQuizInfo.date}
                              onChange={e => setEditingQuizInfo(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t('link')}</label>
                          <input
                              type="url"
                              value={editingQuizInfo.link}
                              onChange={e => setEditingQuizInfo(prev => ({ ...prev, link: e.target.value }))}
                              placeholder="https://..."
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                          />
                      </div>
                  </div>
                  <button
                      onClick={handleSaveQuizInfo}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                      {t('save')}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

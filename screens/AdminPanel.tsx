
import React, { useState } from 'react';
import { useApp } from '../Store';
import { 
  Users, Activity, MessageSquare, ShieldCheck, LogOut, Check, X, Plus, 
  Trash2, BookOpen, Database, Star, Crown, Flag, AlertTriangle, Search, 
  Settings, BellRing, LayoutDashboard, Filter, Send, ChevronRight, Menu,
  UploadCloud, Image as ImageIcon, FileJson, Info
} from 'lucide-react';
import { UserRole, SubscriptionTier, GradeLevel, User, Question, School, ExamTopic, SocialPost } from '../types';

// --- Components ---

const AdminCard: React.FC<{ title: string, value: string | number, icon: any, colorClass: string, trend?: string }> = ({ title, value, icon: Icon, colorClass, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.replace('text-', 'bg-')}`}>
            <Icon size={48} />
        </div>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50')} ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
                {trend && <p className="text-xs font-medium text-green-500 mt-1">{trend}</p>}
            </div>
        </div>
    </div>
);

const Modal: React.FC<{ title: string, onClose: () => void, children: React.ReactNode }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-black text-slate-800">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                </button>
            </div>
            {children}
        </div>
    </div>
);

const AdminPanel: React.FC = () => {
  const { 
      logout, user, allUsers, adminAddUser, adminDeleteUser,
      allQuestions, adminAddQuestion, adminDeleteQuestion,
      allSchools, adminAddSchool, adminDeleteSchool,
      allExamTopics, adminAddExamTopic, adminDeleteExamTopic, adminTogglePremiumMetadata,
      posts, adminResolveReports
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'questions' | 'metadata' | 'moderation'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isBulkMetadataModalOpen, setIsBulkMetadataModalOpen] = useState(false);
  const [bulkMetadataType, setBulkMetadataType] = useState<'school' | 'topic'>('school');

  // Form States
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const [newQText, setNewQText] = useState('');
  const [newQImage, setNewQImage] = useState('');
  const [newQTopic, setNewQTopic] = useState('');
  const [newQSubTopic, setNewQSubTopic] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  
  const [bulkJson, setBulkJson] = useState('');
  
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('General');
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  if (user?.role !== UserRole.ADMIN) {
      return <div className="h-screen flex items-center justify-center bg-slate-100 font-bold text-slate-400">Erişim Reddedildi.</div>;
  }

  const reportedPosts = posts.filter((p: SocialPost) => p.reports && p.reports.length > 0);
  const premiumUsers = allUsers.filter((u: User) => u.subscriptionTier === SubscriptionTier.PREMIUM).length;

  // Filtering Logic
  const filteredUsers = allUsers.filter((u: User) => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuestions = allQuestions.filter((q: Question) => 
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    adminAddUser({
      id: Date.now().toString(),
      name: newUserName,
      email: newUserEmail,
      role: UserRole.STUDENT,
      gradeLevel: GradeLevel.PRIMARY,
      subscriptionTier: SubscriptionTier.FREE,
      schoolName: 'Yeni Kayıt',
      freeTestsUsed: 0,
      testsCompleted: 0,
      points: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserName}`,
      notificationPreferences: []
    });
    setIsUserModalOpen(false);
    setNewUserName(''); setNewUserEmail('');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    adminAddQuestion({
        id: Date.now().toString(),
        text: newQText,
        imageUrl: newQImage,
        options: newQOptions,
        correctIndex: newQCorrect,
        explanation: 'Admin tarafından eklendi.',
        topic: newQTopic,
        subTopic: newQSubTopic
    });
    setIsQuestionModalOpen(false);
    setNewQText(''); setNewQImage(''); setNewQTopic(''); setNewQSubTopic(''); 
    setNewQOptions(['', '', '', '']);
  };

  const handleBulkUpload = (e: React.FormEvent) => {
      e.preventDefault();
      try {
          // Try parsing as JSON
          const parsed = JSON.parse(bulkJson);
          if (!Array.isArray(parsed)) throw new Error("JSON bir liste (array) olmalıdır.");
          
          parsed.forEach((q: any) => {
              if (q.text && q.options && typeof q.correctIndex === 'number') {
                   adminAddQuestion({
                       id: Date.now().toString() + Math.random(),
                       text: q.text,
                       imageUrl: q.imageUrl,
                       options: q.options,
                       correctIndex: q.correctIndex,
                       explanation: q.explanation || 'Toplu yüklendi.',
                       topic: q.topic || 'Genel',
                       subTopic: q.subTopic || 'Genel'
                   });
              }
          });
          alert(`${parsed.length} soru başarıyla eklendi!`);
          setIsBulkModalOpen(false);
          setBulkJson('');
      } catch (err) {
          alert("Geçersiz JSON formatı. Lütfen kontrol edin.");
      }
  };
  
  const handleBulkMetadataUpload = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Try parsing as JSON first
      try {
          const parsed = JSON.parse(bulkJson);
          if (Array.isArray(parsed)) {
            let count = 0;
            parsed.forEach((item: any) => {
                if (bulkMetadataType === 'school' && item.name) {
                    adminAddSchool(item.name);
                    count++;
                } else if (bulkMetadataType === 'topic' && item.name) {
                    adminAddExamTopic(item.name, item.category || 'General');
                    count++;
                }
            });
            alert(`${count} adet ${bulkMetadataType === 'school' ? 'Okul' : 'Konu'} eklendi (JSON)!`);
            setIsBulkMetadataModalOpen(false);
            setBulkJson('');
            return;
          }
      } catch (e) {
          // Ignore JSON error, try text parsing
      }

      // Fallback to Line-by-Line parsing (Excel/Notepad)
      const lines = bulkJson.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
          let count = 0;
          lines.forEach((line) => {
              if (bulkMetadataType === 'school') {
                  adminAddSchool(line);
                  count++;
              } else {
                  // Try to split for category (e.g. "Math, Primary")
                  const parts = line.split(/,|\t/);
                  if (parts.length > 1) {
                      adminAddExamTopic(parts[0].trim(), parts[1].trim());
                  } else {
                      adminAddExamTopic(line, 'General');
                  }
                  count++;
              }
          });
           alert(`${count} adet ${bulkMetadataType === 'school' ? 'Okul' : 'Konu'} eklendi (Metin)!`);
           setIsBulkMetadataModalOpen(false);
           setBulkJson('');
      } else {
          alert("Geçersiz format veya boş veri.");
      }
  };

  const handleBroadcast = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`"${broadcastTitle}" başlıklı bildirim ${allUsers.length} kullanıcıya gönderildi!`);
      setIsBroadcastModalOpen(false);
      setBroadcastTitle('');
      setBroadcastMsg('');
  };

  const handleAddNewSchool = () => {
      if(newSchoolName) { 
          adminAddSchool(newSchoolName); 
          setNewSchoolName(''); 
      }
  };

  const handleAddNewTopic = () => {
      if(newTopicName) { 
          adminAddExamTopic(newTopicName, newTopicCategory); 
          setNewTopicName(''); 
      }
  };

  const openBulkSchoolModal = () => {
      setBulkMetadataType('school');
      setIsBulkMetadataModalOpen(true);
  };

  const openBulkTopicModal = () => {
      setBulkMetadataType('topic');
      setIsBulkMetadataModalOpen(true);
  };

  // extracted handlers to avoid syntax issues in map
  const handleToggleSchoolPremium = (id: string) => adminTogglePremiumMetadata(id, 'school');
  const handleDeleteSchool = (id: string) => adminDeleteSchool(id);
  const handleToggleTopicPremium = (id: string) => adminTogglePremiumMetadata(id, 'topic');
  const handleDeleteTopic = (id: string) => adminDeleteExamTopic(id);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      
      {isSidebarOpen && (
        <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`
          absolute top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 z-40 shadow-xl shadow-slate-200/50 transition-transform duration-300 lg:translate-x-0 lg:static
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">H</div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">HelloClass</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-800 hover:text-red-600 p-2 bg-slate-100 rounded-lg">
              <X size={24} />
          </button>
        </div>
        <div className="px-8 pb-4">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-70">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Genel Bakış' },
              { id: 'users', icon: Users, label: 'Kullanıcılar' },
              { id: 'questions', icon: Database, label: 'Soru Bankası' },
              { id: 'metadata', icon: BookOpen, label: 'Okul & Konular' },
              { id: 'moderation', icon: ShieldCheck, label: 'Moderasyon', badge: reportedPosts.length }
          ].map((item) => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSearchQuery(''); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                 <div className="flex items-center gap-3">
                     <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}/>
                     <span className="font-bold text-sm">{item.label}</span>
                 </div>
                 {item.badge ? <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-200">{item.badge}</span> : null}
              </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
            <div className="flex items-center gap-3 mb-4 px-2">
                <img src={user?.avatar} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"/>
                <div>
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-400">Süper Admin</p>
                </div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-3 rounded-xl transition-colors text-sm font-bold">
                <LogOut size={18} /> Çıkış Yap
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-full">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 text-slate-900 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 active:scale-95 transition-all">
                    <Menu size={24} strokeWidth={2.5}/>
                </button>
                <h2 className="text-lg md:text-xl font-black text-slate-800 capitalize tracking-tight truncate">
                    {activeTab === 'metadata' ? 'Okul & Konu Yönetimi' : activeTab}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsBroadcastModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 whitespace-nowrap">
                    <BellRing size={16} /> <span className="hidden md:inline">Duyuru Yap</span>
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            
            {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <AdminCard title="Toplam Kullanıcı" value={allUsers.length} icon={Users} colorClass="text-blue-600" trend="+12% bu hafta" />
                    <AdminCard title="Premium Üyeler" value={premiumUsers} icon={Crown} colorClass="text-amber-500" trend="Yüksek Gelir" />
                    <AdminCard title="Soru Bankası" value={allQuestions.length} icon={Database} colorClass="text-violet-600" />
                    <AdminCard title="Bekleyen Rapor" value={reportedPosts.length} icon={Flag} colorClass="text-red-600" trend={reportedPosts.length > 0 ? 'İnceleme Gerekli' : 'Temiz'} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4">Son Aktiviteler</h3>
                        <div className="space-y-4">
                            {posts.slice(0, 4).map((post: SocialPost) => (
                                <div key={post.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                                    <img src={post.userAvatar} className="w-10 h-10 rounded-full bg-slate-200"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{post.userName} <span className="font-normal text-slate-500">bir gönderi paylaştı.</span></p>
                                        <p className="text-xs text-slate-400 truncate">{post.content}</p>
                                    </div>
                                    <span className="text-xs font-bold text-slate-300">2dk</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}

            {activeTab === 'moderation' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                    {reportedPosts.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                            <ShieldCheck size={40} className="text-green-500 mx-auto mb-4"/>
                            <h3 className="text-xl font-black text-slate-800">Tertemiz!</h3>
                            <p className="text-slate-500">Şu an incelenecek rapor bulunmuyor.</p>
                        </div>
                    ) : (
                        reportedPosts.map((post: SocialPost) => (
                            <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-red-100 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <img src={post.userAvatar} className="w-12 h-12 rounded-full"/>
                                        <div>
                                            <p className="font-bold text-slate-800">{post.userName}</p>
                                            <p className="text-xs text-slate-500">{post.userSchool}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black">
                                        <AlertTriangle size={14}/> {post.reports.length} Rapor
                                    </div>
                                </div>
                                <div className="pl-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-medium">
                                        "{post.content}"
                                    </div>
                                </div>
                                <div className="pl-4 flex gap-3">
                                    <button 
                                        onClick={() => adminResolveReports(post.id, 'keep')}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold"
                                    >
                                        Temizle
                                    </button>
                                    <button 
                                        onClick={() => adminResolveReports(post.id, 'delete')}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200"
                                    >
                                        Sil & Yasakla
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="İsim veya e-posta ile ara..."
                                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button onClick={() => setIsUserModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200">
                            <Plus size={20} /> Yeni Ekle
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Kullanıcı</th>
                                        <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Okul</th>
                                        <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Durum</th>
                                        <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((u: User) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.avatar} className="w-10 h-10 rounded-full bg-slate-100"/>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{u.name}</p>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm text-slate-600">{u.schoolName}</td>
                                            <td className="p-5">
                                                {u.subscriptionTier === SubscriptionTier.PREMIUM ? (
                                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border border-amber-200">
                                                        <Crown size={12} fill="currentColor"/> Premium
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Free</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <button onClick={() => adminDeleteUser(u.id)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="space-y-4 animate-in fade-in">
                     <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Soru içeriği veya konu ara..."
                                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setIsBulkModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200">
                                <FileJson size={20} /> Toplu
                            </button>
                            <button onClick={() => setIsQuestionModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-violet-200">
                                <Plus size={20} /> Ekle
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredQuestions.map((q: Question, idx: number) => (
                            <div key={q.id || idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{q.topic || 'Genel'}</span>
                                        {q.subTopic && <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{q.subTopic}</span>}
                                    </div>
                                    <button onClick={() => adminDeleteQuestion(q.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                                </div>
                                <p className="font-bold text-slate-800 mb-4 text-lg">{q.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'metadata' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
                         <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                 <BookOpen size={20} className="text-violet-600"/> Okullar
                             </h2>
                             <button onClick={openBulkSchoolModal} className="text-xs font-bold text-violet-600 hover:bg-violet-50 px-2 py-1 rounded-lg">Toplu Ekle</button>
                         </div>
                         <div className="flex gap-2 mb-4">
                             <input value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} placeholder="Okul Adı..." className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                             <button type="button" onClick={handleAddNewSchool} className="bg-slate-900 text-white px-4 rounded-xl"><Plus size={20}/></button>
                         </div>
                         <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {allSchools.map((s: School) => {
                                 const crownFill = s.isPremium ? "currentColor" : "none";
                                 const crownClass = `p-1.5 rounded-lg ${s.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400'}`;
                                 return (
                                     <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 group">
                                         <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                                         <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100">
                                             <button onClick={() => handleToggleSchoolPremium(s.id)} className={crownClass}>
                                                 <Crown size={16} fill={crownFill}/>
                                             </button>
                                             <button onClick={() => handleDeleteSchool(s.id)} className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg"><Trash2 size={16}/></button>
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                     </div>

                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
                          <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                 <Database size={20} className="text-pink-600"/> Konular
                             </h2>
                             <button onClick={openBulkTopicModal} className="text-xs font-bold text-pink-600 hover:bg-pink-50 px-2 py-1 rounded-lg">Toplu Ekle</button>
                         </div>
                         <div className="flex gap-2 mb-4">
                             <input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} placeholder="Konu Adı..." className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                             <button type="button" onClick={handleAddNewTopic} className="bg-slate-900 text-white px-4 rounded-xl"><Plus size={20}/></button>
                         </div>
                         <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {allExamTopics.map((t: ExamTopic) => {
                                 const crownFill = t.isPremium ? "currentColor" : "none";
                                 const crownClass = `p-1.5 rounded-lg ${t.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400'}`;
                                 return (
                                     <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 group">
                                         <span className="font-bold text-slate-700 text-sm">{t.name}</span>
                                         <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100">
                                             <button onClick={() => handleToggleTopicPremium(t.id)} className={crownClass}>
                                                 <Crown size={16} fill={crownFill}/>
                                             </button>
                                             <button onClick={() => handleDeleteTopic(t.id)} className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg"><Trash2 size={16}/></button>
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                </div>
            )}

        </div>
      </main>
      
      {isUserModalOpen && (
          <Modal title="Yeni Kullanıcı" onClose={() => setIsUserModalOpen(false)}>
              <form onSubmit={handleAddUser} className="space-y-4">
                  <input required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="Ad Soyad"/>
                  <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="E-posta"/>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">Kaydet</button>
              </form>
          </Modal>
      )}

      {isQuestionModalOpen && (
          <Modal title="Soru Ekle" onClose={() => setIsQuestionModalOpen(false)}>
               <form onSubmit={handleAddQuestion} className="space-y-4">
                  <input required value={newQTopic} onChange={e => setNewQTopic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="Konu (Örn: Matematik)"/>
                  <input value={newQSubTopic} onChange={e => setNewQSubTopic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="Alt Konu (Opsiyonel)"/>
                  <textarea required value={newQText} onChange={e => setNewQText(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-24" placeholder="Soru Metni"/>
                  <input value={newQImage} onChange={e => setNewQImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="Görsel URL (Opsiyonel)"/>
                  <div className="space-y-2">
                      {newQOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                              <span className="font-bold text-slate-400 w-6">{['A','B','C','D'][idx]}</span>
                              <input 
                                  required 
                                  value={opt} 
                                  onChange={e => {
                                      const newOpts = [...newQOptions];
                                      newOpts[idx] = e.target.value;
                                      setNewQOptions(newOpts);
                                  }} 
                                  className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl" 
                                  placeholder={`Seçenek ${idx + 1}`}
                              />
                              <input 
                                  type="radio" 
                                  name="correct" 
                                  checked={newQCorrect === idx} 
                                  onChange={() => setNewQCorrect(idx)}
                                  className="w-5 h-5 accent-green-500"
                              />
                          </div>
                      ))}
                  </div>
                  <button type="submit" className="w-full bg-violet-600 text-white font-bold py-4 rounded-xl">Ekle</button>
               </form>
          </Modal>
      )}

      {isBulkModalOpen && (
          <Modal title="Toplu Soru Ekle (JSON)" onClose={() => setIsBulkModalOpen(false)}>
              <form onSubmit={handleBulkUpload} className="space-y-4">
                   <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2">
                       <Info size={16} className="shrink-0 mt-0.5"/> 
                       JSON formatında soru listesi yapıştırın. Örn:
                       <br/><code className="text-xs font-mono mt-1 block bg-white p-1 rounded">[{`{"text": "...", "options": ["A","B","C","D"], "correctIndex": 0}`}]</code>
                   </p>
                   <textarea 
                        value={bulkJson} 
                        onChange={e => setBulkJson(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-64 font-mono text-xs" 
                        placeholder="JSON verisini buraya yapıştırın..."
                   />
                   <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl">Yükle</button>
              </form>
          </Modal>
      )}

      {isBulkMetadataModalOpen && (
          <Modal title={`Toplu ${bulkMetadataType === 'school' ? 'Okul' : 'Konu'} Ekle`} onClose={() => setIsBulkMetadataModalOpen(false)}>
              <form onSubmit={handleBulkMetadataUpload} className="space-y-4">
                   <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2">
                       <Info size={16} className="shrink-0 mt-0.5"/> 
                       Her satıra bir tane gelecek şekilde yapıştırın (Excel'den kopyalayabilirsiniz).
                   </p>
                   <textarea 
                        value={bulkJson} 
                        onChange={e => setBulkJson(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-64" 
                        placeholder={`Her satıra bir ${bulkMetadataType === 'school' ? 'okul' : 'konu'} adı...`}
                   />
                   <button type="submit" className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl">Yükle</button>
              </form>
          </Modal>
      )}
      
      {isBroadcastModalOpen && (
          <Modal title="Duyuru" onClose={() => setIsBroadcastModalOpen(false)}>
               <form onSubmit={handleBroadcast} className="space-y-4">
                  <input required value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="Başlık"/>
                  <textarea required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-32" placeholder="Mesaj"/>
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl">Gönder</button>
               </form>
          </Modal>
      )}
    </div>
  );
};

export default AdminPanel;

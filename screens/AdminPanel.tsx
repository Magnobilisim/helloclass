import React, { useState } from 'react';
import { useApp } from '../Store';
import { 
  Users, Activity, MessageSquare, ShieldCheck, LogOut, Check, X, Plus, 
  Trash2, BookOpen, Database, Star, Crown, Flag, AlertTriangle, Search, 
  Settings, BellRing, LayoutDashboard, Filter, Send, ChevronRight, Menu,
  UploadCloud, Image as ImageIcon, FileJson, Info
} from 'lucide-react';
import { UserRole, SubscriptionTier, GradeLevel, User, Question } from '../types';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Menu State

  // Modals State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); // Bulk Upload Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isBulkMetadataModalOpen, setIsBulkMetadataModalOpen] = useState(false); // New Bulk Metadata Modal
  const [bulkMetadataType, setBulkMetadataType] = useState<'school' | 'topic'>('school');

  // Form States
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const [newQText, setNewQText] = useState('');
  const [newQImage, setNewQImage] = useState(''); // Image URL State
  const [newQTopic, setNewQTopic] = useState('');
  const [newQSubTopic, setNewQSubTopic] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  
  const [bulkJson, setBulkJson] = useState(''); // Bulk Upload JSON
  
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('General');
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  if (user?.role !== UserRole.ADMIN) {
      return <div className="h-screen flex items-center justify-center bg-slate-100 font-bold text-slate-400">Erişim Reddedildi.</div>;
  }

  const reportedPosts = posts.filter(p => p.reports && p.reports.length > 0);
  const premiumUsers = allUsers.filter(u => u.subscriptionTier === SubscriptionTier.PREMIUM).length;

  // Filtering Logic
  const filteredUsers = allUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuestions = allQuestions.filter(q => 
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
        imageUrl: newQImage, // Save Image URL
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
      try {
          const parsed = JSON.parse(bulkJson);
          if (!Array.isArray(parsed)) throw new Error("JSON bir liste olmalıdır.");
          
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
          alert(`${count} adet ${bulkMetadataType === 'school' ? 'Okul' : 'Konu'} eklendi!`);
          setIsBulkMetadataModalOpen(false);
          setBulkJson('');
      } catch (err) {
          alert("Geçersiz JSON.");
      }
  };

  const handleBroadcast = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`"${broadcastTitle}" başlıklı bildirim ${allUsers.length} kullanıcıya gönderildi!`);
      setIsBroadcastModalOpen(false);
      setBroadcastTitle('');
      setBroadcastMsg('');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-full">
        {/* Top Bar */}
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
            
            {/* --- DASHBOARD --- */}
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
                            {posts.slice(0, 4).map(post => (
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
                     <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <h3 className="font-black text-2xl mb-2 relative z-10">Sistem Durumu</h3>
                        <p className="text-indigo-100 mb-8 relative z-10">Tüm servisler sorunsuz çalışıyor.</p>
                        
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">Sunucu Yükü</span>
                                <span className="font-mono text-xs bg-white/20 px-2 py-1 rounded">%24</span>
                            </div>
                            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-400 h-full w-1/4 rounded-full"></div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-sm">Veritabanı</span>
                                <span className="font-bold text-xs text-green-300 flex items-center gap-1"><Check size={14}/> Bağlı</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* --- MODERATION --- */}
            {activeTab === 'moderation' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                    {reportedPosts.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Tertemiz!</h3>
                            <p className="text-slate-500">Şu an incelenecek rapor bulunmuyor.</p>
                        </div>
                    ) : (
                        reportedPosts.map(post => (
                            <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-red-100 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 pl-4 gap-2">
                                    <div className="flex items-center gap-3">
                                        <img src={post.userAvatar} className="w-12 h-12 rounded-full bg-slate-100"/>
                                        <div>
                                            <p className="font-bold text-slate-800">{post.userName}</p>
                                            <p className="text-xs text-slate-500">{post.userSchool}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide w-fit">
                                        <AlertTriangle size={14}/> {post.reports.length} Rapor
                                    </div>
                                </div>

                                <div className="pl-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-medium">
                                        "{post.content}"
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {post.reports.map((r, idx) => (
                                            <span key={idx} className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">{r.reason}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pl-4 flex flex-col md:flex-row gap-3">
                                    <button 
                                        onClick={() => adminResolveReports(post.id, 'keep')}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-colors"
                                    >
                                        Raporları Temizle
                                    </button>
                                    <button 
                                        onClick={() => adminResolveReports(post.id, 'delete')}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
                                    >
                                        İçeriği Sil & Yasakla
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- USERS --- */}
            {activeTab === 'users' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="İsim veya e-posta ile ara..."
                                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <button onClick={() => setIsUserModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-transform active:scale-95">
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
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.avatar} className="w-10 h-10 rounded-full bg-slate-100"/>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{u.name}</p>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm font-medium text-slate-600">{u.schoolName}</td>
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
                                                <button onClick={() => adminDeleteUser(u.id)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length === 0 && <div className="p-10 text-center text-slate-400 font-bold">Kullanıcı bulunamadı.</div>}
                    </div>
                </div>
            )}

            {/* --- QUESTIONS --- */}
            {activeTab === 'questions' && (
                <div className="space-y-4 animate-in fade-in">
                     <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Soru içeriği veya konu ara..."
                                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setIsBulkModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-transform active:scale-95">
                                <FileJson size={20} /> Toplu Ekle
                            </button>
                            <button onClick={() => setIsQuestionModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-transform active:scale-95">
                                <Plus size={20} /> Soru Ekle
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredQuestions.map((q, idx) => (
                            <div key={q.id || idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{q.topic || 'Genel'}</span>
                                        {q.subTopic && <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{q.subTopic}</span>}
                                    </div>
                                    <button onClick={() => adminDeleteQuestion(q.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18}/></button>
                                </div>
                                {q.imageUrl && (
                                    <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 max-h-48 w-full bg-slate-50">
                                        <img src={q.imageUrl} alt="Soru Görseli" className="w-full h-full object-contain"/>
                                    </div>
                                )}
                                <p className="font-bold text-slate-800 mb-4 text-lg">{q.text}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-3 ${i === q.correctIndex ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-100 text-slate-500'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === q.correctIndex ? 'bg-green-200 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                                {['A','B','C','D'][i]}
                                            </div>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filteredQuestions.length === 0 && <div className="p-10 text-center text-slate-400 font-bold bg-white rounded-3xl border border-dashed border-slate-200">Soru bulunamadı.</div>}
                    </div>
                </div>
            )}

            {/* --- METADATA --- */}
            {activeTab === 'metadata' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                     {/* Schools */}
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
                         <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                 <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><BookOpen size={20}/></div>
                                 Okullar
                             </h2>
                             <button onClick={() => { setBulkMetadataType('school'); setIsBulkMetadataModalOpen(true); }} className="text-xs font-bold text-violet-600 hover:bg-violet-50 px-2 py-1 rounded-lg">Toplu Ekle</button>
                         </div>
                         <div className="flex gap-2 mb-4">
                             <input value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} placeholder="Okul Adı..." className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                             <button type="button" onClick={() => { if(newSchoolName) { adminAddSchool(newSchoolName); setNewSchoolName(''); }}} className="bg-slate-900 text-white px-4 rounded-xl hover:bg-slate-800"><Plus size={20}/></button>
                         </div>
                         <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {allSchools.map(s => (
                                 <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all group">
                                     <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                                     <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => adminTogglePremiumMetadata(s.id, 'school')} title="Premium Yap" className={`p-1.5 rounded-lg transition-colors ${s.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 hover:text-amber-500 shadow-sm'}`}>
                                             <Crown size={16} fill={s.isPremium ? "currentColor" : "none"}/>
                                         </button>
                                         <button onClick={() => adminDeleteSchool(s.id)} className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition-colors"><Trash2 size={16}/></button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* Topics */}
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
                          <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                 <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Database size={20}/></div>
                                 Sınav Konuları
                             </h2>
                             <button onClick={() => { setBulkMetadataType('topic'); setIsBulkMetadataModalOpen(true); }} className="text-xs font-bold text-pink-600 hover:bg-pink-50 px-2 py-1 rounded-lg">Toplu Ekle</button>
                         </div>
                         <div className="flex gap-2 mb-4">
                             <input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} placeholder="Konu Adı..." className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                             <button type="button" onClick={() => { if(newTopicName) { adminAddExamTopic(newTopicName, newTopicCategory); setNewTopicName(''); }}} className="bg-slate-900 text-white px-4 rounded-xl hover:bg-slate-800"><Plus size={20}/></button>
                         </div>
                         <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {allExamTopics.map(t => (
                                 <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all group">
                                     <span className="font-bold text-slate-700 text-sm">{t.name}</span>
                                     <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => adminTogglePremiumMetadata(t.id, 'topic')} title="Premium Yap" className={`p-1.5 rounded-lg transition-colors ${t.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 hover:text-amber-500 shadow-sm'}`}>
                                             <Crown size={16} fill={t.isPremium ? "currentColor" : "none"}/>
                                         </button>
                                         <button onClick={() => adminDeleteExamTopic(t.id)} className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition-colors"><Trash2 size={16}/></button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                </div>
            )}

        </div>
      </main>

      {/* --- MODALS --- */}
      
      {isUserModalOpen && (
          <Modal title="Yeni Kullanıcı Ekle" onClose={() => setIsUserModalOpen(false)}>
              <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
                      <input required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Örn: Ahmet Yılmaz"/>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-posta</label>
                      <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ahmet@ornek.com"/>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95">Kaydet</button>
              </form>
          </Modal>
      )}

      {isQuestionModalOpen && (
          <Modal title="Yeni Soru Ekle" onClose={() => setIsQuestionModalOpen(false)}>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Konu</label>
                          <input required value={newQTopic} onChange={e => setNewQTopic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="Örn: Matematik"/>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alt Konu</label>
                          <input value={newQSubTopic} onChange={e => setNewQSubTopic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="Örn: Kesirler"/>
                      </div>
                  </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Görsel URL (Opsiyonel)</label>
                      <div className="flex items-center gap-2">
                          <input value={newQImage} onChange={e => setNewQImage(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder="https://..."/>
                          <div className="p-3 bg-slate-100 rounded-xl"><ImageIcon size={20} className="text-slate-400"/></div>
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Soru Metni</label>
                      <textarea required value={newQText} onChange={e => setNewQText(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-24 resize-none" placeholder="Sorunuzu buraya yazın..."/>
                  </div>
                  <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Şıklar (Doğru şıkkı seçin)</label>
                      {newQOptions.map((opt, i) => (
                          <div key={i} className="flex items-center gap-3">
                              <input type="radio" name="correctIndex" checked={newQCorrect === i} onChange={() => setNewQCorrect(i)} className="w-5 h-5 text-indigo-600"/>
                              <input required value={opt} onChange={e => {const n = [...newQOptions]; n[i] = e.target.value; setNewQOptions(n);}} className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl" placeholder={`Seçenek ${i+1}`}/>
                          </div>
                      ))}
                  </div>
                  <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-200 transition-transform active:scale-95">Soruyu Kaydet</button>
              </form>
          </Modal>
      )}

      {isBulkModalOpen && (
          <Modal title="Toplu Soru Yükle (JSON)" onClose={() => setIsBulkModalOpen(false)}>
               <form onSubmit={handleBulkUpload} className="space-y-4">
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs font-medium mb-4 flex items-start gap-3">
                       <Info size={20} className="shrink-0"/>
                       <div>
                           Format: [{"text": "Soru", "options": ["A","B","C","D"], "correctIndex": 0, "topic": "Mat", "imageUrl": "https://..."}]
                       </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">JSON Verisi</label>
                      <textarea required value={bulkJson} onChange={e => setBulkJson(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-64 resize-none outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs" placeholder='[{"text": "...", ...}]'/>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                      <UploadCloud size={18} /> Yükle
                  </button>
               </form>
          </Modal>
      )}
      
      {isBulkMetadataModalOpen && (
          <Modal title={`Toplu ${bulkMetadataType === 'school' ? 'Okul' : 'Konu'} Ekle`} onClose={() => setIsBulkMetadataModalOpen(false)}>
               <form onSubmit={handleBulkMetadataUpload} className="space-y-4">
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs font-medium mb-4 flex items-start gap-3">
                       <Info size={20} className="shrink-0"/>
                       <div>
                           Format: [{"name": "İsim", "category": "Kategori (Opsiyonel)"}]
                       </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">JSON Verisi</label>
                      <textarea required value={bulkJson} onChange={e => setBulkJson(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-64 resize-none outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs" placeholder='[{"name": "İstanbul Lisesi"}]'/>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                      <UploadCloud size={18} /> Yükle
                  </button>
               </form>
          </Modal>
      )}

      {isBroadcastModalOpen && (
          <Modal title="Sistem Duyurusu Yap" onClose={() => setIsBroadcastModalOpen(false)}>
               <form onSubmit={handleBroadcast} className="space-y-4">
                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm font-medium mb-4 flex items-start gap-3">
                       <BellRing size={20} className="shrink-0"/>
                       Bu mesaj tüm kayıtlı kullanıcılara bildirim olarak gönderilecektir.
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Başlık</label>
                      <input required value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Duyuru Başlığı"/>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mesaj</label>
                      <textarea required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-32 resize-none outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Mesajınızı yazın..."/>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                      <Send size={18} /> Gönder
                  </button>
               </form>
          </Modal>
      )}
    </div>
  );
};

export default AdminPanel;
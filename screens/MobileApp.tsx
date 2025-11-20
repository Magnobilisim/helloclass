
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../Store';
import { 
  Home, User as UserIcon, Map, BookOpen, 
  Clock, Lock, MessageCircle, Share2,
  ArrowLeft, CheckCircle, XCircle, Trophy, Crown,
  Search, Edit2, Save, Timer as TimerIcon,
  Bell, Send, Mail, Info, GraduationCap, Tag, ChevronRight,
  Camera, ToggleLeft, ToggleRight, Heart, Image as ImageIcon,
  Sparkles, Hash, List, Globe, X, Filter, Settings, Globe2, AlertTriangle, MoreHorizontal, Plus, ThumbsDown, Trash2, Flag, Play, HelpCircle, RefreshCw, ArrowRight, LogOut, ShieldAlert
} from 'lucide-react';
import { MobileButton, Card, Badge } from '../components/MobileComponents';
import { SubscriptionTier, Question, SocialPost, GradeLevel } from '../types';
import { explainAnswer, checkContentSafety } from '../services/geminiService';

// --- Helper Components ---

const Header: React.FC<{ title: string, onBack?: () => void, rightAction?: React.ReactNode, transparent?: boolean, darkMode?: boolean }> = ({ title, onBack, rightAction, transparent, darkMode }) => (
    <div className={`px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-all ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-gray-100/50'}`}>
        <div className="flex items-center gap-3">
            {onBack && <button onClick={onBack} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-slate-800'}`}><ArrowLeft size={20} /></button>}
            <h2 className={`text-lg font-bold tracking-tight font-sans ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
        </div>
        {rightAction}
    </div>
);

// --- Screens ---

const NotificationsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { notifications, markNotificationsRead, allSchools, allExamTopics, user, toggleNotificationPreference, language } = useApp();
    const [showSettings, setShowSettings] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    if (showSettings) {
        const subscribedTopics = allExamTopics.filter(t => user?.notificationPreferences.includes(`topic_${t.id}`));
        const subscribedSchools = allSchools.filter(s => user?.notificationPreferences.includes(`school_${s.id}`));
        const availableTopics = allExamTopics.filter(t => !user?.notificationPreferences.includes(`topic_${t.id}`));
        const availableSchools = allSchools.filter(s => !user?.notificationPreferences.includes(`school_${s.id}`));

        return (
            <div className="h-full flex flex-col bg-slate-50">
                <Header title={language === 'TR' ? 'Bildirim Ayarları' : 'Notification Settings'} onBack={() => setShowSettings(false)} />
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Genel</h3>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><Tag size={20} /></div>
                                <span className="font-bold text-slate-700">Bahsetmeler (@Mentions)</span>
                            </div>
                            <button onClick={() => toggleNotificationPreference('mentions')}>
                                {user?.notificationPreferences.includes('mentions') 
                                    ? <ToggleRight size={36} className="text-indigo-500 transition-all" strokeWidth={2.5}/> 
                                    : <ToggleLeft size={36} className="text-slate-300 transition-all"/>}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end px-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Takip Edilenler</h3>
                            <button onClick={() => setShowAddModal(true)} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                                <Plus size={14}/> Ekle
                            </button>
                        </div>

                        {subscribedTopics.length === 0 && subscribedSchools.length === 0 && (
                            <p className="text-sm text-slate-400 italic text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">Henüz bir konu veya okul takip etmiyorsunuz.</p>
                        )}

                        <div className="space-y-2">
                            {subscribedTopics.map(topic => (
                                <div key={topic.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-50 p-2 rounded-xl text-amber-600"><BookOpen size={18} /></div>
                                        <span className="font-bold text-sm text-slate-700">{topic.name}</span>
                                    </div>
                                    <button onClick={() => toggleNotificationPreference(`topic_${topic.id}`)}>
                                        <ToggleRight size={28} className="text-green-500"/>
                                    </button>
                                </div>
                            ))}
                            {subscribedSchools.map(school => (
                                <div key={school.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-violet-50 p-2 rounded-xl text-violet-600"><GraduationCap size={18} /></div>
                                        <span className="font-bold text-sm text-slate-700">{school.name}</span>
                                    </div>
                                    <button onClick={() => toggleNotificationPreference(`school_${school.id}`)}>
                                        <ToggleRight size={28} className="text-green-500"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {showAddModal && (
                    <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
                        <Header title="Takip Et" onBack={() => setShowAddModal(false)} />
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                <h4 className="font-bold text-slate-900 mb-3 px-2">Konular</h4>
                                <div className="space-y-2">
                                {availableTopics.map(t => (
                                    <button key={t.id} onClick={() => toggleNotificationPreference(`topic_${t.id}`)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-slate-50 border border-slate-100 shadow-sm transition-all active:scale-[0.99]">
                                        <span className="font-medium text-slate-700">{t.name}</span>
                                        <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full"><Plus size={16} /></div>
                                    </button>
                                ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 mb-3 px-2">Okullar</h4>
                                <div className="space-y-2">
                                {availableSchools.map(s => (
                                    <button key={s.id} onClick={() => toggleNotificationPreference(`school_${s.id}`)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-slate-50 border border-slate-100 shadow-sm transition-all active:scale-[0.99]">
                                        <span className="font-medium text-slate-700">{s.name}</span>
                                        <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full"><Plus size={16} /></div>
                                    </button>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <Header 
                title={language === 'TR' ? 'Bildirimler' : 'Notifications'} 
                onBack={onBack} 
                rightAction={
                    <div className="flex gap-2">
                        <button onClick={() => setShowSettings(true)} className="p-2 bg-white hover:bg-slate-100 border border-slate-100 rounded-full text-slate-600 transition-colors shadow-sm">
                            <Settings size={20} />
                        </button>
                        <button onClick={markNotificationsRead} className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full text-blue-600 transition-colors shadow-sm">
                            <CheckCircle size={20} />
                        </button>
                    </div>
                } 
            />
            <div className="flex-1 overflow-y-auto pb-24 px-2">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-32 text-slate-300">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="opacity-50"/>
                        </div>
                        <p className="font-medium">Henüz bildirim yok.</p>
                    </div>
                ) : notifications.map(n => (
                    <div key={n.id} className={`mx-2 my-2 p-4 rounded-2xl border transition-all flex gap-4 ${n.read ? 'bg-white border-slate-100 shadow-sm' : 'bg-blue-50/50 border-blue-100 shadow-md'}`}>
                        <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${n.read ? 'bg-slate-200' : 'bg-blue-500 shadow-sm shadow-blue-200'}`}></div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${n.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {n.type === 'success' ? 'BAŞARI' : 'BİLGİ'}
                                </span>
                                <span className="text-slate-400 text-[10px] font-medium">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const SubscriptionScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { upgradeToPremium } = useApp();
    const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

    const handleUpgrade = () => {
        upgradeToPremium();
        onClose();
        alert("Tebrikler! Premium üyeliğiniz başladı. 🎉");
    };

    return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-slate-900/40 pointer-events-auto backdrop-blur-md transition-opacity" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 space-y-6 relative z-10 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom duration-500">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X size={20} className="text-slate-500"/></button>
                
                <div className="text-center pt-2">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl rotate-3 flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-lg shadow-amber-100">
                        <Crown size={40} strokeWidth={1.5} fill="currentColor" className="text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Premium'a Geç</h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Sınırsız potansiyelini keşfet.</p>
                </div>

                <div className="space-y-3">
                    <div 
                        onClick={() => setSelectedPlan('yearly')}
                        className={`p-5 rounded-3xl border-2 cursor-pointer relative transition-all duration-300 group ${selectedPlan === 'yearly' ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                        {selectedPlan === 'yearly' && <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md shadow-indigo-200 tracking-wide">EN POPÜLER</div>}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-lg">Yıllık Plan</span>
                            <span className="text-indigo-600 font-black text-xl">₺499.99</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">12 ay boyunca sınırsız erişim. (₺41/ay)</p>
                    </div>

                    <div 
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-5 rounded-3xl border-2 cursor-pointer relative transition-all duration-300 ${selectedPlan === 'monthly' ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                        {selectedPlan === 'monthly' && <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md shadow-indigo-200 tracking-wide">SEÇİLDİ</div>}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-lg">Aylık Plan</span>
                            <span className="text-slate-600 font-black text-xl">₺59.99</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">İstediğin zaman iptal et.</p>
                    </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-600 bg-slate-50 p-5 rounded-3xl">
                    <li className="flex items-center gap-3"><div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600"/></div> Sınırsız Soru Çözümü</li>
                    <li className="flex items-center gap-3"><div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600"/></div> Reklamsız Deneyim</li>
                    <li className="flex items-center gap-3"><div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600"/></div> Detaylı Yapay Zeka Analizleri</li>
                    <li className="flex items-center gap-3"><div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600"/></div> Profilinde Premium Rozeti 👑</li>
                </ul>

                <button onClick={handleUpgrade} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-300 hover:scale-[0.98] transition-transform active:scale-95">
                    {selectedPlan === 'yearly' ? 'Yıllık Başlat (₺499.99)' : 'Aylık Başlat (₺59.99)'}
                </button>
            </div>
        </div>
    );
};

const MessagesScreen: React.FC = () => {
    const { messages, user, sendMessage } = useApp();
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    
    const conversations = Array.from(new Set(messages.map(m => m.senderId === user?.id ? m.receiverId : m.senderId)));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeConversation && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeConversation]);

    const handleSend = () => {
        if (activeConversation && replyText.trim()) {
            sendMessage(activeConversation, replyText);
            setReplyText('');
        }
    };

    if (activeConversation) {
        const chatMessages = messages.filter(m => 
            (m.senderId === user?.id && m.receiverId === activeConversation) || 
            (m.receiverId === user?.id && m.senderId === activeConversation)
        ).sort((a,b) => a.timestamp - b.timestamp);

        return (
            <div className="h-full flex flex-col bg-slate-50 pb-20">
                <Header title="Sohbet" onBack={() => setActiveConversation(null)} />
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map(m => {
                        const isMe = m.senderId === user?.id;
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'}`}>
                                    {m.content}
                                    <span className={`text-[10px] block mt-1.5 opacity-70 font-medium ${isMe ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-3 bg-white border-t border-slate-100 flex gap-2 sticky bottom-0 pb-safe-bottom">
                    <input 
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Mesaj yaz..."
                        className="flex-1 bg-slate-100 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button onClick={handleSend} disabled={!replyText.trim()} className="p-3 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-90">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white pb-20">
            <Header title="Mesajlar" />
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="text-center mt-32 text-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle size={40} className="opacity-50"/>
                        </div>
                        <p className="font-medium text-slate-400">Henüz mesajın yok.</p>
                    </div>
                ) : conversations.map(contactId => {
                    const lastMsg = messages.filter(m => m.senderId === contactId || m.receiverId === contactId).sort((a,b) => b.timestamp - a.timestamp)[0];
                    return (
                        <div key={contactId} onClick={() => setActiveConversation(contactId)} className="flex items-center gap-4 p-4 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors group">
                             <div className="w-14 h-14 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contactId}`} alt="avatar" className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-slate-900 text-sm truncate">Kullanıcı {contactId.substring(0,4)}</h4>
                                    <span className="text-slate-400 text-[10px] font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-full">{new Date(lastMsg.timestamp).toLocaleDateString()}</span>
                                 </div>
                                 <p className="text-sm text-slate-500 truncate font-medium">{lastMsg?.content}</p>
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const LeaderboardScreen: React.FC<{ onViewUser: (id: string) => void }> = ({ onViewUser }) => {
    const { allUsers, allExamTopics, allSchools } = useApp();
    const [filter, setFilter] = useState<'ALL' | string>('ALL');
    const [schoolFilter, setSchoolFilter] = useState<'ALL' | string>('ALL');

    // Simulate points variation based on exam type (mock)
    const getPointsForFilter = (u: typeof allUsers[0]) => {
        if (filter === 'ALL') return u.points;
        // Hash logic to simulate different scores per topic
        return Math.floor(u.points * (0.5 + (u.name.length % 5) / 10));
    };

    const sortedUsers = [...allUsers]
        .filter(u => schoolFilter === 'ALL' || u.schoolName === schoolFilter)
        .sort((a, b) => getPointsForFilter(b) - getPointsForFilter(a));

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-24">
            <Header title="Liderlik Tablosu" />
            
            <div className="bg-white border-b border-slate-100 p-4 space-y-3">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                        Genel Sıralama
                    </button>
                    {allExamTopics.map(t => (
                        <button key={t.id} onClick={() => setFilter(t.name)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === t.name ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                            {t.name}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                     <button onClick={() => setSchoolFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-colors ${schoolFilter === 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                        Tüm Okullar
                    </button>
                    {allSchools.map(s => (
                         <button key={s.id} onClick={() => setSchoolFilter(s.name)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-colors ${schoolFilter === s.name ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sortedUsers.map((u, index) => (
                    <div 
                        key={u.id} 
                        onClick={() => onViewUser(u.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${index === 0 ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-white border-slate-100'}`}
                    >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black ${index === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : index === 1 ? 'bg-slate-300 text-white' : index === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {index < 3 && <Trophy size={14} className="mr-0.5"/>}
                            {index + 1}
                        </div>
                        
                        <img src={u.avatar} className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm"/>
                        
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                            <p className="text-xs text-slate-500 truncate">{u.schoolName}</p>
                        </div>

                        <div className="text-right">
                            <p className="font-black text-indigo-600 text-lg">{getPointsForFilter(u)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Puan</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TimelineScreen: React.FC<{ onRequirePremium: () => void, onViewUser: (id: string) => void }> = ({ onRequirePremium, onViewUser }) => {
    const { posts, user, addPost, deletePost, reportPost, toggleLike, toggleDislike, addComment, allExamTopics, allSchools } = useApp();
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedContext, setSelectedContext] = useState('');
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState<{postId: string} | null>(null);
    
    // NEW: Custom Safety Modal State
    const [safetyViolation, setSafetyViolation] = useState<string | null>(null);

    const handlePost = async () => {
        if (!newPostContent.trim()) return;
        if (!selectedContext) {
            alert("Lütfen gönderin için bir konu veya okul etiketi seç.");
            return;
        }
        
        const schoolObj = allSchools.find(s => s.name === selectedContext);
        if (schoolObj && schoolObj.name !== user?.schoolName && user?.subscriptionTier !== 'PREMIUM') {
            onRequirePremium();
            return;
        }

        const contextIsPremium = allExamTopics.find(t => t.name === selectedContext)?.isPremium || schoolObj?.isPremium;
        if (contextIsPremium && user?.subscriptionTier !== 'PREMIUM') {
            onRequirePremium();
            return;
        }

        setIsChecking(true);
        const isSafe = await checkContentSafety(newPostContent);
        setIsChecking(false);

        if (!isSafe) {
            // Trigger Custom Modal instead of standard alert
            setSafetyViolation("Paylaşımınız topluluk kurallarımıza (müstehcenlik, nefret söylemi veya hakaret) aykırı olduğu için engellenmiştir. Lütfen temiz bir dil kullanarak tekrar deneyiniz.");
            return;
        }

        addPost(newPostContent, selectedContext);
        setNewPostContent('');
        setSelectedContext('');
    };

    const handleComment = async (postId: string) => {
        const post = posts.find(p => p.id === postId);
        const contextIsPremium = allExamTopics.find(t => t.name === post?.relatedContext)?.isPremium || allSchools.find(s => s.name === post?.relatedContext)?.isPremium;
        
        if (contextIsPremium && user?.subscriptionTier !== 'PREMIUM') {
             onRequirePremium();
             return;
        }

        if (commentText.trim()) {
            setIsChecking(true);
            const isSafe = await checkContentSafety(commentText);
            setIsChecking(false);

            if(!isSafe) {
                // Trigger Custom Modal instead of standard alert
                setSafetyViolation("Yorumunuz uygunsuz içerik (müstehcenlik/nefret söylemi) barındırıyor ve engellendi.");
                return;
            }

            addComment(postId, commentText);
            setCommentText('');
            setShowCommentInput(null);
        }
    };

    const handleReport = (reason: string) => {
        if (showReportModal) {
            reportPost(showReportModal.postId, reason);
            setShowReportModal(null);
            alert('Bildiriminiz için teşekkürler. İçerik incelemeye alındı.');
        }
    };

    return (
        <div className="h-full flex flex-col bg-white pb-24 relative" onClick={() => setActiveMenuPostId(null)}>
            <Header title="Akış" />

            <div className="p-4 border-b border-slate-100 flex gap-3">
                <div className="shrink-0">
                    <img src={user?.avatar} className="w-10 h-10 rounded-full bg-slate-100"/>
                </div>
                <div className="flex-1">
                    <textarea 
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        placeholder="Neler oluyor?"
                        className="w-full text-base outline-none resize-none h-24 bg-transparent placeholder:text-slate-400 text-slate-900 font-medium pt-2"
                    />
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
                        <button 
                            onClick={() => setShowTagSelector(true)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedContext ? 'bg-indigo-50 text-indigo-600' : 'text-indigo-500 hover:bg-indigo-50'}`}
                        >
                            <Tag size={16}/> {selectedContext || 'Okul/Konu Seç'}
                        </button>

                        <button 
                            onClick={handlePost} 
                            disabled={!newPostContent.trim() || !selectedContext || isChecking} 
                            className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 active:scale-95"
                        >
                            {isChecking ? 'Kontrol...' : 'Paylaş'}
                        </button>
                    </div>
                </div>
            </div>

            {/* SAFETY VIOLATION MODAL */}
            {safetyViolation && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95">
                         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                             <ShieldAlert size={32} className="text-red-600"/>
                         </div>
                         <h3 className="text-xl font-black text-slate-800 mb-2">İçerik Engellendi</h3>
                         <p className="text-slate-500 font-medium mb-6">{safetyViolation}</p>
                         <button onClick={() => setSafetyViolation(null)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors">
                             Anlaşıldı
                         </button>
                    </div>
                </div>
            )}

            {showTagSelector && (
                <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
                    <Header title="Okul/Konu Seç" onBack={() => setShowTagSelector(false)} />
                    <div className="flex-1 overflow-y-auto p-4">
                        <p className="text-sm text-slate-500 mb-4 font-medium">Paylaşımınızın konusunu veya ilgili okulu seçin.</p>
                        
                        <h4 className="font-black text-slate-900 mb-3 tracking-tight">KONULAR</h4>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                            {allExamTopics.map((t, i) => (
                                <button key={t.id} onClick={() => {setSelectedContext(t.name); setShowTagSelector(false);}} className={`w-full text-left p-4 hover:bg-slate-50 flex items-center justify-between group ${i !== allExamTopics.length-1 ? 'border-b border-slate-50' : ''} ${selectedContext === t.name ? 'bg-indigo-50' : ''}`}>
                                    <span className={`font-bold group-hover:text-indigo-600 ${selectedContext === t.name ? 'text-indigo-600' : 'text-slate-700'}`}>{t.name}</span>
                                    <div className="flex items-center gap-2">
                                        {t.isPremium && <Crown size={16} className="text-amber-500 fill-amber-500"/>}
                                        {selectedContext === t.name && <CheckCircle size={16} className="text-indigo-600"/>}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <h4 className="font-black text-slate-900 mb-3 tracking-tight">OKULLAR</h4>
                         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {allSchools.map((s, i) => (
                                <button key={s.id} onClick={() => {setSelectedContext(s.name); setShowTagSelector(false);}} className={`w-full text-left p-4 hover:bg-slate-50 flex items-center justify-between group ${i !== allSchools.length-1 ? 'border-b border-slate-50' : ''} ${selectedContext === s.name ? 'bg-indigo-50' : ''}`}>
                                    <span className={`font-bold group-hover:text-indigo-600 ${selectedContext === s.name ? 'text-indigo-600' : 'text-slate-700'}`}>{s.name}</span>
                                    <div className="flex items-center gap-2">
                                        {s.name !== user?.schoolName && <Lock size={16} className="text-slate-300 group-hover:text-slate-500"/>}
                                        {selectedContext === s.name && <CheckCircle size={16} className="text-indigo-600"/>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                         <h3 className="text-lg font-bold text-slate-800 mb-4">Şikayet Nedeni</h3>
                         <div className="space-y-2">
                             {['Müstehcenlik', 'Nefret Söylemi / Hakaret', 'Spam / Reklam', 'Yanlış Bilgi'].map(reason => (
                                 <button key={reason} onClick={() => handleReport(reason)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium border border-slate-100">
                                     {reason}
                                 </button>
                             ))}
                         </div>
                         <button onClick={() => setShowReportModal(null)} className="mt-4 w-full py-2 text-slate-500 font-bold">İptal</button>
                    </div>
                </div>
            )}

            <div className="divide-y divide-slate-100">
                {posts.map(post => (
                    <div key={post.id} className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer relative">
                        <div className="flex gap-3">
                            <div className="shrink-0">
                                <img 
                                    src={post.userAvatar} 
                                    onClick={(e) => { e.stopPropagation(); onViewUser(post.userId); }}
                                    className="w-12 h-12 rounded-full bg-slate-200 border border-slate-100 hover:opacity-90 transition-opacity" 
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span onClick={(e) => { e.stopPropagation(); onViewUser(post.userId); }} className="font-bold text-slate-900 hover:underline">{post.userName}</span>
                                            <span className="text-slate-400 text-sm">@{post.userSchool.replace(/\s/g, '').toLowerCase().substring(0, 10)}...</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id); }} 
                                            className="text-slate-300 hover:text-indigo-500 p-1"
                                        >
                                            <MoreHorizontal size={16}/>
                                        </button>
                                        
                                        {activeMenuPostId === post.id && (
                                            <div className="absolute right-0 top-6 bg-white shadow-xl border border-slate-100 rounded-xl py-1 w-32 z-10 overflow-hidden animate-in fade-in zoom-in-95">
                                                {post.userId === user?.id ? (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                                                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14}/> Sil
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setShowReportModal({postId: post.id}); setActiveMenuPostId(null); }}
                                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Flag size={14}/> Şikayet Et
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {post.relatedContext && <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold tracking-wide uppercase">{post.relatedContext}</span>}
                                
                                <div className="mt-1.5">
                                    <p className="text-slate-800 text-[15px] leading-normal whitespace-pre-wrap font-medium">{post.content}</p>
                                </div>

                                <div className="flex justify-between items-center mt-3 pr-8 max-w-sm">
                                    <button onClick={(e) => { e.stopPropagation(); setShowCommentInput(showCommentInput === post.id ? null : post.id); }} className="flex items-center gap-2 text-slate-500 text-xs group hover:text-blue-500 transition-colors p-1">
                                        <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors"><MessageCircle size={18} /></div>
                                        <span className="font-bold">{post.comments.length > 0 ? post.comments.length : ''}</span>
                                    </button>
                                    
                                    <button onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }} className={`flex items-center gap-2 text-xs group transition-colors p-1 ${post.likedBy.includes(user?.id || '') ? 'text-pink-600' : 'text-slate-500 hover:text-pink-600'}`}>
                                        <div className="p-1.5 rounded-full group-hover:bg-pink-50 transition-colors"><Heart size={18} fill={post.likedBy.includes(user?.id || '') ? 'currentColor' : 'none'} /></div>
                                        <span className="font-bold">{post.likes > 0 ? post.likes : ''}</span>
                                    </button>
                                        
                                    <button onClick={(e) => { e.stopPropagation(); toggleDislike(post.id); }} className={`flex items-center gap-2 text-xs group transition-colors p-1 ${post.dislikedBy.includes(user?.id || '') ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
                                        <div className="p-1.5 rounded-full group-hover:bg-slate-200 transition-colors"><ThumbsDown size={18} fill={post.dislikedBy.includes(user?.id || '') ? 'currentColor' : 'none'} /></div>
                                        <span className="font-bold">{post.dislikes > 0 ? post.dislikes : ''}</span>
                                    </button>

                                    <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-500 p-1 group">
                                         <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors"><Share2 size={18} /></div>
                                    </button>
                                </div>

                                {(showCommentInput === post.id) && (
                                    <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1" onClick={e => e.stopPropagation()}>
                                        <input 
                                            value={commentText} 
                                            onChange={e => setCommentText(e.target.value)}
                                            placeholder="Yanıtını gönder" 
                                            className="flex-1 text-sm px-4 py-2 rounded-full bg-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            autoFocus
                                        />
                                        <button onClick={() => handleComment(post.id)} className="bg-indigo-600 text-white px-4 rounded-full text-sm font-bold disabled:opacity-50 hover:bg-indigo-700" disabled={!commentText.trim()}>Gönder</button>
                                    </div>
                                )}

                                {post.comments.length > 0 && (
                                    <div className="mt-3 space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        {post.comments.map(c => (
                                            <div key={c.id} className="flex gap-3 text-sm">
                                                <img src={c.userAvatar} className="w-6 h-6 rounded-full bg-white border border-slate-200"/>
                                                <div>
                                                    <span className="font-bold text-slate-900 mr-2">{c.userName}</span>
                                                    <span className="text-slate-600 font-medium">{c.content}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const QuizScreen: React.FC<{ 
    topic: string, 
    subTopic: string, 
    onBack: () => void,
    onComplete: (score: number) => void
}> = ({ topic, subTopic, onBack, onComplete }) => {
    const { getHybridQuestions, consumeFreeTest, completeTest, language, user, allQuestions } = useApp();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [explaining, setExplaining] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    
    // Setup States
    const [manualCount, setManualCount] = useState(5);
    const [isFixedCount, setIsFixedCount] = useState(false);
    const [duration, setDuration] = useState(10); // Minutes

    // Active Quiz States
    const [timeLeft, setTimeLeft] = useState(0); // Seconds

    // Check if we have a fixed quiz in DB (Admin created)
    useEffect(() => {
        if (!hasStarted) {
            const availableDbQuestions = allQuestions.filter(q => {
                 const topicMatch = q.topic?.toLowerCase().includes(topic.toLowerCase());
                 const subMatch = subTopic && subTopic !== 'Genel Deneme Sınavı' && subTopic !== 'General Practice Exam' && subTopic !== 'Genel' ? q.subTopic?.toLowerCase().includes(subTopic.toLowerCase()) : true;
                 if (subTopic === 'Sabit Konu') return topicMatch && q.subTopic === subTopic;
                 return topicMatch && subMatch;
            });

            if (availableDbQuestions.length > 0) {
                setManualCount(availableDbQuestions.length);
                setIsFixedCount(true);
            }
        }
    }, [topic, subTopic, allQuestions, hasStarted]);

    // Timer Logic
    useEffect(() => {
        if (hasStarted && !showResult && !loading && timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else if (hasStarted && !showResult && !loading && timeLeft === 0) {
            // Time is up
            setShowResult(true);
            completeTest(score + (selectedOption === questions[currentIndex].correctIndex ? 1 : 0));
        }
    }, [hasStarted, showResult, loading, timeLeft, currentIndex, questions, score, completeTest, selectedOption]);


    const startTest = async () => {
        setLoading(true);
        consumeFreeTest();
        const qs = await getHybridQuestions(topic, subTopic, manualCount);
        setQuestions(qs);
        setTimeLeft(duration * 60);
        setLoading(false);
        setHasStarted(true);
    };

    const handleAnswer = (index: number) => {
        setSelectedOption(index);
        if (index === questions[currentIndex].correctIndex) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setExplanation(null);
        } else {
            setShowResult(true);
            completeTest(score + (selectedOption === questions[currentIndex].correctIndex ? 1 : 0));
        }
    };

    const handleExplain = async () => {
        setExplaining(true);
        const q = questions[currentIndex];
        const text = await explainAnswer(q.text, q.options[q.correctIndex], language);
        setExplanation(text);
        setExplaining(false);
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Intro Screen (Setup)
    if (!hasStarted) {
        return (
            <div className="h-full flex flex-col bg-slate-50">
                 <Header title="Sınav Hazırlık" onBack={onBack} />
                 <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2 animate-bounce">
                        <BookOpen size={48} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{topic}</h2>
                        <p className="text-slate-500 font-medium mt-1">{subTopic}</p>
                    </div>

                    <div className="w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Soru Sayısı</label>
                            <div className="flex items-center justify-center gap-4">
                                {!isFixedCount && (
                                    <button onClick={() => setManualCount(Math.max(3, manualCount - 1))} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowLeft size={16}/></button>
                                )}
                                <span className="text-2xl font-black text-slate-800 w-12">{manualCount}</span>
                                {!isFixedCount && (
                                    <button onClick={() => setManualCount(Math.min(20, manualCount + 1))} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowRight size={16}/></button>
                                )}
                                {isFixedCount && <Lock size={20} className="text-slate-400 ml-2"/>}
                            </div>
                            {isFixedCount && <p className="text-xs text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded mt-2 font-bold">Admin Tarafından Belirlendi</p>}
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                             <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Süre (Dakika)</label>
                             <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setDuration(Math.max(1, duration - 1))} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowLeft size={16}/></button>
                                <span className="text-2xl font-black text-slate-800 w-12">{duration}</span>
                                <button onClick={() => setDuration(Math.min(60, duration + 1))} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowRight size={16}/></button>
                             </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-50">
                            <p className="text-sm text-slate-500">
                                {user?.subscriptionTier === 'FREE' 
                                    ? `Kalan Ücretsiz Hak: ${5 - (user.freeTestsUsed || 0)}`
                                    : 'Premium Üye: Sınırsız Hak'}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={startTest} 
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Yükleniyor...' : 'Testi Başlat'}
                    </button>
                 </div>
            </div>
        )
    }

    if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    if (showResult) {
        return (
            <div className="h-full flex flex-col bg-white items-center justify-center p-8 text-center space-y-6">
                <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center text-6xl animate-bounce">🏆</div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Harika İş!</h2>
                    <p className="text-slate-500 mt-2">Testi tamamladın.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl w-full border border-slate-100">
                    <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Skorun</p>
                    <p className="text-5xl font-black text-indigo-600 mt-2">{score} / {questions.length}</p>
                </div>
                <button onClick={() => { onComplete(score); onBack(); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform">
                    Tamamla
                </button>
            </div>
        );
    }

    const q = questions[currentIndex];
    const isCorrect = selectedOption === q.correctIndex;

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <Header title="Quiz" onBack={() => {
                if(window.confirm("Testten çıkmak istiyor musun? İlerlemen kaybolacak.")) onBack();
            }} rightAction={
                <div className={`flex items-center gap-2 font-black px-3 py-1 rounded-full border ${timeLeft < 60 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    <TimerIcon size={16} /> {formatTime(timeLeft)}
                </div>
            } />
            <div className="p-4 flex-1 overflow-y-auto">
                {/* Progress */}
                <div className="flex gap-1 mb-6">
                    {questions.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= currentIndex ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-3 inline-block">Soru {currentIndex + 1}</span>
                    <h3 className="text-xl font-bold text-slate-800 leading-snug">{q.text}</h3>
                </div>

                <div className="space-y-3">
                    {q.options.map((opt, i) => {
                        let stateClass = "bg-white border-slate-100 hover:border-indigo-200";
                        if (selectedOption !== null) {
                            if (i === q.correctIndex) stateClass = "bg-green-50 border-green-500 text-green-700";
                            else if (i === selectedOption) stateClass = "bg-red-50 border-red-500 text-red-700";
                            else stateClass = "opacity-50";
                        }
                        return (
                            <button 
                                key={i}
                                disabled={selectedOption !== null}
                                onClick={() => handleAnswer(i)}
                                className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all ${stateClass} shadow-sm`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {selectedOption !== null && (
                    <div className="mt-6 animate-in slide-in-from-bottom fade-in">
                        <div className={`p-4 rounded-2xl mb-4 flex items-start gap-3 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isCorrect ? <CheckCircle className="shrink-0"/> : <XCircle className="shrink-0"/>}
                            <div>
                                <p className="font-bold">{isCorrect ? 'Doğru!' : 'Yanlış!'}</p>
                                <p className="text-sm opacity-90 mt-1">{explanation || q.explanation}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={handleExplain} disabled={explaining || !!explanation} className="flex-1 bg-white border border-indigo-100 text-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm">
                                {explaining ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>} {explanation ? 'Açıklandı' : 'CEVABI AÇIKLA'}
                            </button>
                            <button onClick={handleNext} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                                Sıradaki <ArrowRight size={18}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HomeScreen: React.FC<{
    onStartQuiz: (topic: string, subTopic: string) => void,
    onOpenNotifications: () => void,
    onRequirePremium: () => void
}> = ({ onStartQuiz, onOpenNotifications, onRequirePremium }) => {
    const { user, allExamTopics, allSchools } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    
    const popularTopics = allExamTopics.filter(t => t.isPopular);
    const filteredTopics = searchQuery 
        ? allExamTopics.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : popularTopics;

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-24">
            {/* Custom Header for Home */}
            <div className="bg-white px-6 pt-6 pb-4 rounded-b-[2.5rem] shadow-sm border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <img src={user?.avatar} className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm"/>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hoşgeldin,</p>
                            <h1 className="text-xl font-black text-slate-800">{user?.name}</h1>
                        </div>
                    </div>
                    <button onClick={onOpenNotifications} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-colors relative">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                    <input 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Ne öğrenmek istersin?" 
                        className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Quick Stats */}
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    <div className="min-w-[140px] bg-indigo-500 text-white p-4 rounded-3xl shadow-lg shadow-indigo-200">
                        <Trophy size={24} className="mb-2 opacity-80"/>
                        <p className="text-3xl font-black">{user?.points}</p>
                        <p className="text-xs font-medium opacity-80">Toplam Puan</p>
                    </div>
                    <div className="min-w-[140px] bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                        <CheckCircle size={24} className="mb-2 text-green-500"/>
                        <p className="text-3xl font-black text-slate-800">{user?.testsCompleted}</p>
                        <p className="text-xs font-medium text-slate-500">Tamamlanan Test</p>
                    </div>
                </div>

                {/* Topics */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-black text-slate-800">{searchQuery ? 'Arama Sonuçları' : 'Popüler Konular'}</h3>
                        {!searchQuery && <span className="text-xs font-bold text-indigo-600 cursor-pointer">Tümünü Gör</span>}
                    </div>
                    
                    {filteredTopics.length === 0 && searchQuery && (
                        <div className="text-center py-8">
                            <p className="text-slate-500 mb-4">Aradığınız konu listede yok.</p>
                            <button 
                                onClick={() => onStartQuiz(searchQuery, 'Özel Konu')}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg"
                            >
                                "{searchQuery}" ile Sınav Başlat
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredTopics.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => {
                                    if (t.isPremium && user?.subscriptionTier !== 'PREMIUM') {
                                        onRequirePremium();
                                    } else {
                                        // Use 'Sabit Konu' for the specific mock test
                                        if (t.name === 'Test Sınavı') {
                                            onStartQuiz(t.name, 'Sabit Konu');
                                        } else {
                                            onStartQuiz(t.name, 'Genel');
                                        }
                                    }
                                }}
                                className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden`}
                            >
                                {t.isPremium && <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl z-10">PREMIUM</div>}
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                                    <BookOpen size={20}/>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight">{t.name}</h4>
                                <p className="text-xs text-slate-400 mt-1">{t.category}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileScreen: React.FC<{ 
    userId?: string, 
    onBack?: () => void,
    onRequirePremium: () => void
}> = ({ userId, onBack, onRequirePremium }) => {
    const { user, allUsers, logout, setLanguage, language, gradeLevel, setGradeLevel } = useApp();
    const targetUser = userId ? allUsers.find(u => u.id === userId) : user;

    if (!targetUser) return null;
    const isMe = targetUser.id === user?.id;

    const ProfileMenuItem: React.FC<{icon: any, label: string, value?: string, onClick?: () => void, highlight?: boolean}> = ({ icon: Icon, label, value, onClick, highlight }) => (
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group active:bg-slate-100">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${highlight ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors'}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700 text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{value}</span>}
                <ChevronRight size={16} className="text-slate-300"/>
            </div>
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-24">
            {/* Header with Curve */}
            <div className="relative bg-white pb-6 rounded-b-[2.5rem] shadow-sm overflow-hidden mb-6">
                 {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-white"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>

                <Header title={isMe ? "Profilim" : "Kullanıcı Profili"} onBack={onBack} transparent />
                
                <div className="flex flex-col items-center relative z-10 mt-2">
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <img src={targetUser.avatar} className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-xl relative z-10"/>
                        {isMe && <div className="absolute bottom-1 right-1 z-20 bg-slate-800 text-white p-2 rounded-full border-2 border-white shadow-sm"><Edit2 size={14}/></div>}
                        {targetUser.subscriptionTier === 'PREMIUM' && (
                            <div className="absolute top-0 right-0 z-20 bg-amber-400 text-white p-1.5 rounded-full border-2 border-white shadow-sm animate-pulse">
                                <Crown size={16} fill="currentColor"/>
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mt-4">{targetUser.name}</h2>
                    <p className="text-slate-500 font-medium text-sm bg-slate-100 px-3 py-1 rounded-full mt-2">{targetUser.schoolName}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-6">
                {/* Stats Row */}
                <div className="flex gap-4">
                    <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8"></div>
                        <Trophy className="text-amber-500 mb-2" size={24} />
                        <p className="text-2xl font-black text-slate-800">{targetUser.points}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Puan</p>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8"></div>
                        <CheckCircle className="text-indigo-500 mb-2" size={24} />
                        <p className="text-2xl font-black text-slate-800">{targetUser.testsCompleted}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Test</p>
                    </div>
                </div>

                {isMe ? (
                    <div className="space-y-6">
                        {/* Settings Group */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Tercihler</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <ProfileMenuItem 
                                    icon={Globe2} 
                                    label="Dil / Language" 
                                    value={language} 
                                    onClick={() => setLanguage(language === 'TR' ? 'EN' : 'TR')} 
                                />
                                <ProfileMenuItem 
                                    icon={GraduationCap} 
                                    label="Eğitim Seviyesi" 
                                    value={gradeLevel === GradeLevel.PRIMARY ? 'İlkokul' : 'Ortaokul'} 
                                    onClick={() => setGradeLevel(gradeLevel === GradeLevel.PRIMARY ? GradeLevel.MIDDLE : GradeLevel.PRIMARY)} 
                                />
                            </div>
                        </div>

                        {/* Premium Card */}
                        {targetUser.subscriptionTier !== 'PREMIUM' ? (
                            <div onClick={onRequirePremium} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden cursor-pointer group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-colors"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-amber-400 text-sm mb-1 flex items-center gap-1"><Crown size={14} fill="currentColor"/> PRO ÜYELİK</p>
                                        <h3 className="text-xl font-black">Premium'a Geç</h3>
                                        <p className="text-slate-400 text-xs mt-1">Sınırsız test ve analizlerin kilidini aç.</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm"><Crown size={24} fill="currentColor" /></div>
                                    <div>
                                        <h3 className="font-black text-lg">Premium Üyesin</h3>
                                        <p className="text-white/80 text-xs font-medium">Ayrıcalıkların keyfini çıkar.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button onClick={logout} className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-2xl transition-colors flex items-center justify-center gap-2">
                            <LogOut size={18} /> Çıkış Yap
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-500 text-sm">Bu kullanıcı hakkında daha fazla bilgi görüntülenemiyor.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const MobileApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'home' | 'social' | 'messages' | 'leaderboard' | 'profile'>('home');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [quizConfig, setQuizConfig] = useState<{topic: string, subTopic: string} | null>(null);
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);

    const renderContent = () => {
        if (showNotifications) {
            return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
        }
        if (viewingUserId) {
            return <ProfileScreen userId={viewingUserId} onBack={() => setViewingUserId(null)} onRequirePremium={() => setShowPremiumModal(true)} />;
        }
        if (quizConfig) {
            return (
                <QuizScreen 
                    topic={quizConfig.topic} 
                    subTopic={quizConfig.subTopic} 
                    onBack={() => setQuizConfig(null)} 
                    onComplete={() => {}}
                />
            );
        }

        switch (activeTab) {
            case 'home': 
                return <HomeScreen onStartQuiz={(t, st) => setQuizConfig({topic: t, subTopic: st})} onOpenNotifications={() => setShowNotifications(true)} onRequirePremium={() => setShowPremiumModal(true)} />;
            case 'social': 
                return <TimelineScreen onRequirePremium={() => setShowPremiumModal(true)} onViewUser={(id) => setViewingUserId(id)} />;
            case 'leaderboard':
                return <LeaderboardScreen onViewUser={(id) => setViewingUserId(id)} />;
            case 'messages': 
                return <MessagesScreen />;
            case 'profile': 
                return <ProfileScreen onRequirePremium={() => setShowPremiumModal(true)} />;
            default: return null;
        }
    };

    return (
        <div className="h-full bg-white flex flex-col relative overflow-hidden rounded-none md:rounded-2xl">
            {/* Screen Content */}
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>

            {/* Tab Bar */}
            {!quizConfig && !viewingUserId && !showNotifications && (
                <div className="bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center absolute bottom-0 w-full pb-8 md:pb-4 z-20 max-w-full">
                    {[
                        { id: 'home', icon: Home, label: 'Home' },
                        { id: 'social', icon: Globe, label: 'Social' },
                        { id: 'leaderboard', icon: Trophy, label: 'Leader' },
                        { id: 'messages', icon: MessageCircle, label: 'Chat' },
                        { id: 'profile', icon: UserIcon, label: 'Profile' },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            <span className="text-[10px] font-bold tracking-wide hidden sm:block">{tab.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Premium Modal Overlay */}
            {showPremiumModal && <SubscriptionScreen onClose={() => setShowPremiumModal(false)} />}
        </div>
    );
};

export default MobileApp;

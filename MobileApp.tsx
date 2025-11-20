
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../Store';
import { 
  Home, User as UserIcon, Map, BookOpen, 
  Clock, Lock, MessageCircle, Share2,
  ArrowLeft, CheckCircle, XCircle, Trophy, Crown,
  Search, Edit2, Save, Timer as TimerIcon,
  Bell, Send, Mail, Info, GraduationCap, Tag, ChevronRight,
  Camera, ToggleLeft, ToggleRight, Heart, Image as ImageIcon,
  Sparkles, Hash, List, Globe, X, Filter, Settings, Globe2, AlertTriangle, MoreHorizontal, Plus, ThumbsDown, Trash2, Flag, Play, HelpCircle, RefreshCw, ArrowRight, LogOut, ShieldAlert, Eye, Star
} from 'lucide-react';
import { MobileButton, Card, Badge } from '../components/MobileComponents';
import { SubscriptionTier, Question, SocialPost, GradeLevel } from '../types';
import { explainAnswer, checkContentSafety } from '../services/geminiService';

// --- Helper Components ---

const Header: React.FC<{ title: string, onBack?: () => void, rightAction?: React.ReactNode, transparent?: boolean, darkMode?: boolean }> = ({ title, onBack, rightAction, transparent, darkMode }) => (
    <div className={`px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-all shrink-0 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-gray-100/50'}`}>
        <div className="flex items-center gap-3">
            {onBack && <button onClick={onBack} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-slate-800'}`}><ArrowLeft size={20} /></button>}
            <h2 className={`text-lg font-bold tracking-tight font-sans ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
        </div>
        {rightAction}
    </div>
);

const BottomNav: React.FC<{ activeTab: string, setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'Ana Sayfa' },
        { id: 'timeline', icon: Globe, label: 'Akış' },
        { id: 'leaderboard', icon: Trophy, label: 'Liderler' },
        { id: 'messages', icon: MessageCircle, label: 'Mesajlar' },
        { id: 'profile', icon: UserIcon, label: 'Profil' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe pt-2 px-6 flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'text-amber-500 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <item.icon size={activeTab === item.id ? 24 : 22} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? 'drop-shadow-sm' : ''} />
                    {activeTab === item.id && <span className="text-[10px] font-black tracking-wide animate-in fade-in slide-in-from-bottom-1">{item.label}</span>}
                </button>
            ))}
        </div>
    );
};

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
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 max-w-5xl mx-auto w-full">
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
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-5xl mx-auto w-full pb-32">
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
            <div className="flex-1 overflow-y-auto pb-32 px-2">
                <div className="max-w-5xl mx-auto w-full">
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
            <div className="h-full flex flex-col bg-slate-50 pb-24">
                <Header title="Sohbet" onBack={() => setActiveConversation(null)} />
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-5xl mx-auto w-full pb-32">
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
                <div className="p-3 bg-white border-t border-slate-100 flex gap-2 sticky bottom-0 pb-8 safe-area-bottom max-w-5xl mx-auto w-full shadow-lg shadow-slate-100">
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
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="max-w-5xl mx-auto w-full">
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
        <div className="h-full flex flex-col bg-slate-50 pb-32">
            <Header title="Liderlik Tablosu" />
            
            <div className="bg-white border-b border-slate-100 p-4 space-y-3 sticky top-[53px] z-20">
                <div className="max-w-5xl mx-auto w-full space-y-3">
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
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="max-w-5xl mx-auto w-full space-y-3">
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
        <div className="h-full flex flex-col bg-white pb-32 relative" onClick={() => setActiveMenuPostId(null)}>
            <Header title="Akış" />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex gap-3">
                            <img src={user?.avatar} className="w-10 h-10 rounded-full bg-slate-100" />
                            <div className="flex-1">
                                <textarea
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    placeholder="Sınavlar nasıl geçti?"
                                    className="w-full resize-none outline-none text-slate-800 placeholder:text-slate-400 text-base min-h-[60px]"
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <button 
                                        onClick={() => setShowTagSelector(true)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${selectedContext ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {selectedContext ? <><Tag size={12}/> {selectedContext}</> : 'Okul/Konu Seç'}
                                    </button>
                                    <button 
                                        onClick={handlePost}
                                        disabled={!newPostContent.trim() || isChecking}
                                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-md shadow-amber-200"
                                    >
                                        {isChecking ? <RefreshCw size={16} className="animate-spin"/> : 'Paylaş'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {posts.map(post => (
                        <div key={post.id} className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <div className="flex gap-3">
                                <img onClick={() => onViewUser(post.userId)} src={post.userAvatar} className="w-10 h-10 rounded-full bg-slate-100 cursor-pointer" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start relative">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <span onClick={() => onViewUser(post.userId)} className="font-bold text-slate-900 text-sm hover:underline cursor-pointer truncate">{post.userName}</span>
                                                <span className="text-slate-400 text-sm">· {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 truncate">{post.userSchool}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id); }} className="text-slate-300 hover:text-slate-500 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                        
                                        {/* Post Menu */}
                                        {activeMenuPostId === post.id && (
                                            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-slate-100 z-10 w-32 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                                                {post.userId === user?.id ? (
                                                    <button onClick={() => deletePost(post.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 flex items-center gap-2"><Trash2 size={14}/> Sil</button>
                                                ) : (
                                                    <button onClick={() => setShowReportModal({postId: post.id})} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 font-medium hover:bg-slate-50 flex items-center gap-2"><Flag size={14}/> Raporla</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="text-slate-800 text-[15px] leading-relaxed mt-1">{post.content}</p>
                                    
                                    {post.relatedContext && (
                                        <span className="inline-block mt-2 text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">#{post.relatedContext}</span>
                                    )}

                                    <div className="flex items-center justify-between mt-3 max-w-md">
                                        <button onClick={() => setShowCommentInput(showCommentInput === post.id ? null : post.id)} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-500 text-xs font-medium group transition-colors">
                                            <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors"><MessageCircle size={18} /></div>
                                            {post.comments.length > 0 && <span>{post.comments.length}</span>}
                                        </button>
                                        <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-xs font-medium group transition-colors ${post.likedBy.includes(user?.id || '') ? 'text-pink-500' : 'text-slate-500 hover:text-pink-500'}`}>
                                            <div className="p-1.5 rounded-full group-hover:bg-pink-50 transition-colors"><Heart size={18} fill={post.likedBy.includes(user?.id || '') ? "currentColor" : "none"} /></div>
                                            {post.likes > 0 && <span>{post.likes}</span>}
                                        </button>
                                         <button onClick={() => toggleDislike(post.id)} className={`flex items-center gap-1.5 text-xs font-medium group transition-colors ${post.dislikedBy.includes(user?.id || '') ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'}`}>
                                            <div className="p-1.5 rounded-full group-hover:bg-orange-50 transition-colors"><ThumbsDown size={18} fill={post.dislikedBy.includes(user?.id || '') ? "currentColor" : "none"} /></div>
                                            {post.dislikes > 0 && <span>{post.dislikes}</span>}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-slate-500 hover:text-green-500 text-xs font-medium group transition-colors">
                                            <div className="p-1.5 rounded-full group-hover:bg-green-50 transition-colors"><Share2 size={18} /></div>
                                        </button>
                                    </div>

                                    {showCommentInput === post.id && (
                                        <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                                            <input 
                                                value={commentText}
                                                onChange={e => setCommentText(e.target.value)}
                                                placeholder="Yorum yaz..."
                                                className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button onClick={() => handleComment(post.id)} className="text-indigo-600 font-bold text-xs px-3 hover:bg-indigo-50 rounded-xl">Gönder</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showTagSelector && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
                    <Header title="Konu/Okul Seç" onBack={() => setShowTagSelector(false)} />
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 max-w-5xl mx-auto w-full">
                         <div>
                            <h4 className="font-bold text-slate-900 mb-2 px-2">Sınav Konuları</h4>
                            <div className="space-y-1">
                                {allExamTopics.map(t => (
                                    <button key={t.id} onClick={() => { setSelectedContext(t.name); setShowTagSelector(false); }} className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left ${selectedContext === t.name ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-700'}`}>
                                        <div className="flex items-center gap-3">
                                            {t.isPremium ? <Crown size={16} className="text-amber-500"/> : <Hash size={16} className="text-slate-400"/>}
                                            <span className="font-medium">{t.name}</span>
                                        </div>
                                        {selectedContext === t.name && <CheckCircle size={18} className="text-indigo-600"/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-bold text-slate-900 mb-2 px-2">Okullar</h4>
                             <div className="space-y-1">
                                {allSchools.map(s => (
                                    <button key={s.id} onClick={() => { setSelectedContext(s.name); setShowTagSelector(false); }} className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left ${selectedContext === s.name ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-700'}`}>
                                        <div className="flex items-center gap-3">
                                            {s.isPremium ? <Crown size={16} className="text-amber-500"/> : <GraduationCap size={16} className="text-slate-400"/>}
                                            <span className="font-medium">{s.name}</span>
                                        </div>
                                        {selectedContext === s.name && <CheckCircle size={18} className="text-indigo-600"/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Bildir</h3>
                        <div className="space-y-2">
                            {['İstenmeyen İçerik', 'Nefret Söylemi', 'Müstehcenlik', 'Zorbalık'].map(r => (
                                <button key={r} onClick={() => handleReport(r)} className="w-full p-3 text-left text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                                    {r}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowReportModal(null)} className="w-full mt-4 py-3 text-slate-400 font-bold text-sm">İptal</button>
                    </div>
                </div>
            )}

            {safetyViolation && (
                <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 border-4 border-red-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <ShieldAlert size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 text-center mb-2">İçerik Engellendi</h3>
                        <p className="text-slate-500 text-center text-sm mb-6 leading-relaxed">
                            {safetyViolation}
                        </p>
                        <button onClick={() => setSafetyViolation(null)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-colors">
                            Tamam, anlaşıldı
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const ProfileScreen: React.FC<{ onOpenPremium: () => void, onViewUser?: string }> = ({ onOpenPremium, onViewUser }) => {
    const { user: me, allUsers, logout, updateUserProfile, updateUserAvatar, setLanguage, language, shareAppAndGetReward } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    
    // Determine which user to show. If onViewUser is present, find that user. Else show me.
    const profileUser = onViewUser ? allUsers.find(u => u.id === onViewUser) : me;
    const isMe = !onViewUser || onViewUser === me?.id;

    if (!profileUser) return null;

    const handleSave = () => {
        if(isMe && me?.subscriptionTier === 'FREE') {
            onOpenPremium();
            return;
        }
        updateUserProfile(editName, profileUser.schoolName); // Simplification
        setIsEditing(false);
    };

    const handleAvatarChange = () => {
         if(isMe && me?.subscriptionTier === 'FREE') {
            onOpenPremium();
            return;
        }
        const seed = prompt("Yeni avatar için bir kelime girin:");
        if (seed) updateUserAvatar(seed);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-32">
            {/* Profile Header */}
            <div className="bg-white pb-6 rounded-b-[3rem] shadow-sm border-b border-slate-100 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white pointer-events-none"></div>
                <Header title={isMe ? (language === 'TR' ? 'Profilim' : 'My Profile') : 'Kullanıcı Profili'} transparent />
                
                <div className="flex flex-col items-center relative z-10 mt-2">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full p-1 bg-white shadow-lg mb-4 relative overflow-hidden">
                            <img src={profileUser.avatar} className="w-full h-full rounded-full bg-slate-100" />
                        </div>
                        {isMe && (
                            <button onClick={handleAvatarChange} className="absolute bottom-4 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                                <Camera size={16} />
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="flex items-center gap-2 mb-1">
                            <input 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)}
                                className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-center font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button onClick={handleSave} className="p-1 bg-green-500 text-white rounded-md"><Save size={16}/></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{profileUser.name}</h2>
                            {isMe && <button onClick={() => { setEditName(profileUser.name); setIsEditing(true); }}><Edit2 size={16} className="text-slate-400 hover:text-indigo-600"/></button>}
                        </div>
                    )}
                    
                    <p className="text-slate-500 font-medium text-sm mb-4">{profileUser.schoolName}</p>

                    <div className="flex gap-2">
                        {profileUser.subscriptionTier === 'PREMIUM' ? (
                            <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-amber-200 shadow-sm">
                                <Crown size={14} fill="currentColor"/> Premium Üye
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">Ücretsiz Üye</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-4 -mt-8 relative z-20 max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-indigo-600">{profileUser.points}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Puan</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-violet-600">{profileUser.testsCompleted || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Test</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-amber-500">#{Math.floor(Math.random() * 100) + 1}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Sıra</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {isMe && (
            <div className="px-4 mt-6 space-y-4 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setLanguage(language === 'TR' ? 'EN' : 'TR')}>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><Globe2 size={20} /></div>
                            <span className="font-bold text-slate-700">Dil / Language</span>
                        </div>
                        <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-500">{language}</span>
                    </div>
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={shareAppAndGetReward}>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-xl text-green-600"><Share2 size={20} /></div>
                            <div className="text-left">
                                <span className="font-bold text-slate-700 block">Arkadaşını Davet Et</span>
                                <span className="text-[10px] text-green-600 font-bold">1 Ay Premium Kazan!</span>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300"/>
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer group" onClick={logout}>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-50 group-hover:bg-red-100 p-2 rounded-xl text-red-500 transition-colors"><LogOut size={20} /></div>
                            <span className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">Çıkış Yap</span>
                        </div>
                    </div>
                </div>

                {profileUser.subscriptionTier === 'FREE' && (
                    <div onClick={onOpenPremium} className="relative overflow-hidden rounded-3xl cursor-pointer group transform transition-transform active:scale-[0.98]">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative p-6 flex items-center justify-between text-white">
                            <div>
                                <h3 className="font-black text-lg mb-1 flex items-center gap-2"><Crown size={20} fill="currentColor" className="text-amber-300"/> Premium'a Geç</h3>
                                <p className="text-indigo-100 text-xs font-medium max-w-[200px]">Reklamsız deneyim ve sınırsız test çözme hakkı.</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                <ArrowRight size={24} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

const QuizScreen: React.FC<{ topic: string, subTopic: string, initialCount: number, initialDuration: number, onFinish: () => void }> = ({ topic, subTopic, initialCount, initialDuration, onFinish }) => {
    const { getHybridQuestions, consumeFreeTest, completeTest, user, language } = useApp();
    
    // Setup States
    const [isSetupMode, setIsSetupMode] = useState(true);
    const [questionCount, setQuestionCount] = useState(initialCount);
    const [duration, setDuration] = useState(initialDuration);
    const [loading, setLoading] = useState(false);
    
    // Quiz Active States
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]); // Store selected index
    const [timeLeft, setTimeLeft] = useState(0); // seconds
    const [isFinished, setIsFinished] = useState(false);
    
    // Review Mode State
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);

    // Load questions initially to check if locked
    useEffect(() => {
        const loadSetup = async () => {
            setLoading(true);
            // Fetch a small batch just to check if DB has fixed questions
            const preview = await getHybridQuestions(topic, subTopic, 999); 
            // If DB returns EXACT match for fixed questions (like our mock data), lock the count
            // In real app, we'd have a metadata flag. Here we heuristic: if count > 0 and comes from DB (no AI delay), we lock.
            // For this demo, we assume if topic is 'Test Sınavı', it is locked.
            if (topic === 'Test Sınavı') {
                setQuestionCount(preview.length); // Force correct count
            }
            setLoading(false);
        };
        loadSetup();
    }, [topic, subTopic]);

    // Timer Logic
    useEffect(() => {
        if (!isSetupMode && !isFinished && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (!isSetupMode && !isFinished && timeLeft === 0) {
            handleFinish();
        }
    }, [isSetupMode, isFinished, timeLeft]);

    const handleStart = async () => {
        setLoading(true);
        const q = await getHybridQuestions(topic, subTopic, questionCount);
        setQuestions(q);
        setTimeLeft(duration * 60);
        setLoading(false);
        setIsSetupMode(false);
        consumeFreeTest();
    };

    const handleOptionSelect = (index: number) => {
        if (isFinished) return;
        const newAnswers = [...userAnswers];
        newAnswers[currentQIndex] = index;
        setUserAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        if(isFinished) return; // Prevent double call
        setIsFinished(true);
        
        // Calculate Score
        let correctCount = 0;
        questions.forEach((q, i) => {
            if (userAnswers[i] === q.correctIndex) correctCount++;
        });
        completeTest(correctCount);
    };

    const handleExplain = async () => {
        if(!questions[currentQIndex]) return;
        const q = questions[currentQIndex];
        const ans = q.options[q.correctIndex];
        setExplanation("Yapay zeka düşünüyor...");
        const text = await explainAnswer(q.text, ans, language);
        setExplanation(text);
    };

    // --- RENDER: SETUP MODE ---
    if (isSetupMode) {
        const isLocked = topic === 'Test Sınavı'; // Hardcoded for demo logic
        return (
            <div className="h-full flex flex-col bg-slate-50">
                <Header title={language === 'TR' ? 'Sınav Kurulumu' : 'Quiz Setup'} onBack={onFinish} />
                <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600 shadow-lg shadow-amber-100">
                        <Settings size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 text-center mb-2">{topic}</h2>
                    <p className="text-slate-500 font-medium mb-8 bg-white px-4 py-1 rounded-full border border-slate-200">{subTopic}</p>

                    <div className="w-full space-y-4">
                         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <label className="font-bold text-slate-700">Soru Sayısı</label>
                                {isLocked && <Lock size={16} className="text-amber-500"/>}
                            </div>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" min="3" max="20" disabled={isLocked}
                                    value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <span className="font-black text-indigo-600 text-xl w-8 text-center">{questionCount}</span>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <label className="font-bold text-slate-700 block mb-2">Süre (Dakika)</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" min="1" max="30" 
                                    value={duration} onChange={e => setDuration(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <span className="font-black text-indigo-600 text-xl w-8 text-center">{duration}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 w-full">
                         <button 
                            onClick={handleStart} disabled={loading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-300 hover:scale-[0.98] transition-transform active:scale-95 flex items-center justify-center gap-2"
                         >
                            {loading ? <RefreshCw className="animate-spin"/> : <Play fill="currentColor"/>}
                            {language === 'TR' ? 'Testi Başlat' : 'Start Quiz'}
                         </button>
                         <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                             Bu testi başlatmak 1 ücretsiz hakkınızı kullanır.
                         </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: RESULT SCREEN ---
    if (isFinished && !isReviewMode) {
        const correctCount = questions.reduce((acc, q, i) => acc + (userAnswers[i] === q.correctIndex ? 1 : 0), 0);
        const score = Math.round((correctCount / questions.length) * 100);

        return (
             <div className="h-full flex flex-col bg-slate-50 animate-in fade-in">
                <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 rounded-full"></div>
                        <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
                            <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                {score >= 70 ? <Trophy size={40} fill="currentColor"/> : <Star size={40} fill="currentColor"/>}
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-1">{score}</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Puan</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">{score >= 70 ? 'Harika İş!' : 'Güzel Deneme!'}</h3>
                    <p className="text-slate-500 font-medium text-center mb-8">
                        {questions.length} sorudan {correctCount} tanesini doğru bildin.
                    </p>

                    <div className="w-full space-y-3">
                        <button onClick={() => { setCurrentQIndex(0); setIsReviewMode(true); }} className="w-full bg-indigo-50 text-indigo-700 font-bold py-4 rounded-2xl hover:bg-indigo-100 transition-colors">
                            Cevapları İncele
                        </button>
                        <button onClick={onFinish} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-300 hover:scale-[0.98] transition-transform active:scale-95">
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
             </div>
        );
    }

    // --- RENDER: QUIZ / REVIEW MODE ---
    const currentQ = questions[currentQIndex];
    const isReview = isReviewMode;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Quiz Header */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100">
                {isReview ? (
                    <button onClick={() => setIsReviewMode(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
                ) : (
                    <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                        <Clock size={20} />
                        <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                    </div>
                )}
                <div className="text-sm font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                    {currentQIndex + 1} / {questions.length}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-32 max-w-2xl mx-auto w-full">
                 <h3 className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
                     {currentQ.text}
                 </h3>

                 <div className="space-y-3">
                     {currentQ.options.map((opt, idx) => {
                         // Styling Logic
                         let optionClass = "bg-white border-2 border-slate-100 text-slate-600 hover:border-indigo-200";
                         let icon = <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">{['A','B','C','D'][idx]}</div>;

                         if (isReview) {
                             if (idx === currentQ.correctIndex) {
                                 optionClass = "bg-green-50 border-green-500 text-green-800";
                                 icon = <CheckCircle size={24} className="text-green-600" fill="currentColor" color="white"/>;
                             } else if (idx === userAnswers[currentQIndex]) {
                                 optionClass = "bg-red-50 border-red-500 text-red-800";
                                 icon = <XCircle size={24} className="text-red-600" fill="currentColor" color="white"/>;
                             }
                         } else {
                             if (userAnswers[currentQIndex] === idx) {
                                 optionClass = "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md shadow-indigo-100";
                                 icon = <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold"><CheckCircle size={14}/></div>;
                             }
                         }

                         return (
                             <button 
                                key={idx} 
                                disabled={isReview}
                                onClick={() => handleOptionSelect(idx)}
                                className={`w-full p-4 rounded-2xl text-left font-medium transition-all active:scale-[0.99] flex items-center justify-between ${optionClass}`}
                             >
                                 <span>{opt}</span>
                                 {icon}
                             </button>
                         )
                     })}
                 </div>

                 {isReview && (
                     <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="text-sm font-bold text-slate-500 uppercase mb-1">Doğru Cevap:</p>
                             <p className="font-bold text-slate-800">{currentQ.options[currentQ.correctIndex]}</p>
                         </div>
                         
                         {explanation && (
                             <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-900 text-sm leading-relaxed animate-in fade-in">
                                 <span className="font-bold block mb-1 flex items-center gap-2"><Sparkles size={14}/> AI Açıklaması:</span>
                                 {explanation}
                             </div>
                         )}

                         <button onClick={handleExplain} className="w-full py-3 border-2 border-indigo-100 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                             <Sparkles size={18}/> CEVABI AÇIKLA
                         </button>
                     </div>
                 )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 pb-8 safe-area-bottom max-w-2xl mx-auto w-full shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                <div className="flex gap-4">
                    {isReview && (
                        <button 
                            disabled={currentQIndex === 0}
                            onClick={() => { setCurrentQIndex(prev => prev - 1); setExplanation(null); }}
                            className="px-4 py-4 bg-slate-100 rounded-2xl text-slate-600 disabled:opacity-50 font-bold"
                        >
                            <ArrowLeft size={24}/>
                        </button>
                    )}
                    
                    <button 
                        onClick={handleNext}
                        className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {currentQIndex === questions.length - 1 ? (isReview ? 'İncelemeyi Bitir' : 'Sınavı Bitir') : 'Sıradaki'}
                        {currentQIndex < questions.length - 1 && <ArrowRight size={20}/>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HomeScreen: React.FC<{ onStartTest: (topic: string, subTopic: string) => void }> = ({ onStartTest }) => {
    const { user, allExamTopics, allSchools, posts, language } = useApp();
    const [searchText, setSearchText] = useState('');
    
    // Filter topics
    const filteredTopics = allExamTopics.filter(t => 
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.category.toLowerCase().includes(searchText.toLowerCase())
    );

    // Custom start if no exact match found
    const hasExactMatch = filteredTopics.some(t => t.name.toLowerCase() === searchText.toLowerCase());

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-32">
            {/* Home Header */}
            <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 sticky top-0 z-20">
                 <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto w-full">
                     <div>
                         <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Hoşgeldin,</p>
                         <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user?.name.split(' ')[0]} 👋</h1>
                     </div>
                     <div className="relative">
                        <img src={user?.avatar} className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-md" />
                        {user?.subscriptionTier === 'PREMIUM' && (
                            <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white text-white"><Crown size={10} fill="currentColor"/></div>
                        )}
                     </div>
                 </div>

                 <div className="relative max-w-5xl mx-auto w-full z-50">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                     <input 
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        placeholder={language === 'TR' ? "Ne öğrenmek istersin?" : "What do you want to learn?"}
                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                     />
                     
                     {searchText && !hasExactMatch && (
                         <button 
                            onClick={() => onStartTest(searchText, 'Özel Sınav')}
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
                         >
                             Başlat
                         </button>
                     )}
                 </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-8">
                {/* Popular Exams */}
                <div>
                    <div className="flex justify-between items-end mb-4 px-2">
                        <h3 className="text-lg font-black text-slate-800">Popüler Sınavlar</h3>
                        <button className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors">Tümü</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                        {filteredTopics.filter(t => t.isPopular).map(topic => (
                            <div 
                                key={topic.id} 
                                onClick={() => onStartTest(topic.name, 'Genel Deneme Sınavı')}
                                className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <BookOpen size={40} className="text-indigo-600"/>
                                </div>
                                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                                    <Hash size={20}/>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{topic.name}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{topic.category}</span>
                                {topic.isPremium && <div className="absolute top-3 right-3 text-amber-400"><Crown size={14} fill="currentColor"/></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity / Continue */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-indigo-100">Günlük Hedef</span>
                                <h3 className="text-2xl font-black mt-2">Bugün 3 test çöz!</h3>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                <Trophy size={24} className="text-amber-400" fill="currentColor"/>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-300">
                                <span>İlerleme</span>
                                <span>1/3</span>
                            </div>
                            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-1/3 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MobileApp() {
    const { user, upgradeToPremium, consumeFreeTest, allSchools } = useApp();
    const [activeTab, setActiveTab] = useState('home');
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    
    // Navigation & Sub-screen States
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);
    const [testConfig, setTestConfig] = useState<{topic: string, subTopic: string} | null>(null);

    // Check for Premium Requirement
    const handleRequirePremium = () => {
        setShowPremiumModal(true);
    };

    const handleStartTest = (topic: string, subTopic: string) => {
        if (user?.subscriptionTier === SubscriptionTier.FREE && user.freeTestsUsed > 0) {
            // Gatekeeper Logic
            const confirmAd = window.confirm("Ücretsiz hakkınız bitti. Reklam izleyerek devam etmek ister misiniz? (Premium üyeler beklemez)");
            if (confirmAd) {
                alert("Reklam yükleniyor... (Simülasyon)");
                setTimeout(() => {
                   setTestConfig({ topic, subTopic });
                }, 1500);
            } else {
                setShowPremiumModal(true);
            }
        } else {
            // Free user first time OR Premium user
            setTestConfig({ topic, subTopic });
        }
    };

    const handleFinishTest = () => {
        setTestConfig(null);
        setActiveTab('home'); // Or results logic
    };

    // --- Main Render ---
    // Fix viewport height for mobile browsers
    return (
        <div className="bg-white h-[100dvh] w-full flex flex-col relative overflow-hidden font-sans">
            
            {/* Active Screen */}
            <div className="flex-1 relative overflow-hidden">
                {testConfig ? (
                    <QuizScreen 
                        topic={testConfig.topic} 
                        subTopic={testConfig.subTopic} 
                        initialCount={5} 
                        initialDuration={5}
                        onFinish={handleFinishTest} 
                    />
                ) : viewingUserId ? (
                    <>
                        <div className="absolute top-4 left-4 z-50">
                            <button onClick={() => setViewingUserId(null)} className="bg-white/80 backdrop-blur p-2 rounded-full shadow-sm"><ArrowLeft size={20}/></button>
                        </div>
                        <ProfileScreen onOpenPremium={handleRequirePremium} onViewUser={viewingUserId} />
                    </>
                ) : (
                    <>
                        {activeTab === 'home' && <HomeScreen onStartTest={handleStartTest} />}
                        {activeTab === 'timeline' && <TimelineScreen onRequirePremium={handleRequirePremium} onViewUser={setViewingUserId} />}
                        {activeTab === 'leaderboard' && <LeaderboardScreen onViewUser={setViewingUserId} />}
                        {activeTab === 'messages' && <MessagesScreen />}
                        {activeTab === 'profile' && <ProfileScreen onOpenPremium={handleRequirePremium} />}
                        
                        {/* Sub-Screens managed via Tab State (Simulated routing) */}
                        {/* Note: Ideally use React Navigation, but for single file: */}
                    </>
                )}
            </div>

            {/* Navigation (Hide if testing or viewing specific profile) */}
            {!testConfig && !viewingUserId && (
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {/* Modals */}
            {activeTab === 'notifications' && (
                <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-right">
                    <NotificationsScreen onBack={() => setActiveTab('home')} />
                </div>
            )}

            {showPremiumModal && (
                <SubscriptionScreen onClose={() => setShowPremiumModal(false)} />
            )}
        </div>
    );
}

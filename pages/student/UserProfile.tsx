
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Exam } from '../../types';
import { LogOut, Award, Edit2, X, UserMinus, UserPlus, Bell, UserCheck, ArrowLeft, MessageCircle, BookOpen, ExternalLink, Share2, Package, AtSign } from 'lucide-react';
import { StudentResults } from './StudentResults';
import { useParams, useNavigate } from 'react-router-dom';

export const UserProfile = () => {
  const { user: currentUser, users, updateUser, schools, logout, t, showAlert, toggleFollow, exams, shopItems, systemSettings, createUsername } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [classLevel, setClassLevel] = useState<number>(1);
  const [notifSettings, setNotifSettings] = useState({ email: true, app: true });
  const [showListModal, setShowListModal] = useState<'followers' | 'following' | null>(null);
  const [referralUrl, setReferralUrl] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [displayPreference, setDisplayPreference] = useState<'fullName' | 'username'>('fullName');
  const inventoryCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      (profileUser?.inventory || []).forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
      });
      return counts;
  }, [profileUser?.inventory]);

  const ownedInventoryItems = useMemo(
    () => shopItems.filter(item => (inventoryCounts[item.type] || 0) > 0),
    [shopItems, inventoryCounts]
  );

  useEffect(() => {
      if (id && id !== currentUser?.id) {
          const foundUser = users.find(u => u.id === id);
          if (foundUser) {
              setProfileUser(foundUser);
          } else {
              setProfileUser(currentUser); 
          }
      } else {
          setProfileUser(currentUser);
      }
  }, [id, currentUser, users]);

  useEffect(() => {
      if (profileUser) {
          setBio(profileUser.bio || '');
          setSchoolId(profileUser.schoolId || '');
          setClassLevel(profileUser.classLevel || 1);
          setNotifSettings(profileUser.notificationSettings || { email: true, app: true });
      }
  }, [profileUser]);

  useEffect(() => {
      if (profileUser?.referralCode && typeof window !== 'undefined') {
          setReferralUrl(`${window.location.origin}/#/auth?ref=${profileUser.referralCode}`);
      }
  }, [profileUser?.referralCode]);
  
  useEffect(() => {
      if (profileUser?.username) {
          setUsernameInput(profileUser.username);
      } else {
          setUsernameInput('');
      }
  }, [profileUser?.username]);
  
  useEffect(() => {
      if (profileUser) {
          setDisplayPreference(profileUser.displayPreference || 'fullName');
      }
  }, [profileUser?.displayPreference]);

  if (!currentUser || !profileUser) return null;

  const isOwnProfile = currentUser.id === profileUser.id;
  const isFollowing = currentUser.following?.includes(profileUser.id);

  const handleSave = () => {
      if (!isOwnProfile) return;
      updateUser({ ...currentUser, bio, schoolId, classLevel, notificationSettings: notifSettings });
      setIsEditing(false);
      showAlert('Profile updated!', 'success');
  };

  const handleFollowAction = () => {
      toggleFollow(profileUser.id);
  };

  const currentSchool = schools.find(s => s.id === profileUser.schoolId);
  const usernameCost = systemSettings.usernameCost ?? 0;
  const sanitizedUsername = usernameInput.trim().toLowerCase();

  const handleUsernameChange = (value: string) => {
      const allowed = value.replace(/[^a-zA-Z0-9._]/g, '');
      setUsernameInput(allowed.toLowerCase());
  };

  const handleUsernameSubmit = () => {
      if (!sanitizedUsername) {
          showAlert(t('username_invalid'), 'error');
          return;
      }
      const success = createUsername(sanitizedUsername);
      if (success) {
          setDisplayPreference('username');
      }
  };

  const handleDisplayPreferenceChange = (pref: 'fullName' | 'username') => {
      if (!isOwnProfile || !currentUser) return;
      if (pref === 'username' && !profileUser.username) {
          showAlert(t('display_pref_username_needed'), 'error');
          return;
      }
      if (displayPreference === pref) return;
      setDisplayPreference(pref);
      updateUser({ ...currentUser, displayPreference: pref });
      showAlert(t('display_preference_saved'), 'success');
  };

  const getListUsers = () => {
      if (showListModal === 'followers') {
          return users.filter(u => profileUser.followers?.includes(u.id));
      }
      if (showListModal === 'following') {
          return users.filter(u => profileUser.following?.includes(u.id));
      }
      return [];
  };

  const listUsers = getListUsers();

  const navigateToProfile = (userId: string) => {
      setShowListModal(null);
      navigate(`/student/profile/${userId}`);
  };

  const handleSendMessage = () => {
      navigate('/chat', { state: { startChatWith: profileUser.id } });
  };

  const handleCopy = (value: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(value).then(() => {
              showAlert(t('copied'), 'success');
          }).catch(() => showAlert('Unable to copy', 'error'));
      }
  };

  const purchasedExams: Exam[] = (profileUser?.purchasedExamIds || [])
      .map(examId => exams.find(e => e.id === examId))
      .filter((exam): exam is Exam => Boolean(exam));

  const navigateToExam = (examId: string) => {
      navigate(`/student/exam/${examId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative animate-fade-in">
        
        {!isOwnProfile && (
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-4">
                <ArrowLeft size={20} /> Back
            </button>
        )}

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-400 to-orange-500"></div>
            
            <div className="relative pt-12 flex flex-col lg:flex-row items-center lg:items-end gap-6 text-center lg:text-left">
                
                <div className="relative shrink-0">
                    <img src={profileUser.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white object-cover shrink-0" />
                    {profileUser.activeFrame === 'AVATAR_FRAME' && <span className="absolute -top-3 -right-3 text-2xl animate-pulse">👑</span>}
                </div>
                
                <div className="flex-1 mb-2 min-w-0 w-full">
                    <h2 className="text-2xl font-bold text-gray-900 truncate">{profileUser.name}</h2>
                    
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-2">
                        {profileUser.role === 'STUDENT' && (
                            <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap border border-brand-200">
                                {profileUser.classLevel}. {t('grade')}
                            </span>
                        )}
                        <span className="text-gray-500 font-medium text-sm truncate max-w-full">
                            {currentSchool?.name || t('no_school_selected')}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap justify-center w-full lg:w-auto">
                     {isOwnProfile ? (
                         <>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                            >
                                <Edit2 size={16} /> {isEditing ? t('cancel') : t('edit_profile')}
                            </button>
                            <button 
                                onClick={logout}
                                className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <LogOut size={16} /> <span className="hidden sm:inline">{t('logout')}</span>
                            </button>
                         </>
                     ) : (
                         <>
                             <button 
                                onClick={handleSendMessage}
                                className="bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
                             >
                                <MessageCircle size={18} /> {t('message')}
                             </button>
                             <button 
                                onClick={handleFollowAction}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                                    isFollowing 
                                    ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500' 
                                    : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                                }`}
                             >
                                {isFollowing ? (
                                    <> <UserCheck size={18} /> {t('following')} </>
                                ) : (
                                    <> <UserPlus size={18} /> {t('follow')} </>
                                )}
                             </button>
                         </>
                     )}
                </div>
        </div>

        {isOwnProfile && (
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('username')}</p>
                        {profileUser.username ? (
                            <>
                                <div className="inline-flex items-center gap-2 text-3xl font-black text-gray-900">
                                    <AtSign size={24} className="text-brand-500" />
                                    <span>@{profileUser.username}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{t('username_cannot_edit')}</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-black text-gray-900">{t('create_username')}</h3>
                                <p className="text-sm text-gray-500 mt-1">{t('username_hint')}</p>
                            </>
                        )}
                    </div>
                    {!profileUser.username && (
                        <div className="w-full md:w-auto flex flex-col gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                                <AtSign size={18} className="text-gray-400" />
                                <input
                                    value={usernameInput}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    maxLength={20}
                                    className="flex-1 bg-transparent outline-none text-gray-900 font-bold text-lg"
                                    placeholder={t('username_placeholder') || 'kullaniciadi'}
                                />
                            </div>
                            <p className="text-xs text-gray-500">{(t('username_preview_label') || 'Önizleme: @{username}').replace('{username}', sanitizedUsername || 'helloclass')}</p>
                            <button
                                onClick={handleUsernameSubmit}
                                disabled={!sanitizedUsername}
                                className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                    sanitizedUsername ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {t('create_username')} · {usernameCost} {t('points')}
                            </button>
                            <p className="text-xs text-gray-400">{t('username_cost_hint').replace('{points}', String(usernameCost))}</p>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('display_preference_title')}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black text-gray-900">{t('display_preference_question')}</h3>
                            <p className="text-sm text-gray-500 mt-1">{t('display_preference_hint')}</p>
                        </div>
                        <div className="inline-flex bg-gray-100 rounded-full p-1">
                            <button
                                type="button"
                                onClick={() => handleDisplayPreferenceChange('fullName')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${displayPreference === 'fullName' ? 'bg-white text-brand-600 shadow' : 'text-gray-500'}`}
                            >
                                {t('post_identity_fullname')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDisplayPreferenceChange('username')}
                                disabled={!profileUser.username}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                    displayPreference === 'username' ? 'bg-white text-brand-600 shadow' : 'text-gray-400'
                                } ${!profileUser.username ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {t('post_identity_username')}
                            </button>
                        </div>
                    </div>
                    {!profileUser.username && (
                        <p className="text-xs text-red-500 mt-2">{t('display_pref_username_needed')}</p>
                    )}
                </div>
            </section>
        )}

        {isEditing && isOwnProfile && (
                <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('bio')}</label>
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500"
                                rows={3}
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('notification_settings')}</label>
                            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-700">{t('email_notifs')}</span>
                                    <button 
                                        onClick={() => setNotifSettings({...notifSettings, email: !notifSettings.email})}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${notifSettings.email ? 'bg-brand-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifSettings.email ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-700">{t('app_notifs')}</span>
                                    <button 
                                        onClick={() => setNotifSettings({...notifSettings, app: !notifSettings.app})}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${notifSettings.app ? 'bg-brand-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifSettings.app ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('grade')}</label>
                            <select 
                                value={classLevel}
                                onChange={(e) => setClassLevel(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500"
                            >
                                {Array.from({length: 12}, (_, i) => i + 1).map(g => (
                                    <option key={g} value={g}>{g}. {t('grade')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('school')}</label>
                            <select 
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-brand-500"
                            >
                                <option value="">{t('select_school')}</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button 
                                onClick={handleSave}
                                className="flex-1 bg-brand-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-600 transition-colors"
                            >
                                {t('save')}
                            </button>
                            <button 
                                onClick={logout}
                                className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition-colors"
                            >
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-6 text-left items-start">
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">{t('bio')}</h4 >
                        <p className="text-gray-600 text-sm leading-relaxed">{profileUser.bio || 'No bio yet.'}</p>
                    </div>
                    {isOwnProfile && (
                        <div className="flex flex-col gap-2 shrink-0">
                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border ${profileUser.notificationSettings?.email ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                <span className={`w-2 h-2 rounded-full ${profileUser.notificationSettings?.email ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {t('email_notifs')}: {profileUser.notificationSettings?.email ? t('on') : t('off')}
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border ${profileUser.notificationSettings?.app ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                <span className={`w-2 h-2 rounded-full ${profileUser.notificationSettings?.app ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {t('app_notifs')}: {profileUser.notificationSettings?.app ? t('on') : t('off')}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
                 <div className="text-2xl font-black text-brand-500">{profileUser.points}</div>
                 <div className="text-xs font-bold text-gray-400 uppercase">{t('points')}</div>
             </div>
             <div 
                onClick={() => setShowListModal('followers')}
                className="bg-white p-6 rounded-3xl border border-gray-100 text-center cursor-pointer hover:shadow-md transition-shadow group"
             >
                 <div className="text-2xl font-black text-blue-500 group-hover:scale-110 transition-transform">{profileUser.followers?.length || 0}</div>
                 <div className="text-xs font-bold text-gray-400 uppercase">{t('followers')}</div>
             </div>
             <div 
                onClick={() => setShowListModal('following')}
                className="bg-white p-6 rounded-3xl border border-gray-100 text-center cursor-pointer hover:shadow-md transition-shadow group"
             >
                 <div className="text-2xl font-black text-purple-500 group-hover:scale-110 transition-transform">{profileUser.following?.length || 0}</div>
                 <div className="text-xs font-bold text-gray-400 uppercase">{t('following')}</div>
             </div>
        </div>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Package size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{t('inventory')}</h3>
                    <p className="text-sm text-gray-500">{t('inventory')}</p>
                </div>
            </div>
            {ownedInventoryItems.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500 flex flex-col items-center gap-3">
                    <Package size={32} className="text-gray-300" aria-hidden="true" />
                    <p className="font-bold">{t('empty_inventory')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ownedInventoryItems.map(item => {
                        const count = inventoryCounts[item.type] || 0;
                        const nameKey = `item_name_${item.type}`;
                        const descKey = `item_desc_${item.type}`;
                        const translatedName = t(nameKey) !== nameKey ? t(nameKey) : item.name;
                        const translatedDesc = t(descKey) !== descKey ? t(descKey) : item.description;
                        return (
                            <div key={`profile-inv-${item.id}`} className="p-5 border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4">
                                <div className="text-3xl bg-gray-50 p-4 rounded-2xl">{item.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                                        {translatedName}
                                        {count > 1 && <span className="text-[10px] font-bold text-gray-400">×{count}</span>}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{translatedDesc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <StudentResults studentId={profileUser.id} />
        </div>

        {isOwnProfile && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center" aria-hidden="true">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{t('my_exams')}</h3>
                            <p className="text-sm text-gray-500 font-medium">{t('purchased_exams')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/student/exams')}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                        {t('explore_exams')} <ExternalLink size={16} />
                    </button>
                </div>

                {purchasedExams.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500 flex flex-col items-center gap-3">
                        <BookOpen size={32} className="text-gray-300" aria-hidden="true" />
                        <p className="font-bold">{t('empty_library')}</p>
                        <p className="text-sm text-gray-400">{t('empty_library_desc')}</p>
                        <button
                            onClick={() => navigate('/student/exams')}
                            className="mt-2 text-brand-600 font-bold hover:underline flex items-center gap-1"
                        >
                            {t('go_to_market')} <ExternalLink size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {purchasedExams.map(exam => (
                            <div key={exam.id} className="p-5 border border-gray-100 rounded-2xl shadow-sm flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{t('subject')}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${exam.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : exam.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                        {t(exam.difficulty.toLowerCase() as any)}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{exam.title}</h4>
                                {exam.topic && <p className="text-sm text-gray-500">{exam.topic}</p>}
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{t('time_min')}: {exam.timeLimit}</span>
                                    <span>•</span>
                                    <span>{t('questions')}: {exam.questions.length}</span>
                                </div>
                                <button
                                    onClick={() => navigateToExam(exam.id)}
                                    className="mt-2 bg-brand-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
                                >
                                    {t('start')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {isOwnProfile && profileUser.referralCode && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Share2 size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{t('referral_program')}</h3>
                        <p className="text-sm text-gray-500">{t('referral_desc')}</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2 min-w-0">
                        <label className="text-xs font-bold text-gray-400 uppercase">{t('referral_code_label')}</label>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded-xl border border-gray-200 flex-1 break-all">{profileUser.referralCode}</span>
                            <button 
                                onClick={() => handleCopy(profileUser.referralCode!)}
                                className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                            >
                                {t('copy')}
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2 min-w-0">
                        <label className="text-xs font-bold text-gray-400 uppercase">{t('referral_link_label')}</label>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded-xl border border-gray-200 flex-1 break-all">{referralUrl}</span>
                            <button 
                                onClick={() => handleCopy(referralUrl)}
                                className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                            >
                                {t('copy')}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="text-sm text-gray-500 font-medium flex flex-wrap gap-4">
                    <span>{t('referral_count_label').replace('{count}', `${profileUser.referralCount || 0}`)}</span>
                    <span>{t('referral_points_label').replace('{points}', `${profileUser.totalReferralPoints || 0}`)}</span>
                </div>
            </div>
        )}

        {showListModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative flex flex-col max-h-[80vh]">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 capitalize">{t(showListModal)}</h3>
                        <button 
                            onClick={() => setShowListModal(null)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {listUsers.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">No users found.</div>
                        ) : (
                            listUsers.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden"
                                        onClick={() => navigateToProfile(u.id)}
                                    >
                                        <img src={u.avatar} className="w-12 h-12 rounded-full border border-gray-200 object-cover shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-900 text-sm truncate">{u.name}</div>
                                            <div className="text-xs text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded w-fit">{u.role}</div>
                                        </div>
                                    </div>
                                    {currentUser.id !== u.id && (
                                        <button 
                                            onClick={() => toggleFollow(u.id)}
                                            className={`p-2 rounded-lg transition-colors shrink-0 ${
                                                currentUser.following?.includes(u.id) 
                                                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                                            }`}
                                        >
                                            {currentUser.following?.includes(u.id) ? <UserMinus size={18} /> : <UserPlus size={18} />}
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

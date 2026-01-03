
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Bell, Check, Info, AlertCircle, CheckCircle, ArrowRight, Settings, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Notifications = () => {
  const { notifications, user, markNotificationRead, updateUser, t } = useStore();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const myNotifications = notifications
    .filter(n => n.userId === user?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleClick = (id: string, link?: string) => {
      markNotificationRead(id);
      if (link) {
          navigate(link);
      }
  };

  const toggleSetting = (type: 'email' | 'app') => {
      if (!user) return;
      const currentSettings = user.notificationSettings || { email: true, app: true };
      updateUser({
          ...user,
          notificationSettings: {
              ...currentSettings,
              [type]: !currentSettings[type]
          }
      });
  };

  const notifSettings = user?.notificationSettings || { email: true, app: true };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Bell className="text-brand-500" /> {t('notifications')}
            </h2>
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                title={t('notification_settings')}
            >
                <Settings size={20} />
            </button>
        </div>

        {showSettings && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-fade-in mb-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    {t('notification_settings')}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                        <span className="text-sm font-bold text-gray-700">{t('email_notifs')}</span>
                        <button 
                            onClick={() => toggleSetting('email')}
                            className={`w-12 h-6 rounded-full relative transition-colors ${notifSettings.email ? 'bg-brand-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifSettings.email ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                        <span className="text-sm font-bold text-gray-700">{t('app_notifs')}</span>
                        <button 
                            onClick={() => toggleSetting('app')}
                            className={`w-12 h-6 rounded-full relative transition-colors ${notifSettings.app ? 'bg-brand-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifSettings.app ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-3">
            {myNotifications.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 flex flex-col items-center shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Inbox size={32} className="text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t('all_caught_up')}</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mb-6">{t('quiet_here')}</p>
                    <button 
                        onClick={() => navigate('/student/exams')}
                        className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-brand-200"
                    >
                        {t('explore_exams')}
                    </button>
                </div>
            ) : (
                myNotifications.map(n => (
                    <div 
                        key={n.id} 
                        onClick={() => handleClick(n.id, n.link)}
                        className={`p-5 rounded-2xl border transition-all flex gap-4 cursor-pointer hover:scale-[1.01] active:scale-95 ${n.isRead ? 'bg-white border-gray-100 opacity-60' : 'bg-white border-blue-100 shadow-md shadow-blue-50'}`}
                    >
                        <div className={`p-3 rounded-full shrink-0 h-fit ${
                            n.type === 'success' ? 'bg-green-100 text-green-600' : 
                            n.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {n.type === 'success' ? <CheckCircle size={20} /> : n.type === 'warning' ? <AlertCircle size={20} /> : <Info size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{n.message}</p>
                            <span className="text-xs text-gray-400 mt-2 block font-medium">{new Date(n.timestamp).toLocaleDateString()} • {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex flex-col justify-between items-end shrink-0">
                            {n.link && <ArrowRight size={16} className="text-gray-300" />}
                            {!n.isRead && (
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-auto shadow-sm"></span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

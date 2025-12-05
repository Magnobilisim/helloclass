import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LogOut, Settings, Shield } from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { user, logout, t } = useStore();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-6">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('admin_panel')}</p>
          <h1 className="text-3xl font-black text-gray-900 truncate">{user.name}</h1>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-xl mt-3">
            <Shield size={16} /> {user.email}
          </div>
        </div>
        <button
          onClick={logout}
          className="px-6 py-3 rounded-2xl font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-2 justify-center"
        >
          <LogOut size={18} /> {t('logout')}
        </button>
      </header>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('settings')}</h3>
            <p className="text-sm text-gray-500">{t('sys_settings')}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {t('admin_panel')} · {t('messages')} / {t('notifications')} / {t('settings')} gibi tüm kritik alanlara buradan ulaşmaya devam edebilirsiniz.
        </p>
      </section>
    </div>
  );
};

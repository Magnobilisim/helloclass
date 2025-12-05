
import React from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { 
  BookOpen, LayoutDashboard, ShoppingBag, 
  Users, Settings, LogOut, MessageCircle, Star, Languages, AlertTriangle, FileText, ClipboardList, PieChart, Bookmark, LucideIcon, User as UserIcon, Bell, Globe, Gift, Megaphone
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  key?: string;
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, alert, language, setLanguage, t, notifications } = useStore();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const unreadCount = notifications.filter(n => n.userId === user.id && !n.isRead).length;

  const roleQuickLinks: Partial<Record<UserRole, { profile?: string; notifications?: string }>> = {
    [UserRole.STUDENT]: {
        profile: '/student/profile',
        notifications: '/student/notifications'
    },
    [UserRole.TEACHER]: {
        profile: '/teacher/profile'
    },
    [UserRole.ADMIN]: {
        profile: '/admin'
    }
  };

  const quickLinks = roleQuickLinks[user.role] || {};

  const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 p-3 rounded-xl transition-all relative ${
          isActive 
            ? 'bg-brand-500 text-white shadow-lg shadow-brand-200 scale-105 font-bold' 
            : 'text-gray-600 hover:bg-brand-100 hover:text-brand-700 font-medium'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
        <span>{label}</span>
        {label === t('notifications') && unreadCount > 0 && (
            <span className="absolute right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                {unreadCount}
            </span>
        )}
      </Link>
    );
  };

  const getLinks = (): NavItemProps[] => {
    const common: NavItemProps[] = [
      { to: '/chat', icon: MessageCircle, label: t('messages') },
    ];

    switch (user.role) {
      case UserRole.STUDENT:
        return [
          { to: '/student', icon: LayoutDashboard, label: t('dashboard') },
          { to: '/student/prize-exams', icon: Gift, label: t('prize_exams') },
          { to: '/student/exams', icon: BookOpen, label: t('exams') },
          { to: '/student/results', icon: ClipboardList, label: t('my_results') },
          { to: '/student/social', icon: Globe, label: t('social') },
          { to: '/student/shop', icon: ShoppingBag, label: t('shop') },
          { to: '/student/notifications', icon: Bell, label: t('notifications') },
          ...common
        ];
      case UserRole.TEACHER:
        return [
          { to: '/teacher', icon: LayoutDashboard, label: t('dashboard') },
          { to: '/teacher/create', icon: BookOpen, label: t('create_exam') },
          { to: '/teacher/exams', icon: ClipboardList, label: t('exams') },
          { to: '/teacher/shop', icon: ShoppingBag, label: t('shop') },
          { to: '/teacher/profile', icon: UserIcon, label: t('profile') },
          ...common
        ];
      case UserRole.ADMIN:
        return [
          { to: '/admin', icon: LayoutDashboard, label: t('dashboard') },
          { to: '/admin/users', icon: Users, label: t('users') },
          { to: '/admin/exams', icon: ClipboardList, label: t('exams') },
          { to: '/admin/reports', icon: AlertTriangle, label: t('reports') },
          { to: '/admin/financials', icon: PieChart, label: t('financials') },
          { to: '/admin/definitions', icon: Bookmark, label: t('definitions') },
          { to: '/admin/logs', icon: FileText, label: t('logs') },
          { to: '/admin/ads', icon: Megaphone, label: t('ads') },
          { to: '/admin/settings', icon: Settings, label: t('settings') },
          ...common
        ];
      default: return [];
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const hasGoldenFrame = user.activeFrame === 'AVATAR_FRAME';

  // LOGIC FIX: Create explicit mobile links list ensuring Shop is visible
  const getMobileLinks = (): NavItemProps[] => {
      const links = [...getLinks()];
      if (user.role === UserRole.STUDENT) {
          links.push({ to: '/student/profile', icon: UserIcon, label: t('profile') });
      }
      return links;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-50 font-sans">
      {/* Toast Alert */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold animate-bounce flex items-center gap-3 ${
          alert.type === 'success' ? 'bg-green-600' : alert.type === 'error' ? 'bg-red-600' : alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-600'
        }`}>
          {(alert.type === 'error' || alert.type === 'warning') && <AlertTriangle size={20} />}
          {alert.type === 'success' && <Star size={20} />}
          {alert.message}
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white m-4 rounded-3xl shadow-xl border border-gray-100 p-6 z-20">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transform rotate-3">
            H
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">HelloClass</h1>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {getLinks().map((link) => (
            <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} />
          ))}
          {user.role === UserRole.STUDENT && <NavItem to="/student/profile" icon={UserIcon} label={t('profile')} />}
        </nav>

        <div className="pt-6 border-t border-gray-100 space-y-4 mt-4">
           {/* Language Toggle */}
           <button 
             onClick={toggleLanguage}
             className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-xl transition-colors text-sm font-bold"
           >
             <Languages size={18} />
             {language === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}
           </button>

           <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="relative shrink-0">
                <img 
                  src={user.avatar} 
                  alt="User" 
                  className={`w-10 h-10 rounded-full border-2 ${hasGoldenFrame ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-white shadow-sm'}`} 
                />
                {hasGoldenFrame && <span className="absolute -top-2 -right-1 text-xs animate-pulse">👑</span>}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                <div className="flex items-center gap-1 text-xs text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-full w-fit">
                  <Star size={10} fill="currentColor" /> {user.points} pts
                </div>
              </div>
           </div>
           
           <button 
             onClick={logout} 
             className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
           >
             <LogOut size={16} /> {t('logout')}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Header (Visible only on small screens) */}
          <header className="md:hidden bg-white/90 backdrop-blur-md p-4 border-b border-gray-100 flex items-center justify-between z-30 sticky top-0">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">H</div>
                 <h1 className="font-extrabold text-gray-800 text-lg">HelloClass</h1>
              </div>
              <div className="flex items-center gap-3">
                  <Link to="/chat" className="relative p-2 bg-gray-50 rounded-full text-gray-600">
                     <MessageCircle size={20} />
                  </Link>
                  {quickLinks.notifications && (
                      <Link to={quickLinks.notifications} className="relative p-2 bg-gray-50 rounded-full text-gray-600">
                         <Bell size={20} />
                         {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
                      </Link>
                  )}
                  {quickLinks.profile ? (
                      <Link to={quickLinks.profile}>
                         <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-100" />
                      </Link>
                  ) : (
                      <div className="w-8 h-8 rounded-full border border-gray-100 overflow-hidden">
                         <img src={user.avatar} className="w-full h-full object-cover" />
                      </div>
                  )}
              </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 relative scroll-smooth">
            {children}
          </main>
      </div>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2 z-40 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar">
          {getMobileLinks().map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
            return (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border text-[11px] font-semibold transition-all min-w-[68px] ${isActive ? 'text-brand-600 border-brand-200 bg-brand-50' : 'text-gray-500 border-transparent bg-gray-50/40'}`
                }
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate max-w-[68px]">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
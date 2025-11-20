
import React, { useState } from 'react';
import { AppProvider, useApp } from './Store';
import MobileApp from './screens/MobileApp';
import AdminPanel from './screens/AdminPanel';
import { UserRole } from './types';
import { LogIn, UserPlus, Smartphone, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login, register, loginWithSocial } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);

  // Form States
  const [email, setEmail] = useState('student@test.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
        if (name && email && password && schoolName) {
            register(name, email, schoolName);
        } else {
            alert('Lütfen tüm alanları doldurun.');
        }
    } else {
        login(email);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      // Reset defaults for convenience in demo
      if (!isRegistering) {
          setName('');
          setEmail('');
          setPassword('');
          setSchoolName('');
      } else {
          setEmail('student@test.com');
          setPassword('password');
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden overflow-y-auto">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-amber-50 z-0 fixed"></div>
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob fixed"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 fixed"></div>
      
      <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl shadow-indigo-100/50 border border-white/50 transition-all duration-500 relative z-10 my-auto">
        
        {isRegistering && (
            <button onClick={toggleMode} className="absolute top-6 left-6 p-2 rounded-full bg-white/50 hover:bg-white shadow-sm text-slate-500 transition-colors">
                <ArrowLeft size={20} />
            </button>
        )}

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4 shadow-lg shadow-indigo-200 flex items-center justify-center text-white text-2xl font-black">
             H
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">HelloClass</h1>
          <p className="text-slate-500 font-medium">
            {isRegistering ? 'Eğitim yolculuğuna başla.' : 'Tekrar hoşgeldin.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 fade-in">
              <div className="group">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300"
                />
              </div>
              
              <div className="group">
                <input 
                  type="text" 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Okul / Mezuniyet"
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300"
                />
              </div>
            </div>
          )}

          <div className="group">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta Adresi"
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300"
            />
          </div>
          
          <div className="group">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-slate-900 hover:bg-black mt-4"
          >
            {isRegistering ? <><UserPlus size={20}/> Kayıt Ol</> : <><LogIn size={20}/> Giriş Yap</>}
          </button>
        </form>

        {/* Social Login Section */}
        <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">veya</span>
            <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={() => loginWithSocial('google')}
                className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-600 font-bold text-sm shadow-sm hover:shadow-md"
             >
                 <Mail size={18} className="text-red-500"/> Google
             </button>
             <button 
                onClick={() => loginWithSocial('apple')}
                className="flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-sm shadow-lg shadow-slate-200"
             >
                 <Smartphone size={18}/> Apple
             </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm mb-3 font-medium">
                {isRegistering ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
            </p>
            <button 
                onClick={toggleMode}
                className="text-indigo-600 font-black hover:text-indigo-700 text-sm flex items-center justify-center gap-1 mx-auto group"
            >
                {isRegistering ? 'Giriş Yap' : 'Hemen Kayıt Ol'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </button>
        </div>

        {!isRegistering && (
            <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl text-xs text-indigo-900/60 border border-indigo-100/50 text-center backdrop-blur-sm">
            <p className="font-bold mb-2 tracking-wide">DEMO GİRİŞLERİ</p>
            <div className="flex justify-center gap-6 font-medium">
                <span className="cursor-pointer hover:text-indigo-600 underline decoration-dotted" onClick={() => {setEmail('student@test.com'); setPassword('123');}}>Öğrenci</span>
                <span className="cursor-pointer hover:text-indigo-600 underline decoration-dotted" onClick={() => {setEmail('admin@helloclass.com'); setPassword('123');}}>Admin</span>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

const MainRouter: React.FC = () => {
  const { user } = useApp();

  if (!user) {
    return <LoginScreen />;
  }

  if (user.role === UserRole.ADMIN) {
    return <AdminPanel />;
  }

  // Render Mobile App
  // Removed all max-width and border constraints for Full Screen Native Feel on Tablets/Desktop
  return (
    <div className="w-full h-screen bg-white">
      <MobileApp />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
};

export default App;
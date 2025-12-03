
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { Sparkles, GraduationCap, ShieldCheck, Users, UserPlus, LogIn, FileText, X, LockKeyhole, Mail, ArrowRight, CheckCircle, Apple, Chrome } from 'lucide-react';
import { TEACHER_BRANCHES } from '../constants';
import { useLocation } from 'react-router-dom';

export const Auth = () => {
  const { login, register, users, systemSettings, t, showAlert, schools, resetPassword, sendPasswordResetEmail } = useStore(); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const location = useLocation();
  const [referralCodeInput, setReferralCodeInput] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref') || '';
    if (ref) {
        setReferralCodeInput(ref);
    }
  }, [location.search]);
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Input Email, 2: Sent/Success, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [classLevel, setClassLevel] = useState<number>(5);

  const handleDemoLogin = (demoRole: UserRole) => {
    if (demoRole === UserRole.STUDENT) login('student@helloclass.com', demoRole);
    if (demoRole === UserRole.TEACHER) login('teacher@helloclass.com', demoRole);
    if (demoRole === UserRole.ADMIN) login('admin@helloclass.com', demoRole);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      const targetUser = users.find(u => u.email === email);
      if (targetUser) {
          login(email, targetUser.role);
      } else {
          login(email, UserRole.STUDENT); 
      }
    } else {
      if (!name || !email || !password) {
        showAlert(t('fill_all'), 'error');
        return;
      }
      
      if (role === UserRole.STUDENT) {
          if (!selectedSchoolId) {
              showAlert(t('select_school'), 'error');
              return;
          }
          if (!classLevel) {
              showAlert(t('grade'), 'error');
              return;
          }
      }

      if (role === UserRole.TEACHER && !selectedBranch) {
          showAlert(t('select_branch'), 'error');
          return;
      }
      
      if (!agreed) {
          showAlert(t('terms_agree_error'), 'error');
          return;
      }

      register({
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        points: 0,
        inventory: [],
        purchasedExamIds: [],
        classLevel: role === UserRole.STUDENT ? classLevel : undefined,
        englishLevel: 'A1',
        schoolId: selectedSchoolId || undefined,
        branch: role === UserRole.TEACHER ? selectedBranch : undefined
      }, { referralCode: referralCodeInput });
    }
  };

  const handleExternalLogin = (provider: 'google' | 'apple') => {
    showAlert(t('external_login_coming'), 'info');
  };

  const handleSendResetLink = async () => {
      if (!forgotEmail) {
          showAlert(t('fill_all'), 'error');
          return;
      }
      setIsSendingEmail(true);
      const exists = await sendPasswordResetEmail(forgotEmail);
      setIsSendingEmail(false);
      
      if (exists) {
          setForgotStep(2);
      } else {
          showAlert(t('user_not_found'), 'error');
      }
  };

  const handleResetPassword = () => {
      if (!newPassword) {
          showAlert(t('fill_all'), 'error');
          return;
      }
      const success = resetPassword(forgotEmail, newPassword);
      if (success) {
          setShowForgotModal(false);
          setForgotEmail('');
          setNewPassword('');
          setForgotStep(1);
      }
  };

  const closeForgotModal = () => {
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setNewPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-100 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="bg-white/95 md:bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white relative z-10 transition-all max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg transform rotate-3">
             <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">HelloClass</h1>
          <p className="text-gray-500 mt-2">{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              type="button"
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLoginMode ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              {t('login_title')}
            </button>
            <button 
              type="button"
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLoginMode ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              {t('register')}
            </button>
          </div>

          {!isLoginMode && (
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('name')}</label>
               <input 
                 type="text" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)}
                 className="w-full bg-transparent outline-none text-gray-800 font-medium"
                 placeholder="Full Name" 
               />
             </div>
          )}

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('email')}</label>
             <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 font-medium"
              placeholder="hello@example.com" 
             />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('password')}</label>
             <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 font-medium"
              placeholder="••••••••" 
             />
          </div>

          {isLoginMode && (
              <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                      {t('forgot_password')}
                  </button>
              </div>
          )}

          {!isLoginMode && (
            <>
              <div className="flex gap-2">
                 {[UserRole.STUDENT, UserRole.TEACHER].map(r => (
                   <button
                     key={r}
                     type="button"
                     onClick={() => setRole(r)}
                     className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase transition-all ${role === r ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-100 text-gray-400'}`}
                   >
                     {t(r.toLowerCase() as any)}
                   </button>
                 ))}
              </div>

              {role === UserRole.STUDENT && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('school')}</label>
                        <input 
                            list="schools-list"
                            value={selectedSchoolId}
                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                            className="w-full bg-transparent outline-none text-gray-800 font-medium"
                            placeholder={t('search_users')}
                        />
                        <datalist id="schools-list">
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                        </datalist>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('grade')}</label>
                        <select 
                            value={classLevel}
                            onChange={(e) => setClassLevel(Number(e.target.value))}
                            className="w-full bg-transparent outline-none text-gray-800 font-medium cursor-pointer"
                        >
                            {Array.from({length: 12}, (_, i) => i + 1).map(g => (
                                <option key={g} value={g}>{g}. {t('grade')}</option>
                            ))}
                        </select>
                    </div>
                  </>
              )}

              {role === UserRole.TEACHER && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('branch')}</label>
                        <select 
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-transparent outline-none text-gray-800 font-medium cursor-pointer"
                        >
                            <option value="">{t('select_branch')}</option>
                            {TEACHER_BRANCHES.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('school')} ({t('optional')})</label>
                        <input 
                            list="schools-list-teacher"
                            value={selectedSchoolId}
                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                            className="w-full bg-transparent outline-none text-gray-800 font-medium"
                            placeholder={t('search_users')}
                        />
                        <datalist id="schools-list-teacher">
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                        </datalist>
                    </div>
                  </>
              )}

              <div className="flex items-center gap-3 px-1">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 font-medium">
                      {t('terms_label')} <button type="button" onClick={() => setShowTerms(true)} className="text-brand-600 hover:underline font-bold">{t('terms_link')}</button>
                  </label>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('enter_referral_code')} ({t('optional')})</label>
                  <input 
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    placeholder={t('referral_placeholder')}
                  />
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            {isLoginMode ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLoginMode ? t('login_title') : t('create_account')}
          </button>
        </form>

        {isLoginMode && (
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleExternalLogin('google')}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Chrome size={18} className="text-red-500" />
              {t('continue_with_google')}
            </button>
            <button
              type="button"
              onClick={() => handleExternalLogin('apple')}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Apple size={18} className="text-black" />
              {t('continue_with_apple')}
            </button>
          </div>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/80 text-gray-500 font-medium">{t('demo_mode')}</span>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:pb-0 no-scrollbar snap-x">
          <button 
            onClick={() => handleDemoLogin(UserRole.STUDENT)}
            className="flex-shrink-0 w-28 md:w-auto flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100 snap-center"
          >
            <Users size={20} className="mb-1" />
            <span className="text-xs font-bold">{t('student')}</span>
          </button>
          <button 
            onClick={() => handleDemoLogin(UserRole.TEACHER)}
            className="flex-shrink-0 w-28 md:w-auto flex flex-col items-center justify-center p-3 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors border border-brand-100 snap-center"
          >
            <GraduationCap size={20} className="mb-1" />
            <span className="text-xs font-bold">{t('teacher')}</span>
          </button>
          <button 
            onClick={() => handleDemoLogin(UserRole.ADMIN)}
            className="flex-shrink-0 w-28 md:w-auto flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors border border-purple-100 snap-center"
          >
            <ShieldCheck size={20} className="mb-1" />
            <span className="text-xs font-bold">{t('admin')}</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal with 3-Step Flow */}
      {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative p-8">
                  <button onClick={closeForgotModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2">
                      <X size={24} />
                  </button>
                  
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4 text-blue-600">
                          {forgotStep === 1 ? <LockKeyhole size={32} /> : forgotStep === 2 ? <Mail size={32} /> : <CheckCircle size={32} />}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                          {forgotStep === 1 ? t('reset_password') : forgotStep === 2 ? t('email_sent') : t('new_password')}
                      </h3>
                      <p className="text-gray-500 text-sm mt-2">
                          {forgotStep === 1 ? t('enter_email') : forgotStep === 2 ? t('check_inbox') : t('new_password')}
                      </p>
                  </div>

                  {/* Step 1: Enter Email */}
                  {forgotStep === 1 && (
                      <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('enter_email')}</label>
                              <input 
                                  type="email" 
                                  value={forgotEmail} 
                                  onChange={(e) => setForgotEmail(e.target.value)}
                                  className="w-full bg-transparent outline-none text-gray-800 font-medium"
                                  placeholder="hello@example.com" 
                              />
                          </div>
                          <button 
                              onClick={handleSendResetLink}
                              disabled={isSendingEmail}
                              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-70"
                          >
                              {isSendingEmail ? 'Sending...' : t('send_link')}
                          </button>
                      </div>
                  )}

                  {/* Step 2: Email Sent (Mock) */}
                  {forgotStep === 2 && (
                      <div className="space-y-4">
                          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-sm font-medium text-center">
                              {t('check_inbox')}
                          </div>
                          <button 
                              onClick={() => setForgotStep(3)}
                              className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2"
                          >
                              {t('click_demo_link')} <ArrowRight size={18} />
                          </button>
                          <button 
                              onClick={closeForgotModal}
                              className="w-full text-gray-500 font-bold hover:text-gray-800 text-sm"
                          >
                              {t('back_to_login')}
                          </button>
                      </div>
                  )}

                  {/* Step 3: New Password (Mock) */}
                  {forgotStep === 3 && (
                      <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('new_password')}</label>
                              <input 
                                  type="password" 
                                  value={newPassword} 
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full bg-transparent outline-none text-gray-800 font-medium"
                                  placeholder="••••••••" 
                              />
                          </div>
                          <button 
                              onClick={handleResetPassword}
                              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg"
                          >
                              {t('save')}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh]">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                              <FileText size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">{role === UserRole.TEACHER ? t('teacher_contract') : t('student_contract')}</h3>
                      </div>
                      <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-2 transition-colors">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 text-gray-700 leading-relaxed text-sm whitespace-pre-line custom-scrollbar">
                      {role === UserRole.TEACHER ? systemSettings.teacherTerms : systemSettings.studentTerms}
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                      <button 
                          onClick={() => { setAgreed(true); setShowTerms(false); }}
                          className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-200"
                      >
                          {t('i_agree')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

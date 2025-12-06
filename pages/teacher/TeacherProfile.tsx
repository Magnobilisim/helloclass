import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { School, Edit2, Save, X, LogOut, AtSign } from 'lucide-react';

export const TeacherProfile = () => {
  const { user, updateUser, schools, t, showAlert, logout, systemSettings, createUsername } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [branch, setBranch] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [displayPreference, setDisplayPreference] = useState<'fullName' | 'username'>('fullName');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setBranch(user.branch || '');
      setSchoolId(user.schoolId || '');
      setUsernameInput(user.username || '');
      setDisplayPreference(user.displayPreference || 'fullName');
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    updateUser({
      ...user,
      bio,
      branch,
      schoolId: schoolId || undefined,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
    showAlert(t('profile_saved'), 'success');
  };

  const currentSchool = schools.find((s) => s.id === user.schoolId);
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
      if (!user) return;
      if (pref === 'username' && !user.username) {
          showAlert(t('display_pref_username_needed'), 'error');
          return;
      }
      if (displayPreference === pref) return;
      setDisplayPreference(pref);
      updateUser({ ...user, displayPreference: pref });
      showAlert(t('display_preference_saved'), 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-6">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
        />
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('teacher_dashboard')}</p>
          <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
          <p className="text-gray-500 font-medium mt-2">{branch || t('branch')}</p>
          {currentSchool && (
            <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-xl mt-3">
              <School size={16} /> {currentSchool.name}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="px-5 py-3 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <X size={16} /> {t('cancel')}
            </>
          ) : (
            <>
              <Edit2 size={16} /> {t('edit_profile')}
            </>
          )}
        </button>
      </header>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('username')}</p>
            {user.username ? (
              <>
                <div className="inline-flex items-center gap-2 text-3xl font-black text-gray-900">
                  <AtSign size={24} className="text-brand-500" />
                  <span>@{user.username}</span>
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
          {!user.username && (
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
              <p className="text-xs text-gray-500">
                {(t('username_preview_label') || 'Preview: @{username}').replace(
                  '{username}',
                  sanitizedUsername || 'helloclass'
                )}
              </p>
              <button
                onClick={handleUsernameSubmit}
                disabled={!sanitizedUsername}
                className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  sanitizedUsername ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t('create_username')} · {usernameCost} {t('points')}
              </button>
              <p className="text-xs text-gray-400">
                {t('username_cost_hint').replace('{points}', String(usernameCost))}
              </p>
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
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  displayPreference === 'fullName' ? 'bg-white text-brand-600 shadow' : 'text-gray-500'
                }`}
              >
                {t('post_identity_fullname')}
              </button>
              <button
                type="button"
                onClick={() => handleDisplayPreferenceChange('username')}
                disabled={!user.username}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  displayPreference === 'username' ? 'bg-white text-brand-600 shadow' : 'text-gray-400'
                } ${!user.username ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t('post_identity_username')}
              </button>
            </div>
          </div>
          {!user.username && (
            <p className="text-xs text-red-500 mt-2">{t('display_pref_username_needed')}</p>
          )}
        </div>
      </section>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('bio')}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!isEditing}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:border-brand-500 disabled:bg-gray-100"
            rows={4}
            placeholder="Kısaca kendinizden bahsedin..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('branch')}</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={!isEditing}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:border-brand-500 disabled:bg-gray-100"
              placeholder="Matematik, Fen Bilimleri..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('school')}</label>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              disabled={!isEditing}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:border-brand-500 disabled:bg-gray-100"
            >
              <option value="">{t('select_school')}</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {isEditing && (
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-2xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors flex items-center gap-2 justify-center shadow-brand-100 shadow-lg"
            >
              <Save size={18} /> {t('save')}
            </button>
          )}
          <button
            onClick={logout}
            className="flex-1 px-6 py-3 rounded-2xl font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-2 justify-center"
          >
            <LogOut size={18} /> {t('logout')}
          </button>
        </div>
      </section>
    </div>
  );
};

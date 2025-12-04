import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { School, Edit2, Save, X } from 'lucide-react';

export const TeacherProfile = () => {
  const { user, updateUser, schools, t, showAlert } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [branch, setBranch] = useState('');
  const [schoolId, setSchoolId] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setBranch(user.branch || '');
      setSchoolId(user.schoolId || '');
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

        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors flex items-center gap-2 justify-center"
          >
            <Save size={18} /> {t('save')}
          </button>
        )}
      </section>
    </div>
  );
};


import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Play, TrendingUp, Clock, Bot, Trophy, ArrowRight, CheckCircle, Repeat } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user, exams, users, t, availableSubjects, results } = useStore();
  const navigate = useNavigate();

  const availableExams = exams.filter(e => e.isPublished);
  const solvedExamIds = React.useMemo(() => {
      if (!user) return new Set<string>();
      return new Set(results.filter(r => r.studentId === user.id).map(r => r.examId));
  }, [results, user]);

  const topUsers = [...users]
    .filter(u => u.role === 'STUDENT')
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  const startExam = (examId: string) => { navigate(`/student/exam/${examId}`); };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div><h2 className="text-3xl font-extrabold text-gray-800">{t('hi')}, {user?.name.split(' ')[0]}! 👋</h2><p className="text-gray-500 font-medium">{t('ready_to_learn')}</p></div>
        <Link to="/student/wizard" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"><Bot size={20} />{t('ai_wizard')}</Link>
      </header>

      <section className="bg-gradient-to-b from-brand-50 to-white p-6 rounded-3xl border border-brand-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Trophy size={120} /></div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🏆 Liderlik Tablosu</h3>
        
        <div className="hidden md:flex justify-center items-end gap-4 h-48 mb-4">
           {[topUsers[1], topUsers[0], topUsers[2]].map((u, i) => {
             if (!u) return null;
             const isFirst = i === 1; const isSecond = i === 0;
             return (
             <div key={u.id} className={`flex flex-col items-center ${isFirst ? 'order-2 scale-110 z-10' : isSecond ? 'order-1' : 'order-3'}`}>
                <div className="relative group"><img src={u.avatar} className={`w-14 h-14 rounded-full border-4 shadow-md z-10 relative transition-transform group-hover:scale-110 ${isFirst ? 'border-yellow-400' : 'border-white'}`} />{isFirst && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</div>}</div>
                <div className={`w-24 rounded-t-2xl flex flex-col justify-end items-center pb-3 text-white font-bold shadow-lg mt-3 relative ${isFirst ? 'h-32 bg-yellow-400' : isSecond ? 'h-24 bg-gray-300' : 'h-20 bg-orange-300'}`}><span className="text-lg">{i === 1 ? '1' : i === 0 ? '2' : '3'}</span><div className="bg-black/10 px-2 py-0.5 rounded text-xs mt-1">{u.points} pts</div></div>
                <span className="text-sm font-bold text-gray-600 mt-2 max-w-[100px] truncate">{u.name.split(' ')[0]}</span>
             </div>
           )})}
        </div>

        <div className="md:hidden space-y-3">
            {topUsers.map((u, index) => (
                <div key={u.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <div className={`font-black text-lg w-6 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`}>{index + 1}</div>
                    <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-50" />
                    <div className="flex-1 min-w-0"><h4 className="font-bold text-gray-800 truncate">{u.name}</h4></div>
                    <div className="font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg text-sm whitespace-nowrap">{u.points} pts</div>
                </div>
            ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="text-brand-500" /> {t('popular_exams')}</h3><Link to="/student/exams" className="text-sm font-bold text-gray-400 hover:text-brand-600 flex items-center gap-1">{t('see_all')} <ArrowRight size={14} /></Link></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableExams.slice(0, 3).map(exam => {
            const subjName = availableSubjects.find(s => s.id === exam.subjectId)?.name || 'Unknown';
            const isSolved = solvedExamIds.has(exam.id);
            return (
            <div key={exam.id} className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${exam.difficulty === 'Easy' ? 'bg-green-100 text-green-600' : exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{t(exam.difficulty.toLowerCase() as any)}</span>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">{subjName}</span>
                    {isSolved && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={10} /> {t('solved')}
                    </span>}
                </div>
              </div>
              <h4 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">{exam.title}</h4>
              <p className="text-xs text-gray-500 mb-4">{t('by')} {exam.creatorName}</p>
              <div className="mt-auto flex items-center justify-between">
                 <div className="flex items-center gap-1 text-xs text-gray-500 font-medium"><Clock size={14} /> {exam.timeLimit}{t('min')}</div>
                 <button onClick={() => startExam(exam.id)} className={`p-3 rounded-xl transition-colors shadow-lg shadow-brand-200 group-hover:scale-105 ${isSolved ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>
                    {isSolved ? <Repeat size={20} /> : <Play size={20} fill="currentColor" />}
                 </button>
              </div>
            </div>
          )})}
        </div>
      </section>
    </div>
  );
};

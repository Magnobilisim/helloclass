
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, Play, Clock, ShoppingCart, X, CheckCircle, Bot, Sparkles, GraduationCap, Book, Repeat, Eye } from 'lucide-react';

export const StudentExams = () => {
  const { exams, user, purchaseExam, approvedTopics, availableSubjects, t, results, watchAdForPoints, manualAds } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hierarchy State
  const [selectedGrade, setSelectedGrade] = useState<number | 'All'>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [filterEnglishLevel, setFilterEnglishLevel] = useState<string>('All');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<number | null>(null);
  const [showPointModal, setShowPointModal] = useState(false);
  const [pointModalMessage, setPointModalMessage] = useState('');

  useEffect(() => {
      if (user?.classLevel) { setSelectedGrade(user.classLevel); }
  }, [user]);

  const filteredSubjects = availableSubjects.filter(s => {
      if (selectedGrade === 'All') return true;
      if (s.id === 'sub-eng') return true; // Standard English ID
      return s.grades.includes(selectedGrade);
  });

  const publishedExams = exams.filter(e => e.isPublished);

  const filteredExams = publishedExams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = selectedGrade === 'All' || e.classLevel === selectedGrade;
    const matchesSubject = selectedSubjectId === 'All' || e.subjectId === selectedSubjectId;
    const matchesTopic = selectedTopic === 'All' || e.topic === selectedTopic;
    
    // English Level Exception based on ID
    let matchesEnglishLevel = true;
    if (selectedSubjectId === 'sub-eng') {
        if (filterEnglishLevel !== 'All') {
            matchesEnglishLevel = e.englishLevel === filterEnglishLevel;
        }
    }

    return matchesSearch && matchesGrade && matchesSubject && matchesTopic && matchesEnglishLevel;
  });

  // Filter topics based on Subject ID
  const filteredTopics = selectedSubjectId !== 'All' ? (approvedTopics[selectedSubjectId] || []).filter(t => {
      if (selectedSubjectId === 'sub-eng') {
          return filterEnglishLevel === 'All' || t.level === filterEnglishLevel;
      }
      return selectedGrade === 'All' || t.grade === selectedGrade;
  }) : [];

  const solvedExamIds = useMemo(() => {
      if (!user) return new Set<string>();
      return new Set(results.filter(r => r.studentId === user.id).map(r => r.examId));
  }, [results, user]);

  const examAds = useMemo(() => manualAds.filter(ad => ad.isActive && (ad.placement === 'exam' || ad.placement === 'both')), [manualAds]);

  const examsWithAds = useMemo(() => {
      if (examAds.length === 0) {
          return filteredExams.map(exam => ({ type: 'exam' as const, exam }));
      }
      const items: Array<{ type: 'exam'; exam: typeof filteredExams[number] } | { type: 'ad'; ad: typeof examAds[number]; key: string }> = [];
      let adPointer = 0;
      const FREQUENCY = 4;
      filteredExams.forEach((exam, index) => {
          if (index > 0 && index % FREQUENCY === 0) {
              const ad = examAds[adPointer % examAds.length];
              items.push({ type: 'ad', ad, key: `exam-feed-ad-${index}-${ad.id}-${adPointer}` });
              adPointer += 1;
          }
          items.push({ type: 'exam', exam });
      });
      return items;
  }, [filteredExams, examAds]);

  const handleStartOrBuy = (examId: string, price: number) => {
    const isPurchased = user?.purchasedExamIds?.includes(examId);
    if (!isPurchased && price > 0) {
        if ((user?.points || 0) < price) {
            setPointModalMessage(t('insufficient_points_message').replace('{points}', `${price}`));
            setShowPointModal(true);
            return;
        }
        const success = purchaseExam(examId);
        if (success) openStartModal(examId);
    } else {
        openStartModal(examId);
    }
  };
  const handleViewDetails = (examId: string) => {
    sessionStorage.removeItem(`exam_time_${examId}`);
    navigate(`/student/exam/${examId}`);
  };

  const openStartModal = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    const canEditTime = exam.timeLimit <= 0;
    if (!canEditTime) {
        sessionStorage.removeItem(`exam_time_${examId}`);
        navigate(`/student/exam/${examId}`);
        return;
    }
    setCustomTime(exam.timeLimit || 15);
    setSelectedExamId(examId);
  };

  const confirmStart = () => {
      if (selectedExamId && customTime) {
          sessionStorage.setItem(`exam_time_${selectedExamId}`, customTime.toString());
          navigate(`/student/exam/${selectedExamId}`);
          setSelectedExamId(null);
          setCustomTime(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
         <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input type="text" placeholder={t('search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 text-gray-900" />
         </div>

         <div>
             <div className="flex items-center gap-2 mb-3"><GraduationCap size={18} className="text-brand-500" /><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('grade')}</span></div>
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button onClick={() => { setSelectedGrade('All'); setSelectedSubjectId('All'); }} className={`w-12 h-12 flex-shrink-0 rounded-2xl text-sm font-bold border-2 flex items-center justify-center ${selectedGrade === 'All' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400'}`}>{t('all')}</button>
                {Array.from({length: 12}, (_, i) => i + 1).map(g => (
                    <button key={g} onClick={() => { setSelectedGrade(g); setSelectedSubjectId('All'); }} className={`w-12 h-12 flex-shrink-0 rounded-2xl text-lg font-bold border-2 flex items-center justify-center ${selectedGrade === g ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600'}`}>{g}</button>
                ))}
             </div>
         </div>

         <div>
             <div className="flex items-center gap-2 mb-3"><Book size={18} className="text-blue-500" /><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('subject')}</span></div>
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button onClick={() => { setSelectedSubjectId('All'); setSelectedTopic('All'); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border ${selectedSubjectId === 'All' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>{t('all')}</button>
                {filteredSubjects.map(sub => (
                    <button key={sub.id} onClick={() => { setSelectedSubjectId(sub.id); setSelectedTopic('All'); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border ${selectedSubjectId === sub.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600'}`}>{sub.name}</button>
                ))}
             </div>
         </div>

         {selectedSubjectId === 'sub-eng' && (
             <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-50 animate-fade-in">
                 <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" /><span className="text-xs font-bold text-gray-400 uppercase">{t('level')}:</span></div>
                 <select value={filterEnglishLevel} onChange={(e) => setFilterEnglishLevel(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                     <option value="All">{t('all')}</option>
                     {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
             </div>
         )}

         {(selectedSubjectId !== 'All') && (
             <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-50 animate-fade-in">
                 <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" /><span className="text-xs font-bold text-gray-400 uppercase">{t('topic')}:</span></div>
                 <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                     <option value="All">{t('all')} {t('topic')}</option>
                     {filteredTopics.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                 </select>
             </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examsWithAds.map(item => {
          if (item.type === 'ad') {
              const ad = item.ad;
              return (
                <div key={item.key} className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 rounded-3xl shadow-lg border border-gray-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{t('ads')}</span>
                        {ad.highlightLabel && <span className="text-[10px] font-black text-amber-300 uppercase">{ad.highlightLabel}</span>}
                    </div>
                    <h4 className="text-xl font-black leading-tight">{ad.title}</h4>
                    {ad.description && <p className="text-sm text-gray-300">{ad.description}</p>}
                    {ad.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 mt-2">
                            <img src={ad.imageUrl} className="w-full h-40 object-cover" />
                        </div>
                    )}
                    {ad.ctaText && ad.ctaUrl && (
                        <a href={ad.ctaUrl} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white text-gray-900 font-bold text-sm hover:opacity-90 transition-opacity">
                            {ad.ctaText}
                        </a>
                    )}
                </div>
              );
          }
          const exam = item.exam;
           const isPurchased = user?.purchasedExamIds?.includes(exam.id);
           const isSolved = solvedExamIds.has(exam.id);
           const isFree = exam.price === 0;
           const canAfford = (user?.points || 0) >= exam.price;
           const subjName = availableSubjects.find(s => s.id === exam.subjectId)?.name || 'Unknown';

           return (
           return (
           <div key={exam.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${exam.difficulty === 'Easy' ? 'bg-green-100 text-green-600' : exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{t(exam.difficulty.toLowerCase() as any)}</span>
                    {exam.isAI && <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600 flex items-center gap-1"><Bot size={12} /> AI</span>}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500 font-bold bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{subjName}</span>
                    {(exam.classLevel || exam.englishLevel) && <span className="text-[10px] text-white font-bold bg-brand-400 px-2 py-0.5 rounded-lg">{exam.englishLevel || `${exam.classLevel}. ${t('grade')}`}</span>}
                    {isSolved && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={10} /> {t('solved')}
                    </span>}
                </div>
              </div>
              <h4 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{exam.title}</h4>
              <p className="text-xs text-gray-500 mb-4">{t('by')} {exam.creatorName}</p>
              <div className="mt-auto flex items-center justify-between">
                 <div className="flex items-center gap-1 text-xs text-gray-500 font-medium"><Clock size={14} /> {exam.timeLimit}{t('min')}</div>
                 {isPurchased || isFree ? (
                     <button
                        onClick={() => isSolved ? handleViewDetails(exam.id) : handleStartOrBuy(exam.id, exam.price)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${isSolved ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                     >
                        {isSolved ? <><Eye size={16} /> {t('view_details')}</> : <><Play size={16} /> {t('start')}</>}
                     </button>
                 ) : (
                     <button
                        onClick={() => handleStartOrBuy(exam.id, exam.price)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${canAfford ? 'bg-brand-500 text-white shadow-lg hover:bg-brand-600' : 'bg-gray-200 text-gray-400'}`}
                     >
                        <ShoppingCart size={16} /> {exam.price} {t('points')}
                     </button>
                 )}
              </div>
           </div>
        )})}
      </div>
      {selectedExamId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl relative animate-fade-in">
                  <button onClick={() => setSelectedExamId(null)} className="absolute top-4 right-4 text-gray-400"><X size={24} /></button>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{t('start')} Exam</h3>
                  <div className="mb-6"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('time_min')}</label><input type="number" value={customTime} onChange={(e) => setCustomTime(Math.max(1, parseInt(e.target.value)))} className="w-full bg-gray-50 rounded-xl p-4 text-center text-2xl text-gray-900 font-bold outline-none" /></div>
                  <button onClick={confirmStart} className="w-full py-4 rounded-xl bg-brand-500 text-white font-bold text-lg shadow-lg">{t('start')} 🚀</button>
              </div>
          </div>
      )}
      {showPointModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                  <h3 className="text-xl font-bold text-gray-800">{t('insufficient_points_title')}</h3>
                  <p className="text-gray-600">{pointModalMessage}</p>
                  <div className="space-y-3">
                      <button
                          onClick={() => { watchAdForPoints(); setShowPointModal(false); }}
                          className="w-full bg-brand-100 text-brand-700 font-semibold rounded-xl py-3 hover:bg-brand-200 transition-colors"
                      >
                          {t('watch_ad_cta')}
                      </button>
                      <button
                          onClick={() => { setShowPointModal(false); navigate('/student/shop'); }}
                          className="w-full bg-gray-900 text-white font-semibold rounded-xl py-3 hover:scale-[1.02] transition-transform"
                      >
                          {t('go_to_shop_cta')}
                      </button>
                      <button
                          onClick={() => setShowPointModal(false)}
                          className="w-full border border-gray-200 text-gray-600 font-semibold rounded-xl py-3 hover:bg-gray-50 transition-colors"
                      >
                          {t('close')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};


import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Award, Calendar, CheckCircle, XCircle, AlertCircle, ArrowRight, Star, Bookmark, Play } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface StudentResultsProps {
    studentId?: string;
}

export const StudentResults: React.FC<StudentResultsProps> = ({ studentId }) => {
  const { results, user, exams, t, availableSubjects } = useStore();
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetId = studentId || user?.id;
  const showLearningDetails = !studentId;

  const myResults = results
    .filter(r => r.studentId === targetId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isOwnProfile = user?.id === targetId;

  useEffect(() => {
    if (!targetId || studentId) {
      setHighlightId(null);
      return;
    }
    const params = new URLSearchParams(location.search);
    const targetHighlight = params.get('highlight');
    if (targetHighlight) {
      setHighlightId(targetHighlight);
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }
      highlightTimeout.current = setTimeout(() => setHighlightId(null), 5000);
    } else {
      setHighlightId(null);
    }
    return () => {
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }
    };
  }, [location.search, targetId, studentId]);

  useEffect(() => {
    if (!highlightId) return;
    const node = cardRefs.current[highlightId];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      node.focus?.();
    }
  }, [highlightId, myResults.length]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <header className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Award className="text-brand-500" /> {t('results_history')}</h2>
          <div className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">{t('total')}: {myResults.length}</div>
      </header>

      {myResults.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 animate-pulse"><Award size={48} className="text-purple-300" /></div>
             <h3 className="text-2xl font-black text-gray-800 mb-2">{t('no_results_yet')}</h3>
             <p className="text-gray-500 mb-8 max-w-sm">{isOwnProfile ? t('no_results_desc_own') : t('no_results_desc_other')}</p>
             {isOwnProfile && <Link to="/student/exams" className="bg-gradient-to-r from-brand-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-brand-200 hover:scale-105 transition-transform flex items-center gap-2"><Play size={20} fill="currentColor" /> {t('go_to_market')}</Link>}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
             {myResults.map(res => {
                const exam = exams.find(e => e.id === res.examId);
                const percent = Math.round((res.score / res.totalQuestions) * 100);
                const isPass = percent >= 50;
                const isDeleted = !exam;
                const subjName = exam ? availableSubjects.find(s => s.id === exam.subjectId)?.name : 'Unknown';
                const learningStatus = res.learningReportStatus;
                const learningReport = res.learningReport;
                const isHighlighted = highlightId === res.id;
                
                return (
                   <div
                      key={res.id}
                      ref={(el) => { cardRefs.current[res.id] = el; }}
                      className={`bg-white p-5 rounded-3xl shadow-sm border flex flex-col hover:shadow-md transition-all relative overflow-hidden group ${
                        isHighlighted ? 'border-brand-500 ring-2 ring-brand-400 animate-pulse' : 'border-gray-100'
                      }`}
                    >
                      <div className={`absolute top-0 left-0 w-2 h-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="flex justify-between items-start mb-3 pl-4">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {isDeleted ? (
                                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><AlertCircle size={10} /> {t('deleted_exam')}</span>
                                ) : (
                                    <>
                                        <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded border border-brand-100">{subjName}</span>
                                        {exam.topic && <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"><Bookmark size={8} /> {exam.topic}</span>}
                                    </>
                                )}
                                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Calendar size={10} /> {new Date(res.date).toLocaleDateString()}</span>
                             </div>
                             <h4 className={`font-bold text-gray-800 text-lg leading-tight line-clamp-1 ${isDeleted ? 'text-gray-400 italic' : ''}`}>{exam?.title || t('unknown_exam')}</h4>
                          </div>
                      </div>
                      <div className="flex items-end justify-between pl-4 mt-2">
                          <div>
                              <div className={`flex items-center gap-1.5 font-bold text-sm mb-1 ${isPass ? 'text-green-600' : 'text-red-500'}`}>{isPass ? <CheckCircle size={16} /> : <XCircle size={16} />}{isPass ? t('passed') : t('failed')}</div>
                              <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg w-fit"><Star size={12} fill="currentColor" /> +{res.rewardsEarned} {t('points')}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-3xl font-black text-gray-800 tracking-tighter"><span className={isPass ? 'text-brand-600' : 'text-gray-400'}>{res.score}</span><span className="text-gray-300 text-xl">/{res.totalQuestions}</span></div>
                          </div>
                      </div>
                      {showLearningDetails && (learningStatus || learningReport) && (
                          <div className="mt-4 pt-4 border-t border-gray-50 pl-4 space-y-2">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('learning_outcomes_title')}</p>
                              {learningStatus === 'pending' && (
                                  <p className="text-xs text-gray-500">{t('learning_outcomes_pending')}</p>
                              )}
                              {learningStatus === 'failed' && (
                                  <p className="text-xs text-red-500">{t('learning_outcomes_error')}</p>
                              )}
                              {learningStatus === 'ready' && learningReport && (
                                  <div className="space-y-2">
                                      <p className="text-sm text-gray-700">{learningReport.summary}</p>
                                      <ul className="space-y-1.5 text-sm text-gray-800 list-disc pl-4">
                                          {learningReport.outcomes.map((item, idx) => (
                                              <li key={`lr-${res.id}-${idx}`}>{item}</li>
                                          ))}
                                      </ul>
                                      {learningReport.focusAreas.length > 0 && (
                                          <div>
                                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">{t('learning_outcomes_focus_title')}</p>
                                              <ul className="space-y-1.5 text-sm text-gray-600 list-disc pl-4">
                                                  {learningReport.focusAreas.map((item, idx) => (
                                                      <li key={`focus-${res.id}-${idx}`}>{item}</li>
                                                  ))}
                                              </ul>
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      )}
                      {!isDeleted && isOwnProfile && (
                          <div className="mt-4 pt-4 border-t border-gray-100 pl-4 flex justify-end">
                              <Link
                                  to={`/student/results?highlight=${res.id}`}
                                  className="text-xs font-bold text-gray-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
                              >
                                  {t('view_learning_outcomes')} <ArrowRight size={12} />
                              </Link>
                          </div>
                      )}
                   </div>
                );
             })}
          </div>
      )}
    </div>
  );
};

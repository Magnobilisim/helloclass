
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Exam } from '../../types';
import { Timer, Zap, StepForward, Bot, MessageCircle, Loader2, AlertCircle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAnswerExplanation } from '../../services/aiService';

export const ExamRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, user, saveResult, showAlert, t, results, startExamSession, examSessions, prizeExams, language, systemSettings, updateUser, watchAdForPoints } = useStore();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]); 
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsEarned, setRewardsEarned] = useState<number | null>(null);
  
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [explainingQuestionId, setExplainingQuestionId] = useState<string | null>(null);
  const [explanationMap, setExplanationMap] = useState<Record<string, string>>({});
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointModalMessage, setPointModalMessage] = useState('');
  const [pointModalContext, setPointModalContext] = useState<'GENERIC' | 'EXAM_ACCESS' | 'EXPLAIN'>('GENERIC');
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [requiredUnlockPoints, setRequiredUnlockPoints] = useState<number | null>(null);
  const [activeTimeLimitMinutes, setActiveTimeLimitMinutes] = useState<number | null>(null);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [retakeMinutes, setRetakeMinutes] = useState(10);
  const retakeInputRef = useRef<HTMLInputElement>(null);

  const getStoredTimeLimit = (examId: string, defaultMinutes: number) => {
    if (typeof window === 'undefined') return defaultMinutes;
    const raw = sessionStorage.getItem(`exam_time_${examId}`);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return !isNaN(parsed) && parsed > 0 ? parsed : defaultMinutes;
  };

  const persistTimeLimit = (examId: string, minutes: number) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`exam_time_${examId}`, String(minutes));
  };

  const clearTimeLimit = (examId: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`exam_time_${examId}`);
  };

  const triggerPointsModal = (message: string, context: 'GENERIC' | 'EXAM_ACCESS' | 'EXPLAIN' = 'GENERIC') => {
    setPointModalMessage(message);
    setPointModalContext(context);
    setShowPointsModal(true);
  };

  useEffect(() => {
    if (!user) {
        navigate('/auth');
        return;
    }

    const foundExam = exams.find(e => e.id === id);
    if (!foundExam) {
        setExam(null);
        setIsLoading(false);
        return;
    }

    const isPaid = foundExam.price > 0;
    const isOwned = user.purchasedExamIds?.includes(foundExam.id);
    const isCreator = user.id === foundExam.creatorId;
    const isAdmin = user.role === 'ADMIN';
    const activePrizeExam = prizeExams.find(pe => pe.examId === foundExam.id && pe.isActive);
    const isPrizeParticipant = activePrizeExam?.participants?.includes(user.id);
    const lacksAccess = isPaid && !isOwned && !isCreator && !isAdmin && !isPrizeParticipant;

    if (lacksAccess) {
        setExam(foundExam);
        setAccessBlocked(true);
        setRequiredUnlockPoints(foundExam.price);
        setIsLoading(false);
        triggerPointsModal(t('insufficient_points_message').replace('{points}', `${foundExam.price}`), 'EXAM_ACCESS');
        return;
    }

    setAccessBlocked(false);
    setRequiredUnlockPoints(null);
    setExam(foundExam);

    const chosenMinutes = getStoredTimeLimit(foundExam.id, foundExam.timeLimit);
    setActiveTimeLimitMinutes(chosenMinutes);
    setRetakeMinutes(chosenMinutes);

    const existingResult = results.find(r => r.examId === foundExam.id && r.studentId === user.id);
    
    if (existingResult && !isRetrying) {
        setScore(existingResult.score);
        setIsFinished(true);
        if (existingResult.answers) {
            setUserAnswers(existingResult.answers);
        } else {
            setUserAnswers(new Array(foundExam.questions.length).fill(-1));
        }
        setRewardsEarned(existingResult.rewardsEarned);
        setTimeLeft(0);
    } else {
        if (id && user) startExamSession(id);
        setUserAnswers(new Array(foundExam.questions.length).fill(-1));
        setRewardsEarned(null);
        setTimeLeft(chosenMinutes * 60);
        setIsFinished(false);
    }

    setIsLoading(false);
  }, [id, exams, navigate, user, results, prizeExams, startExamSession, t, isRetrying]);

  useEffect(() => {
      if (exam && !isFinished && !isReviewMode && id && user) {
          const effectiveMinutes = activeTimeLimitMinutes ?? exam.timeLimit;
          const sessionKey = `${user.id}_${id}`;
          const session = examSessions[sessionKey] || examSessions[id];
          if (session && session.status === 'started' && session.startedAt) {
              const now = Date.now();
              const startTime = new Date(session.startedAt).getTime(); 
              const elapsedSeconds = Math.floor((now - startTime) / 1000);
              const remaining = (effectiveMinutes * 60) - elapsedSeconds;
              
              if (remaining <= 0) {
                  setTimeLeft(0);
              } else {
                  setTimeLeft(remaining);
              }
          } else {
              setTimeLeft(effectiveMinutes * 60);
          }
      }
  }, [exam, isFinished, isReviewMode, id, examSessions, user, activeTimeLimitMinutes]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished && !isReviewMode && exam) {
      const timer = setInterval(() => {
          setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } 
  }, [timeLeft, isFinished, exam, isReviewMode]);

  useEffect(() => {
      if (timeLeft === 0 && exam && !isFinished && !isReviewMode) {
          finishExam();
      }
  }, [timeLeft, exam, isFinished, isReviewMode]);

  useEffect(() => {
      if (showRetakeModal) {
          const id = requestAnimationFrame(() => retakeInputRef.current?.focus());
          return () => cancelAnimationFrame(id);
      }
  }, [showRetakeModal]);

  const handleOptionSelect = (index: number) => {
    if (isFinished || !exam) return;
    if (timeLeft <= 0) {
        finishExam();
        return;
    }
    if (hiddenOptions.includes(index)) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = index;
    setUserAnswers(newAnswers);
  };

  const finishExam = (finalAnswers?: number[]) => {
    if (!exam || !user || isFinished) return;
    const answersToUse = finalAnswers ? [...finalAnswers] : [...userAnswers];
    setIsFinished(true);
    setIsRetrying(false);
    setUserAnswers(answersToUse);
    clearTimeLimit(exam.id);
    
    saveResult(exam.id, answersToUse);
    
    const calculatedScore = exam.questions.reduce((acc, q, idx) => acc + (answersToUse[idx] === q.correctIndex ? 1 : 0), 0);
    setScore(calculatedScore);
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    const difficultyMultiplier = exam.difficulty === 'Easy' ? 1 : exam.difficulty === 'Medium' ? 1.5 : 2;
    const earned = Math.round(calculatedScore * 10 * difficultyMultiplier);
    setRewardsEarned(earned);
  };

  const explainCost = systemSettings.aiExplainCost || 0;

  const handleExplain = async (qIndex: number) => {
      if (!exam || !user) return;
      const question = exam.questions[qIndex];
      setExplainingQuestionId(question.id);
      let deductedUserSnapshot: null | typeof user = null;
      try {
          if (explainCost > 0) {
              if (user.points < explainCost) {
                  triggerPointsModal(t('insufficient_points_message').replace('{points}', `${explainCost}`), 'EXPLAIN');
                  setExplainingQuestionId(null);
                  return;
              }
              const updatedUser = { ...user, points: user.points - explainCost };
              updateUser(updatedUser);
              deductedUserSnapshot = updatedUser;
              showAlert(t('ai_explain_cost_success').replace('{points}', `${explainCost}`), 'success');
          }
          
          const explanation = await getAnswerExplanation(
              question.text,
              question.options,
              question.correctIndex,
              userAnswers[qIndex] === -1 ? null : userAnswers[qIndex],
              language
          );
          
          setExplanationMap(prev => ({ ...prev, [question.id]: explanation }));
      } catch (error: any) {
          console.error(error);
          if (deductedUserSnapshot) {
              updateUser({ ...deductedUserSnapshot, points: deductedUserSnapshot.points + explainCost });
          }
          showAlert(error.message || 'Unable to generate explanation.', 'error');
      } finally {
          setExplainingQuestionId(null);
      }
  };

  const useJoker5050 = () => {
    if (!user || !exam) {
        showAlert(t('no_joker'), 'error');
        return;
    }
    if (!user.inventory.includes('JOKER_5050')) {
        showAlert(t('no_joker'), 'error');
        return;
    }
    if (hiddenOptions.length > 0) return;

    const jokerCost = systemSettings.joker5050Cost || 0;
    if (jokerCost > 0 && user.points < jokerCost) {
        triggerPointsModal(t('insufficient_points_message').replace('{points}', `${jokerCost}`), 'GENERIC');
        return;
    }

    const currentQ = exam.questions[currentIndex];
    const wrongOptions = currentQ.options
        .map((_, idx) => idx)
        .filter(idx => idx !== currentQ.correctIndex);
    
    if (wrongOptions.length === 0) return;

    let countToRemove = Math.min(2, Math.ceil(wrongOptions.length / 2));
    if (currentQ.options.length === 2) countToRemove = 1; 

    const toHide: number[] = [];
    const availableWrong = [...wrongOptions];

    for (let i = 0; i < countToRemove; i++) {
        if (availableWrong.length === 0) break;
        const randIdx = Math.floor(Math.random() * availableWrong.length);
        toHide.push(availableWrong[randIdx]);
        availableWrong.splice(randIdx, 1);
    }

    setHiddenOptions(toHide);
    
    const newInv = [...(user.inventory || [])];
    const idx = newInv.indexOf('JOKER_5050');
    if (idx > -1) newInv.splice(idx, 1);
    
    const updatedPoints = jokerCost > 0 ? user.points - jokerCost : user.points;
    updateUser({ ...user, inventory: newInv, points: updatedPoints });
    showAlert(t('joker_5050_used'), 'info');
  };

  const useJokerSkip = () => {
    if (!user || !exam) {
        showAlert(t('no_joker'), 'error');
        return;
    }
    if (!user.inventory.includes('JOKER_SKIP')) {
        showAlert(t('no_joker'), 'error');
        return;
    }
    
    showAlert(t('joker_skip_used'), 'info');

    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = -1; 
    setUserAnswers(newAnswers);

    const newInv = [...(user.inventory || [])];
    const idx = newInv.indexOf('JOKER_SKIP');
    if (idx > -1) newInv.splice(idx, 1);
    updateUser({ ...user, inventory: newInv });

    if (currentIndex < exam.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setHiddenOptions([]);
    } else {
        finishExam(newAnswers);
    }
  };

  if (accessBlocked && exam) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6 text-gray-600">
              <AlertCircle size={48} className="mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('not_enough_points')}</h2>
              <p className="max-w-md">{t('insufficient_points_message').replace('{points}', `${requiredUnlockPoints ?? exam.price}`)}</p>
              <div className="flex flex-col gap-3 w-full max-w-sm mt-8">
                  <button
                      onClick={() => watchAdForPoints()}
                      className="bg-brand-100 text-brand-700 font-semibold rounded-2xl py-3 hover:bg-brand-200 transition-colors"
                  >
                      {t('watch_ad_cta')}
                  </button>
                  <button
                      onClick={() => navigate('/student/shop')}
                      className="bg-gray-900 text-white font-semibold rounded-2xl py-3 hover:scale-[1.02] transition-transform"
                  >
                      {t('go_to_shop_cta')}
                  </button>
                  <button
                      onClick={() => navigate('/student/exams')}
                      className="border border-gray-200 text-gray-600 font-semibold rounded-2xl py-3 hover:bg-gray-50 transition-colors"
                  >
                      {t('go_to_market')}
                  </button>
              </div>
          </div>
      );
  }

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <Loader2 size={48} className="animate-spin mb-4 text-brand-500" />
              <p className="font-bold">{t('loading_exam')}</p>
          </div>
      );
  }

  if (!exam) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <AlertCircle size={48} className="mb-4 text-red-400" />
              <p className="font-bold">Exam not found or access denied.</p>
              <button onClick={() => navigate('/student')} className="mt-4 text-brand-600 font-bold hover:underline">
                  Go Home
              </button>
          </div>
      );
  }

  const handlePrevious = () => {
      if (currentIndex === 0) return;
      if (timeLeft <= 0 && !isFinished) {
          finishExam();
          return;
      }
      setCurrentIndex(prev => Math.max(0, prev - 1));
      setHiddenOptions([]);
  };

  const handleNext = () => {
      if (!exam || currentIndex >= exam.questions.length - 1) return;
      if (timeLeft <= 0 && !isFinished) {
          finishExam();
          return;
      }
      setCurrentIndex(prev => prev + 1);
      setHiddenOptions([]);
  };

  const handleRetake = () => {
      if (!exam) return;
      setRetakeMinutes(activeTimeLimitMinutes ?? exam.timeLimit);
      setShowRetakeModal(true);
  };

  const confirmRetake = () => {
      if (!exam || !id) return;
      const minutes = Math.max(1, retakeMinutes);
      setIsRetrying(true);
      persistTimeLimit(exam.id, minutes);
      setActiveTimeLimitMinutes(minutes);
      startExamSession(id);
      setIsFinished(false);
      setIsReviewMode(false);
      setCurrentIndex(0);
      setHiddenOptions([]);
      setScore(0);
      const freshAnswers = new Array(exam.questions.length).fill(-1);
      setUserAnswers(freshAnswers);
      setExplanationMap({});
      setTimeLeft(minutes * 60);
      setRewardsEarned(null);
      setShowRetakeModal(false);
  };

  const pointsModal = showPointsModal ? (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800">{t('insufficient_points_title')}</h3>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                {pointModalContext === 'EXPLAIN' ? t('ai_explain') : t('exam_details')}
            </span>
            <p className="text-gray-600">{pointModalMessage}</p>
            <div className="space-y-3">
                <button
                    onClick={() => { watchAdForPoints(); setShowPointsModal(false); }}
                    className="w-full bg-brand-100 text-brand-700 font-semibold rounded-xl py-3 hover:bg-brand-200 transition-colors"
                >
                    {t('watch_ad_cta')}
                </button>
                <button
                    onClick={() => { setShowPointsModal(false); navigate('/student/shop'); }}
                    className="w-full bg-gray-900 text-white font-semibold rounded-xl py-3 hover:scale-[1.02] transition-transform"
                >
                    {t('go_to_shop_cta')}
                </button>
                <button
                    onClick={() => setShowPointsModal(false)}
                    className="w-full border border-gray-200 text-gray-600 font-semibold rounded-xl py-3 hover:bg-gray-50 transition-colors"
                >
                    {t('close')}
                </button>
            </div>
        </div>
    </div>
  ) : null;

  if (isFinished) {
    const correctCount = exam.questions.reduce((acc, q, idx) => acc + (userAnswers[idx] === q.correctIndex ? 1 : 0), 0);
    const wrongCount = exam.questions.reduce((acc, q, idx) => acc + (userAnswers[idx] !== -1 && userAnswers[idx] !== q.correctIndex ? 1 : 0), 0);
    const blankCount = exam.questions.length - correctCount - wrongCount;
    const percentage = Math.round((correctCount / exam.questions.length) * 100);
    const displayRewards = rewardsEarned ?? Math.round(correctCount * 10 * (exam.difficulty === 'Easy' ? 1 : exam.difficulty === 'Medium' ? 1.5 : 2));
    
    if (isReviewMode) {
        return (
            <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 pb-20">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => { setIsReviewMode(false); setIsFinished(false); navigate('/student/results'); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <StepForward className="rotate-180" size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">{t('review_answers')}</h2>
                </div>

                {exam.questions.map((q, idx) => {
                    const userAnswer = userAnswers[idx];
                    const isCorrect = userAnswer === q.correctIndex;
                    const isExplained = !!explanationMap[q.id];
                    const isExplaining = explainingQuestionId === q.id;

                    return (
                        <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            
                            <h3 className="font-bold text-gray-900 mb-4 pl-4">{idx + 1}. {q.text}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pl-4">
                                <div className={`p-3 rounded-xl text-sm font-bold border ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    <span className="block text-xs uppercase opacity-70 mb-1">{t('your_answer')}</span>
                                    {userAnswer !== -1 && userAnswer !== undefined ? q.options[userAnswer] : t('skip')}
                                </div>
                                <div className="p-3 rounded-xl text-sm font-bold bg-blue-50 border border-blue-200 text-blue-700">
                                    <span className="block text-xs uppercase opacity-70 mb-1">{t('correct_answer')}</span>
                                    {q.options[q.correctIndex]}
                                </div>
                            </div>

                            <div className="pl-4">
                                {isExplained ? (
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-800 text-sm">
                                        <div className="flex items-center gap-2 font-bold mb-2">
                                            <Bot size={16} /> AI Explanation
                                        </div>
                                        {explanationMap[q.id]}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleExplain(idx)}
                                        disabled={isExplaining}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50"
                                    >
                                        {isExplaining ? t('explaining') : <><Bot size={16} /> {t('ai_explain')}</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    const latestResult = user ? results.find(r => r.examId === exam.id && r.studentId === user.id) : null;
    const learningStatus = latestResult?.learningReportStatus;
    const learningReport = latestResult?.learningReport;

    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
         <div className="text-6xl mb-4 animate-bounce">
             {percentage > 70 ? '🎉' : '👍'}
         </div>
         <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('exam_completed')}</h2>
         <p className="text-gray-500 mb-8">{t('you_scored')} {correctCount} / {exam.questions.length}</p>
         
         <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-sm border border-gray-100 mb-8">
            <div className="text-4xl font-black text-brand-500 mb-1">+{displayRewards}</div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('points_earned')}</div>
         </div>
         <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-3">
                <p className="text-xs font-semibold text-green-600 uppercase">{t('correct_count')}</p>
                <p className="text-2xl font-bold text-green-700">{correctCount}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3">
                <p className="text-xs font-semibold text-red-600 uppercase">{t('wrong_count')}</p>
                <p className="text-2xl font-bold text-red-700">{wrongCount}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('blank_count')}</p>
                <p className="text-2xl font-bold text-gray-700">{blankCount}</p>
            </div>
         </div>

        {latestResult && (
            <div className="w-full max-w-lg bg-white/80 backdrop-blur border border-gray-100 rounded-3xl p-5 text-left mb-8 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('learning_outcomes_title')}</p>
                    <span className="text-[10px] font-bold text-gray-400">{new Date(latestResult.date).toLocaleDateString()}</span>
                </div>
                {learningStatus === 'pending' && (
                    <p className="text-sm text-gray-500">{t('learning_outcomes_pending')}</p>
                )}
                {learningStatus === 'failed' && (
                    <p className="text-sm text-red-500">{t('learning_outcomes_error')}</p>
                )}
                {learningStatus === 'ready' && learningReport && (
                    <>
                        <p className="text-sm text-gray-700">{learningReport.summary}</p>
                        <ul className="space-y-2">
                            {learningReport.outcomes.map((item, idx) => (
                                <li key={`outcome-${idx}`} className="flex items-start gap-2 text-sm text-gray-800">
                                    <span className="text-brand-500 mt-1">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        {learningReport.focusAreas.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('learning_outcomes_focus_title')}</p>
                                <ul className="space-y-2">
                                    {learningReport.focusAreas.map((item, idx) => (
                                        <li key={`focus-${idx}`} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="text-gray-400 mt-1">→</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-sm">
            <button 
              onClick={handleRetake}
              className="bg-emerald-100 text-emerald-700 px-8 py-3 rounded-2xl font-bold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
            >
              <StepForward size={20} /> {t('retake')}
            </button>
            <button 
              onClick={() => setIsReviewMode(true)}
              className="bg-purple-100 text-purple-700 px-8 py-3 rounded-2xl font-bold hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} /> {t('review_answers')}
            </button>
            
            <button 
              onClick={() => navigate('/student')}
              className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
            >
              {t('back_dashboard')}
            </button>
        </div>
        {showRetakeModal && exam && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">{t('retake_exam')}</h3>
                    <p className="text-sm text-gray-500">{t('time_min')}</p>
                    <input
                        type="number"
                        min={1}
                        value={retakeMinutes}
                        ref={retakeInputRef}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setRetakeMinutes(Math.max(1, isNaN(val) ? 1 : val));
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center text-3xl font-black text-gray-800"
                    />
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowRetakeModal(false)}
                            className="flex-1 border border-gray-200 rounded-2xl py-3 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={confirmRetake}
                            className="flex-1 bg-brand-500 text-white rounded-2xl py-3 font-semibold hover:bg-brand-600 transition-colors"
                        >
                            {t('start')}
                        </button>
                    </div>
                </div>
            </div>
        )}
        {pointsModal}
      </div>
    );
  }

  const activePrizeExam = prizeExams.find(pe => pe.examId === exam.id && pe.isActive);
  const jokersEnabled = !activePrizeExam; 
  const currentQ = exam.questions[currentIndex];
  const progress = ((currentIndex) / exam.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
            <Timer size={18} className="text-brand-500" />
            <span className="font-mono font-bold text-gray-700">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={useJoker5050}
                disabled={!jokersEnabled || !user?.inventory.includes('JOKER_5050')}
                className={`p-2 rounded-xl border-2 transition-all ${jokersEnabled && user?.inventory.includes('JOKER_5050') ? 'border-purple-200 bg-purple-50 text-purple-600 hover:scale-105' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'}`}
                title="50/50"
            >
                <div className="font-bold text-xs flex items-center gap-1"><Zap size={14} /> 50%</div>
            </button>
            <button 
                onClick={useJokerSkip}
                disabled={!jokersEnabled || !user?.inventory.includes('JOKER_SKIP')}
                className={`p-2 rounded-xl border-2 transition-all ${jokersEnabled && user?.inventory.includes('JOKER_SKIP') ? 'border-blue-200 bg-blue-50 text-blue-600 hover:scale-105' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'}`}
                title="Skip"
            >
                <div className="font-bold text-xs flex items-center gap-1"><StepForward size={14} /> {t('skip')}</div>
            </button>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl flex-1 relative overflow-hidden flex flex-col">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-300 to-brand-500 z-10"></div>
         
         <div className="overflow-y-auto custom-scrollbar flex-1 -mx-4 px-4 md:-mx-6 md:px-6">
             <div className="min-h-full flex flex-col justify-center py-6">
                 
                 <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                    {currentQ.text}
                 </h3>

                 {currentQ.imageUrl && (
                    <img src={currentQ.imageUrl} className="w-full h-48 object-cover rounded-xl mb-6 shadow-sm" alt="Question" />
                 )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {currentQ.options.map((opt, idx) => {
                       if (hiddenOptions.includes(idx)) return null; 
                       const optImage = currentQ.optionImages?.[idx];
                       const isSelected = userAnswers[currentIndex] === idx;
                       
                       let btnClass = "border-2 border-gray-100 hover:border-brand-300 hover:bg-brand-50 text-gray-800";
                       if (isSelected) {
                           btnClass = "border-brand-500 bg-brand-50 text-brand-700 shadow-brand-100";
                       }

                       return (
                           <button
                               key={idx}
                               onClick={() => handleOptionSelect(idx)}
                               disabled={isFinished}
                               className={`w-full text-left p-4 rounded-xl font-medium transition-all text-lg flex flex-col md:flex-row md:items-center justify-between gap-3 ${btnClass}`}
                           >
                               <div className="flex items-center gap-3 w-full">
                                   {optImage && <img src={optImage} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />}
                                   <span className="flex-1 break-words whitespace-normal text-gray-800">{opt}</span>
                               </div>
                           </button>
                       );
                   })}
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-3">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0 || isFinished}
                        className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft size={18} /> {t('previous_question')}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === exam.questions.length - 1 || isFinished}
                        className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        {t('next_question')} <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => finishExam()}
                        disabled={isFinished}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-500 text-white rounded-xl py-3 font-semibold hover:bg-brand-600 disabled:opacity-50"
                    >
                        <Flag size={18} /> {t('finish_exam')}
                    </button>
                </div>

             </div>
         </div>
      </div>

      <div className="mt-6 text-center text-gray-400 font-medium text-sm">
         {t('question')} {currentIndex + 1} {t('of')} {exam.questions.length} • {t('answered')}: {userAnswers.filter(ans => ans !== -1).length}
      </div>
      {pointsModal}
      {showRetakeModal && exam && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                <h3 className="text-xl font-bold text-gray-800">{t('retake_exam')}</h3>
                <p className="text-sm text-gray-500">{t('time_min')}</p>
                <input
                    type="number"
                    min={1}
                    value={retakeMinutes}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setRetakeMinutes(Math.max(1, isNaN(val) ? 1 : val));
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center text-3xl font-black text-gray-800"
                />
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => setShowRetakeModal(false)}
                        className="flex-1 border border-gray-200 rounded-2xl py-3 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={confirmRetake}
                        className="flex-1 bg-brand-500 text-white rounded-2xl py-3 font-semibold hover:bg-brand-600 transition-colors"
                    >
                        {t('retake')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

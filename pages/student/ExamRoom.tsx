
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Exam } from '../../types';
import { Timer, Zap, StepForward, CheckCircle, XCircle, Bot, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAnswerExplanation } from '../../services/aiService';

export const ExamRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, user, saveResult, showAlert, t, results, startExamSession, examSessions, prizeExams, language } = useStore();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]); 
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rewardsEarned, setRewardsEarned] = useState<number | null>(null);
  
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [explainingQuestionId, setExplainingQuestionId] = useState<string | null>(null);
  const [explanationMap, setExplanationMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const foundExam = exams.find(e => e.id === id);
    
    if (!user) {
        navigate('/auth');
        return;
    }

    if (!foundExam) {
        setIsLoading(false);
        return;
    }

    const isPaid = foundExam.price > 0;
    const isOwned = user.purchasedExamIds?.includes(foundExam.id);
    const isCreator = user.id === foundExam.creatorId;
    const isAdmin = user.role === 'ADMIN';

    const activePrizeExam = prizeExams.find(pe => pe.examId === foundExam.id && pe.isActive);
    const isPrizeParticipant = activePrizeExam?.participants?.includes(user.id);

    if (isPaid && !isOwned && !isCreator && !isAdmin && !isPrizeParticipant) {
        showAlert(t('not_enough_points') + " / Access Denied", 'error');
        navigate('/student/exams');
        return;
    }

    setExam(foundExam);

    const existingResult = results.find(r => r.examId === foundExam.id && r.studentId === user.id);
    
    if (existingResult) {
        setScore(existingResult.score);
        setIsFinished(true);
        if (existingResult.answers) {
            setUserAnswers(existingResult.answers);
        } else {
            setUserAnswers(new Array(foundExam.questions.length).fill(-1));
        }
        setIsReviewMode(false); 
        setRewardsEarned(existingResult.rewardsEarned);
    } else {
        if (id && user) startExamSession(id);
        
        setUserAnswers(new Array(foundExam.questions.length).fill(-1));
        setRewardsEarned(null);
    }

    setIsLoading(false);
  }, [id, exams, navigate, user, results, prizeExams, startExamSession]);

  useEffect(() => {
      if (exam && !isFinished && !isReviewMode && id && user) {
          const sessionKey = `${user.id}_${id}`;
          const session = examSessions[sessionKey] || examSessions[id];
          if (session && session.startedAt) {
              const now = Date.now();
              const startTime = new Date(session.startedAt).getTime(); 
              const elapsedSeconds = Math.floor((now - startTime) / 1000);
              const remaining = (exam.timeLimit * 60) - elapsedSeconds;
              
              if (remaining <= 0) {
                  setTimeLeft(0);
                  finishExam();
              } else {
                  setTimeLeft(remaining);
              }
          } else {
              setTimeLeft(exam.timeLimit * 60);
          }
      }
  }, [exam, isFinished, isReviewMode, id, examSessions, user]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished && !isReviewMode && exam) {
      const timer = setInterval(() => {
          setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } 
  }, [timeLeft, isFinished, exam, isReviewMode]);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || isFinished || !exam) return;
    setSelectedOption(index);
    
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = index;
    setUserAnswers(newAnswers);
    
    setTimeout(() => {
        if (!exam) return;
        const isCorrect = index === exam.questions[currentIndex].correctIndex;
        if (isCorrect) setScore(prev => prev + 1);

        if (currentIndex < exam.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setHiddenOptions([]);
        } else {
            finishExam(newAnswers);
        }
    }, 1000);
  };

  const finishExam = (finalAnswers?: number[]) => {
    if (!exam || !user) return;
    setIsFinished(true);
    
    saveResult(exam.id, finalAnswers || userAnswers);
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    const calculatedScore = finalAnswers
        ? finalAnswers.reduce((acc, ans, idx) => acc + (ans === exam.questions[idx].correctIndex ? 1 : 0), 0)
        : score;
    const difficultyMultiplier = exam.difficulty === 'Easy' ? 1 : exam.difficulty === 'Medium' ? 1.5 : 2;
    const earned = Math.round(calculatedScore * 10 * difficultyMultiplier);
    setRewardsEarned(earned);
  };

  const handleExplain = async (qIndex: number) => {
      if (!exam) return;
      const question = exam.questions[qIndex];
      setExplainingQuestionId(question.id);
      
      const explanation = await getAnswerExplanation(
          question.text,
          question.options,
          question.correctIndex,
          userAnswers[qIndex] === -1 ? null : userAnswers[qIndex],
          language
      );
      
      setExplanationMap(prev => ({ ...prev, [question.id]: explanation }));
      setExplainingQuestionId(null);
  };

  const useJoker5050 = () => {
    if (!user?.inventory.includes('JOKER_5050') || !exam) {
        showAlert(t('no_joker'), 'error');
        return;
    }
    if (hiddenOptions.length > 0) return;

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
    
    const newInv = [...user.inventory];
    const idx = newInv.indexOf('JOKER_5050');
    if (idx > -1) newInv.splice(idx, 1);
    // updateUser({ ...user, inventory: newInv }); // StoreContext should handle logic, keeping UI clean
    showAlert(t('joker_5050_used'), 'info');
  };

  const useJokerSkip = () => {
    if (!user?.inventory.includes('JOKER_SKIP') || !exam) {
        showAlert(t('no_joker'), 'error');
        return;
    }
    
    showAlert(t('joker_skip_used'), 'info');

    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = -1; 
    setUserAnswers(newAnswers);

    if (currentIndex < exam.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setHiddenOptions([]);
    } else {
        finishExam(newAnswers);
    }
  };

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

  const handleRetake = () => {
      if (!exam || !id) return;
      startExamSession(id);
      setIsFinished(false);
      setIsReviewMode(false);
      setCurrentIndex(0);
      setSelectedOption(null);
      setHiddenOptions([]);
      setScore(0);
      const freshAnswers = new Array(exam.questions.length).fill(-1);
      setUserAnswers(freshAnswers);
      setTimeLeft(exam.timeLimit * 60);
      setRewardsEarned(null);
  };

  if (isFinished) {
    const percentage = Math.round((score / exam.questions.length) * 100);
    const displayRewards = rewardsEarned ?? Math.round(score * 10 * (exam.difficulty === 'Easy' ? 1 : exam.difficulty === 'Medium' ? 1.5 : 2));
    
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

    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
         <div className="text-6xl mb-4 animate-bounce">
             {percentage > 70 ? '🎉' : '👍'}
         </div>
         <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('exam_completed')}</h2>
         <p className="text-gray-500 mb-8">{t('you_scored')} {score} / {exam.questions.length}</p>
         
         <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-sm border border-gray-100 mb-8">
            <div className="text-4xl font-black text-brand-500 mb-1">+{displayRewards}</div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('points_earned')}</div>
         </div>

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
      </div>
    );
  }

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
                className={`p-2 rounded-xl border-2 transition-all ${user?.inventory.includes('JOKER_5050') ? 'border-purple-200 bg-purple-50 text-purple-600 hover:scale-105' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'}`}
                title="50/50"
            >
                <div className="font-bold text-xs flex items-center gap-1"><Zap size={14} /> 50%</div>
            </button>
            <button 
                onClick={useJokerSkip}
                className={`p-2 rounded-xl border-2 transition-all ${user?.inventory.includes('JOKER_SKIP') ? 'border-blue-200 bg-blue-50 text-blue-600 hover:scale-105' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'}`}
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
                        
                        let btnClass = "border-2 border-gray-100 hover:border-brand-300 hover:bg-brand-50 text-gray-800";
                        
                        if (selectedOption !== null) {
                            if (idx === currentQ.correctIndex) btnClass = "bg-green-100 border-green-500 text-green-900";
                            else if (idx === selectedOption) btnClass = "bg-red-100 border-red-500 text-red-900";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={selectedOption !== null}
                                className={`w-full text-left p-4 rounded-xl font-medium transition-all text-lg flex flex-col md:flex-row md:items-center justify-between gap-3 ${btnClass}`}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    {optImage && <img src={optImage} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />}
                                    <span className="flex-1 break-words whitespace-normal text-gray-800">{opt}</span>
                                </div>
                                <div className="shrink-0">
                                     {selectedOption !== null && idx === currentQ.correctIndex && <CheckCircle size={20} className="text-green-600" />}
                                     {selectedOption !== null && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={20} className="text-red-600" />}
                                </div>
                            </button>
                        );
                    })}
                 </div>

             </div>
         </div>
      </div>

      <div className="mt-6 text-center text-gray-400 font-medium text-sm">
         {t('question')} {currentIndex + 1} {t('of')} {exam.questions.length}
      </div>
    </div>
  );
};

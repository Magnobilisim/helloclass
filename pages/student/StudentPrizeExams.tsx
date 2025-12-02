
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Gift, Calendar, Trophy, AlertCircle, ArrowRight, CheckCircle, Clock, Timer, Star, Coins, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentPrizeExams = () => {
  const { user, prizeExams, exams, results, t, showAlert, updateUser, payEntryFee } = useStore();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); 

  const activeContest = prizeExams.find(pe => 
      pe.isActive && 
      pe.month === currentMonth && 
      (user?.classLevel ? pe.grade === user.classLevel : true) 
  );

  const pastContests = prizeExams.filter(pe => 
      !pe.isActive || pe.month !== currentMonth
  ).sort((a, b) => b.month.localeCompare(a.month));

  const userResult = activeContest 
      ? results.find(r => r.examId === activeContest.examId && r.studentId === user?.id)
      : null;

  const hasTakenActiveContest = !!userResult;

  useEffect(() => {
      if (!activeContest) return;

      const calculateTimeLeft = () => {
          const [year, month] = activeContest.month.split('-').map(Number);
          
          const endDate = new Date(year, month, 1).getTime() - 1; 
          const now = new Date().getTime();
          const difference = endDate - now;

          if (difference > 0) {
              return {
                  days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                  minutes: Math.floor((difference / 1000 / 60) % 60),
                  seconds: Math.floor((difference / 1000) % 60)
              };
          }
          return null;
      };

      setTimeLeft(calculateTimeLeft());

      const timer = setInterval(() => {
          setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
  }, [activeContest]);

  const handleEnterContest = () => {
      if (!user) return;
      if (hasTakenActiveContest) {
          showAlert(t('already_taken_contest'), 'warning');
          return;
      }
      if (activeContest) {
          if (activeContest.entryFee > 0) {
              if (activeContest.participants?.includes(user.id)) {
                  navigate(`/student/exam/${activeContest.examId}`);
              } else if (user.points >= activeContest.entryFee) {
                  if (payEntryFee(activeContest.id, activeContest.entryFee)) {
                      navigate(`/student/exam/${activeContest.examId}`);
                  } else {
                      showAlert(t('not_enough_points'), 'error');
                  }
              } else {
                  showAlert(t('not_enough_points'), 'error');
              }
          } else {
              navigate(`/student/exam/${activeContest.examId}`);
          }
      }
  };

  const handleWatchAd = () => {
      if (!user) return;
      setIsWatchingAd(true);
      setTimeout(() => {
          setIsWatchingAd(false);
          updateUser({ ...user, points: user.points + 50 });
          showAlert(t('ad_reward'), 'success');
      }, 3000);
  };

  const canAfford = user ? user.points >= (activeContest?.entryFee || 0) : false;

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
        <header className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-20 -translate-y-20"></div>
            <Gift size={64} className="absolute bottom-4 right-4 text-white opacity-20 rotate-12" />
            
            <h2 className="text-3xl font-black mb-2 relative z-10">{t('prize_exams')}</h2>
            <p className="text-pink-100 font-medium relative z-10">{t('prize_exams_desc')}</p>
        </header>

        <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="text-brand-500" /> {t('active_contest')}
            </h3>
            
            {activeContest ? (
                <div className="bg-white rounded-[2.5rem] border-4 border-pink-50 overflow-hidden shadow-2xl flex flex-col md:flex-row relative group">
                    
                    {timeLeft && (
                        <div className="absolute top-4 right-4 md:left-4 md:right-auto bg-gray-900/90 backdrop-blur text-white px-4 py-2 rounded-2xl font-mono font-bold text-sm shadow-lg z-20 flex items-center gap-2 border border-gray-700">
                            <Timer size={16} className="text-pink-400" />
                            <span>
                                {timeLeft.days}{t('days')} {String(timeLeft.hours).padStart(2, '0')}{t('hours')} {String(timeLeft.minutes).padStart(2, '0')}{t('minutes')} {String(timeLeft.seconds).padStart(2, '0')}{t('seconds')}
                            </span>
                        </div>
                    )}

                    <div className="md:w-2/5 h-72 md:h-auto relative bg-gray-50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                        <img 
                            src={activeContest.prizeImage} 
                            className="w-full h-full object-contain md:object-cover bg-white transition-transform duration-700 group-hover:scale-105" 
                            style={{ imageRendering: 'auto' }} 
                            alt={activeContest.prizeTitle}
                        />
                        <div className="absolute bottom-6 left-6 z-20 text-white drop-shadow-lg">
                            <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider shadow-sm">
                                {t('grade')} {activeContest.grade}
                            </span>
                            <h3 className="text-2xl font-black leading-tight">{activeContest.prizeTitle}</h3>
                        </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-center relative">
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-2">Description</h2>
                            <p className="text-gray-600 leading-relaxed text-sm">{activeContest.prizeDescription}</p>
                            {activeContest.entryFee > 0 && (
                                <div className="mt-4 flex items-center gap-2 font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg w-fit border border-yellow-100">
                                    <Coins size={16} /> {t('entry_fee')}: {activeContest.entryFee} {t('points')}
                                </div>
                            )}
                        </div>
                        
                        {hasTakenActiveContest ? (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100 flex flex-col items-center text-center space-y-3">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                    <Trophy size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-green-800">{t('exam_completed_status')}</h4>
                                    <p className="text-green-600 text-sm font-medium">{t('in_the_draw')}</p>
                                </div>
                                <div className="bg-white px-6 py-2 rounded-xl shadow-sm border border-green-100 flex items-center gap-2">
                                    <span className="text-gray-400 text-xs font-bold uppercase">{t('score')}</span>
                                    <span className="text-2xl font-black text-gray-800">{userResult?.score}</span>
                                </div>
                                <p className="text-xs text-green-700/60 font-bold mt-2 animate-pulse">{t('winner_announced_soon')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                                    <h4 className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider">{t('contest_rules')}</h4>
                                    <ul className="space-y-2 text-xs text-gray-600 font-medium">
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-pink-500" /> {t('contest_rule_1')}</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-pink-500" /> {t('contest_rule_2')}</li>
                                    </ul>
                                </div>

                                {canAfford || activeContest.participants?.includes(user?.id || '') ? (
                                    <button 
                                        onClick={handleEnterContest}
                                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-gray-200 flex items-center justify-center gap-2 group/btn"
                                    >
                                        {activeContest.entryFee > 0 && !activeContest.participants?.includes(user?.id || '') ? t('pay_and_enter') : t('contest_enter')} <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleWatchAd}
                                        disabled={isWatchingAd}
                                        className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-yellow-200 flex items-center justify-center gap-2 group/btn"
                                    >
                                        {isWatchingAd ? <Loader2 className="animate-spin" /> : <PlayCircle size={24} />} 
                                        {isWatchingAd ? t('watching_ad') : `${t('watch_ad')} (+50 ${t('points')})`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
                    <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                    <p>{t('no_active_contest').replace('{grade}', String(user?.classLevel || '?'))}</p>
                </div>
            )}
        </section>

        <section>
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star className="text-yellow-500" /> {t('hall_of_fame')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastContests.filter(pc => pc.winnerName).map(pc => (
                    <div key={pc.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Trophy size={64} />
                        </div>
                        <div className="relative w-20 h-20 shrink-0">
                            <img src={pc.prizeImage} className="w-full h-full rounded-2xl object-cover bg-gray-100 shadow-inner" />
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm border-2 border-white">
                                <Trophy size={14} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">{pc.month} • Grade {pc.grade}</div>
                            <div className="font-black text-gray-900 text-lg truncate">{pc.winnerName}</div>
                            <div className="text-xs text-brand-600 font-bold truncate">Won: {pc.prizeTitle}</div>
                        </div>
                    </div>
                ))}
                {pastContests.filter(pc => pc.winnerName).length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-gray-400 text-sm font-medium italic">{t('no_past_winners')}</p>
                    </div>
                )}
            </div>
        </section>
    </div>
  );
};

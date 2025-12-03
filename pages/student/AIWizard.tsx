
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { generateExamQuestions } from '../../services/aiService';
import { Subject, Exam } from '../../types';
import { Bot, Loader2, Sparkles, GraduationCap, Book, Filter } from 'lucide-react';

export const AIWizard = () => {
  const { user, addExam, approvedTopics, availableSubjects, t, showAlert, language } = useStore();
  const navigate = useNavigate();
  
  const [gradeLevel, setGradeLevel] = useState<number>(user?.classLevel || 5);
  const [englishLevel, setEnglishLevel] = useState<string>(user?.englishLevel || 'A1');
  const [subjectId, setSubjectId] = useState<string>(availableSubjects[0]?.id || 'sub-math');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredSubjects = useMemo(() => availableSubjects.filter(s => {
      if (s.id === 'sub-eng') return true; 
      return s.grades.includes(gradeLevel);
  }), [availableSubjects, gradeLevel]);

  useEffect(() => {
      if(filteredSubjects.length > 0) {
          const current = filteredSubjects.find(s => s.id === subjectId);
          if (!current) setSubjectId(filteredSubjects[0].id);
      }
  }, [filteredSubjects, subjectId]);

  const topicOptions = useMemo(() => {
      const topics = approvedTopics[subjectId] || [];
      if (subjectId === 'sub-eng') {
          return topics.filter(t => t.level === englishLevel);
      }
      return topics.filter(t => t.grade === gradeLevel);
  }, [approvedTopics, subjectId, englishLevel, gradeLevel]);

  useEffect(() => {
      if (topicOptions.length === 0) {
          setTopic('');
          return;
      }
      if (!topicOptions.some(opt => opt.name === topic)) {
          setTopic(topicOptions[0].name);
      }
  }, [topicOptions, topic]);

  const handleGenerate = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const subjName = availableSubjects.find(s => s.id === subjectId)?.name || 'General';
      if (!topic) {
        showAlert(t('select_topic_first'), 'error');
        setIsLoading(false);
        return;
      }
      const levelString = `${subjectId === 'sub-eng' ? englishLevel : `Grade ${gradeLevel}`}${topic ? ` focusing on ${topic}` : ''}`;
      
      const questions = await generateExamQuestions({
        subjectName: subjName as string,
        gradeOrLevel: levelString,
        topic: topic || undefined,
        questionCount: 5,
        language,
      });
      
      const newExam: Exam = {
        id: `ai-exam-${Date.now()}`,
        title: `${topic || subjName} Challenge (AI)`, 
        topic,
        creatorId: user.id,
        creatorName: user.name,
        subjectId: subjectId,
        difficulty: 'Medium',
        classLevel: subjectId !== 'sub-eng' ? gradeLevel : undefined,
        englishLevel: subjectId === 'sub-eng' ? englishLevel : undefined,
        price: 0,
        timeLimit: 10,
        sales: 0,
        isPublished: true,
        isAI: true,
        questions: questions
      };

      addExam(newExam);
      showAlert('AI Exam created and published to Marketplace!', 'success');
      navigate(`/student/exam/${newExam.id}`);
    } catch (error: any) {
      console.error(error);
      // Display specific error message
      showAlert(error.message || "Failed to generate exam.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSubjectName = availableSubjects.find(s => s.id === subjectId)?.name;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden mb-8">
         <Bot className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10" />
         <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="text-yellow-300" /> {t('ai_wizard_title')}
         </h2>
         <p className="text-indigo-100 text-lg">{t('ai_wizard_desc')}</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        
        <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">1</div>
                <label className="text-lg font-bold text-gray-800">{subjectId === 'sub-eng' ? t('level') : t('grade')}</label>
            </div>
            
            {subjectId === 'sub-eng' ? (
                <div className="flex gap-4 bg-gray-50 p-1.5 rounded-2xl">
                   {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
                       <button key={l} onClick={() => setEnglishLevel(l)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${englishLevel === l ? 'bg-white shadow-md text-brand-600 scale-105' : 'text-gray-500 hover:bg-gray-200'}`}>{l}</button>
                   ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {Array.from({length: 12}, (_, i) => i + 1).map(g => (
                         <button key={g} onClick={() => setGradeLevel(g)} className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${gradeLevel === g ? 'bg-brand-500 text-white shadow-lg shadow-brand-200 scale-110' : 'bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-100'}`}>{g}</button>
                    ))}
                </div>
            )}
        </div>

        <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                <label className="text-lg font-bold text-gray-800">{t('subject')}</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredSubjects.map(sub => (
                    <button key={sub.id} onClick={() => { setSubjectId(sub.id); setTopic(''); }} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${subjectId === sub.id ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-gray-100 text-gray-600 hover:border-gray-300 bg-gray-50'}`}>{sub.name}</button>
                ))}
            </div>
        </div>

        <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">3</div>
                <label className="text-lg font-bold text-gray-800">{t('topic')}</label>
            </div>
            {topicOptions.length > 0 ? (
                <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-2xl p-4 font-bold outline-none focus:border-purple-500 focus:bg-white transition-all"
                >
                    {topicOptions.map((opt, index) => (
                        <option key={`${opt.name}-${index}`} value={opt.name}>
                            {opt.name}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 font-semibold">
                    {t('no_topics_for_selection')}
                </div>
            )}
        </div>

        <button onClick={handleGenerate} disabled={isLoading || !topic} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 mt-8">
            {isLoading ? <><Loader2 className="animate-spin" /> {t('generating')}</> : <>{t('generate_exam')} <Sparkles size={20} className="text-yellow-400" /></>}
        </button>
      </div>
    </div>
  );
};

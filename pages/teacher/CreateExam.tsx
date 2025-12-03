
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Question, Exam, UserRole } from '../../types';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/imageUtils';
import { uploadMedia } from '../../services/mediaService';

export const CreateExam = () => {
  const { user, addExam, updateExam: updateExamInStore, exams, approvedTopics, availableSubjects, t, showAlert } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy'|'Medium'|'Hard'>('Easy');
  const [classLevel, setClassLevel] = useState<number>(1);
  const [englishLevel, setEnglishLevel] = useState<string>('A1');
  const [timeLimit, setTimeLimit] = useState(15);
  const [priceInput, setPriceInput] = useState('0');
  const [isUploading, setIsUploading] = useState(false);
  
  const [subjectId, setSubjectId] = useState<string>('');

  const [originalCreatorId, setOriginalCreatorId] = useState<string>('');
  const [originalCreatorName, setOriginalCreatorName] = useState<string>('');
  
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
  ]);

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined); 
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropTarget, setCropTarget] = useState<{qIndex: number, type: 'question' | 'option' | 'explanation', oIndex?: number} | null>(null);

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-medium";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide";

  const filteredSubjects = availableSubjects.filter(s => {
      if (s.name === 'İngilizce' || s.name === 'English') return true; 
      return s.grades.includes(classLevel);
  });

  useEffect(() => {
      if (filteredSubjects.length > 0) {
          const currentSub = filteredSubjects.find(s => s.id === subjectId);
          if (!currentSub) {
              setSubjectId(filteredSubjects[0].id);
          }
      }
  }, [classLevel, filteredSubjects, subjectId]);

  const filteredTopics = (approvedTopics[subjectId] || []).filter(t => {
      const selectedSubject = availableSubjects.find(s => s.id === subjectId);
      if (selectedSubject?.name === 'English' || selectedSubject?.name === 'İngilizce') {
          return t.level === englishLevel;
      }
      return t.grade === classLevel;
  });

  useEffect(() => {
    if (!id) return;
    const examToEdit = exams.find(e => e.id === id);
    if (examToEdit && (examToEdit.creatorId === user?.id || user?.role === UserRole.ADMIN)) {
        setTitle(examToEdit.title);
        setTopic(examToEdit.topic || '');
        setSubjectId(examToEdit.subjectId); 
        setDifficulty(examToEdit.difficulty);
        setTimeLimit(examToEdit.timeLimit);
        setPriceInput(String(examToEdit.price ?? 0));
        
        setQuestions(examToEdit.questions.map(q => ({
            ...q,
            options: [...q.options],
            optionImages: q.optionImages ? [...q.optionImages] : undefined
        })));
        
        if(examToEdit.classLevel) setClassLevel(examToEdit.classLevel);
        if(examToEdit.englishLevel) setEnglishLevel(examToEdit.englishLevel);
        
        setOriginalCreatorId(examToEdit.creatorId);
        setOriginalCreatorName(examToEdit.creatorName);
    } else {
        showAlert('Unauthorized to edit this exam.', 'error');
        navigate(user?.role === UserRole.ADMIN ? '/admin/exams' : '/teacher');
    }
  }, [id, exams, user, navigate, showAlert]);

  useEffect(() => {
      if (id) return;
      if (filteredSubjects.length > 0 && !subjectId) {
          setSubjectId(filteredSubjects[0].id);
      }
  }, [id, filteredSubjects, subjectId]);

  const addQuestion = () => {
    setQuestions([
        ...questions, 
        { id: `q-${Date.now()}`, text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
      const updated = [...questions];
      const q = updated[qIndex];
      if (q.options.length >= 5) { showAlert('Maximum 5 options allowed', 'warning'); return; }
      q.options.push('');
      if (q.optionImages) q.optionImages.push('');
      setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
      const updated = [...questions];
      const q = updated[qIndex];
      if (q.options.length <= 2) { showAlert('Minimum 2 options required', 'warning'); return; }
      q.options.splice(oIndex, 1);
      if (q.optionImages) q.optionImages.splice(oIndex, 1);
      if (q.correctIndex === oIndex) q.correctIndex = 0; else if (q.correctIndex > oIndex) q.correctIndex -= 1;
      setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const initiateCrop = (file: File, target: {qIndex: number, type: 'question' | 'option' | 'explanation', oIndex?: number}) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          setCropImage(reader.result as string);
          setCropTarget(target); 
          setZoom(1); 
          setRotation(0); 
          setAspect(undefined); 
          setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const saveCroppedImage = async () => {
      if (!cropImage || !croppedAreaPixels || !cropTarget) return;
      setIsUploading(true);
      try {
          const croppedBase64 = await getCroppedImg(cropImage, croppedAreaPixels, rotation);
          
          if (croppedBase64) {
              const secureUrl = await uploadMedia(croppedBase64);

              const { qIndex, type, oIndex } = cropTarget;
              if (type === 'question') updateQuestion(qIndex, 'imageUrl', secureUrl);
              else if (type === 'explanation') updateQuestion(qIndex, 'explanationImage', secureUrl);
              else if (type === 'option' && typeof oIndex === 'number') {
                  const updated = [...questions];
                  const q = updated[qIndex];
                  const currentImages = q.optionImages || new Array(q.options.length).fill('');
                  while(currentImages.length < q.options.length) currentImages.push('');
                  currentImages[oIndex] = secureUrl;
                  updated[qIndex] = { ...q, optionImages: currentImages };
                  setQuestions(updated);
              }
              setCropImage(null); setCropTarget(null);
          }
      } catch (e) { 
          console.error(e);
          showAlert('Failed to process image', 'error'); 
      } finally {
          setIsUploading(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) { showAlert(t('title_req'), 'error'); return; }
    const parsedPrice = priceInput.trim() === '' ? 0 : Number(priceInput);
    if (Number.isNaN(parsedPrice)) {
        showAlert(t('price_negative_error'), 'error');
        return;
    }
    if (parsedPrice < 0) { showAlert(t('price_negative_error'), 'error'); return; }
    if (questions.length < 5) { showAlert(t('min_questions_error'), 'error'); return; }
    
    const selectedSubjectDef = availableSubjects.find(s => s.id === subjectId);
    
    const examData: Exam = {
        id: id || `exam-${Date.now()}`,
        title,
        topic,
        creatorId: id ? originalCreatorId : user.id,
        creatorName: id ? originalCreatorName : user.name,
        subjectId, 
        difficulty,
        timeLimit,
        price: parsedPrice,
        sales: id ? (exams.find(e => e.id === id)?.sales || 0) : 0,
        rating: id ? (exams.find(e => e.id === id)?.rating || 0) : 0,
        isPublished: true,
        questions,
        classLevel: (selectedSubjectDef?.name !== 'English' && selectedSubjectDef?.name !== 'İngilizce') ? classLevel : undefined,
        englishLevel: (selectedSubjectDef?.name === 'English' || selectedSubjectDef?.name === 'İngilizce') ? englishLevel : undefined,
    };

    if (id) updateExamInStore(examData); else addExam(examData);
    navigate(user.role === UserRole.ADMIN ? '/admin/exams' : '/teacher');
  };

  const selectedSubjectName = availableSubjects.find(s => s.id === subjectId)?.name;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {cropImage && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
                <div className="relative flex-1 w-full bg-black/50">
                    <Cropper image={cropImage} crop={crop} zoom={zoom} rotation={rotation} aspect={aspect} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                </div>
                <div className="bg-white p-6 rounded-t-3xl z-20">
                    <div className="flex gap-4">
                        <button onClick={() => setCropImage(null)} disabled={isUploading} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">{t('cancel')}</button>
                        <button onClick={saveCroppedImage} disabled={isUploading} className="flex-2 py-3 bg-brand-500 text-white rounded-xl font-bold w-full flex justify-center items-center gap-2">
                            {isUploading ? <Loader2 className="animate-spin" /> : t('save')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex items-center gap-4"><button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="text-gray-700" /></button><h2 className="text-2xl font-bold text-gray-800">{id ? t('edit') : t('create_exam')}</h2></div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>{t('title')}</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder={t('enter_title')} />
                    </div>
                    <div>
                        <label className={labelClass}>{t('topic')}</label>
                        <input value={topic} onChange={e => setTopic(e.target.value)} list="topics-list" className={inputClass} placeholder={t('enter_topic')} />
                        <datalist id="topics-list">{filteredTopics.map((t, i) => <option key={i} value={t.name} />)}</datalist>
                    </div>
                    
                    <div className="col-span-2 grid grid-cols-3 gap-4">
                        {(selectedSubjectName === 'English' || selectedSubjectName === 'İngilizce') ? (
                            <div>
                                <label className={labelClass}>{t('level')}</label>
                                <select value={englishLevel} onChange={e => setEnglishLevel(e.target.value)} className={inputClass}>
                                    {['A1', 'A2', 'B1', 'B2'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className={labelClass}>{t('grade')}</label>
                                <select value={classLevel} onChange={e => setClassLevel(Number(e.target.value))} className={inputClass}>
                                    {Array.from({length: 12}, (_, i) => i + 1).map(l => <option key={l} value={l}>{l}. {t('grade')}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="col-span-2">
                            <label className={labelClass}>{t('subject')}</label>
                            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={inputClass}>
                                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className={labelClass}>{t('time_min')}</label>
                        <input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>{t('price')}</label>
                        <input 
                            type="number" 
                            value={priceInput} 
                            onChange={e => setPriceInput(e.target.value)} 
                            className={inputClass} 
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {questions.map((q, qIndex) => (
                    <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                        <div className="flex justify-between mb-4">
                            <span className="font-bold bg-brand-500 text-white px-4 py-1.5 rounded-xl shadow-sm shadow-brand-200">{t('question')} {qIndex + 1}</span>
                            <div className="flex gap-2">
                                <label className="cursor-pointer p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                                    <ImageIcon size={20} className="text-gray-600" />
                                    <input type="file" className="hidden" onChange={(e) => { if(e.target.files?.[0]) initiateCrop(e.target.files[0], {qIndex, type:'question'}) }} />
                                </label>
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            {q.imageUrl && (
                                <div className="mb-3 w-full h-48 relative bg-gray-50 rounded-xl border border-gray-100 overflow-hidden group">
                                    <img src={q.imageUrl} className="w-full h-full object-contain" />
                                    <button type="button" onClick={() => updateQuestion(qIndex, 'imageUrl', undefined)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <label className={labelClass}>{t('enter_question')}</label>
                            <textarea 
                                value={q.text} 
                                onChange={e => updateQuestion(qIndex, 'text', e.target.value)} 
                                className={inputClass} 
                                rows={3}
                                placeholder="What is 2 + 2?" 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => updateQuestion(qIndex, 'correctIndex', oIndex)} 
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${q.correctIndex === oIndex ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200' : 'bg-white border-gray-300 text-transparent hover:border-green-300'}`}
                                    >
                                        <Check size={16} />
                                    </button>
                                    <input 
                                        value={opt} 
                                        onChange={e => updateOption(qIndex, oIndex, e.target.value)} 
                                        className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                                        placeholder={`${t('option')} ${oIndex+1}`} 
                                    />
                                    <div className="flex gap-1">
                                        <label className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                            <ImageIcon size={16} />
                                            <input type="file" className="hidden" onChange={(e) => { if(e.target.files?.[0]) initiateCrop(e.target.files[0], {qIndex, type:'option', oIndex}) }} />
                                        </label>
                                        {q.options.length > 2 && (
                                            <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {q.options.length < 5 && (
                                <button type="button" onClick={() => addOption(qIndex)} className="w-full py-3 border-2 border-dashed border-brand-200 text-brand-600 rounded-xl font-bold hover:bg-brand-50 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={18} /> {t('add_question')}
                                </button>
                            )}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-100">
                             <label className={labelClass}>{t('explanation')}</label>
                             <textarea 
                                value={q.explanation} 
                                onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)} 
                                className={inputClass}
                                rows={2}
                                placeholder={t('enter_explanation')}
                             />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex gap-4 sticky bottom-6 z-30">
                <button type="button" onClick={addQuestion} className="flex-1 py-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-all">
                    + {t('add_question')}
                </button>
                <button type="submit" className="flex-[2] py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-gray-800 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> {t('save')}
                </button>
            </div>
        </form>
    </div>
  );
};

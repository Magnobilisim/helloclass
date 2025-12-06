
import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, AlertTriangle, Filter, Loader2, X, Globe, ShieldAlert, UserPlus, UserCheck, Image as ImageIcon, Check, Crop, ZoomIn, ZoomOut, RotateCw, Layout, Grid } from 'lucide-react';
import { ManualAd, ReportReason, UserRole } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/imageUtils';
import { uploadMedia } from '../../services/mediaService';
import { useAdTracking } from '../../hooks/useAdTracking';

export const SocialFeed = () => {
  const { user, users: allUsers, posts, addPost, toggleLike, toggleDislike, addComment, reportPost, availableSubjects, schools, toggleFollow, t, showAlert, manualAds, socialTopics, formatDisplayName } = useStore();
  const navigate = useNavigate();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | ''>('');
  const [selectedGeneralTopic, setSelectedGeneralTopic] = useState<string>('');
  const [targetSchoolId, setTargetSchoolId] = useState<string>(''); 
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [filterSchoolId, setFilterSchoolId] = useState<string>(''); 
  const [filterSubjectId, setFilterSubjectId] = useState<string | 'All'>('All');
  const [filterGeneralTopic, setFilterGeneralTopic] = useState<'All' | string>('All');

  // Reporting State
  const [reportModalPostId, setReportModalPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>(ReportReason.INAPPROPRIATE);

  // Comments State
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  // Safety Modal State
  const [safetyViolation, setSafetyViolation] = useState<string | null>(null);

  // --- Image Cropping State ---
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null); // For preview before crop/upload
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handlePost = async () => {
    if (!newPostContent.trim() && !postImagePreview) return;
    setIsPosting(true);
    
    // Upload image first if exists
    let finalImageUrl = undefined;
    if (postImagePreview) {
        try {
            finalImageUrl = await uploadMedia(postImagePreview);
        } catch (e) {
            showAlert('Failed to upload image', 'error');
            setIsPosting(false);
            return;
        }
    }

    const tags: string[] = [];
    if (selectedTag) tags.push(selectedTag);
    if (selectedGeneralTopic) tags.push(`general:${selectedGeneralTopic}`);
    const result = await addPost(newPostContent, tags.length ? tags : undefined, targetSchoolId || undefined, finalImageUrl);
    
    setIsPosting(false);
    if (result.success) { setNewPostContent(''); setSelectedTag(''); setSelectedGeneralTopic(''); setTargetSchoolId(''); setPostImagePreview(null); } 
    else if (result.reason) { setSafetyViolation(result.reason); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => { setCropImage(reader.result as string); setZoom(1); setRotation(0); setAspect(undefined); };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const saveCroppedImage = async () => {
      if (!cropImage || !croppedAreaPixels) return;
      setIsCropping(true);
      try {
          // Get local base64 from crop
          const croppedBase64 = await getCroppedImg(cropImage, croppedAreaPixels, rotation);
          if (croppedBase64) { 
              // Store as preview. Upload happens on "Post"
              setPostImagePreview(croppedBase64); 
              setCropImage(null); 
          }
      } catch (e) { 
          console.error(e); 
          showAlert('Failed to crop image', 'error'); 
      } finally {
          setIsCropping(false);
      }
  };

  const handleOpenReportModal = (postId: string) => {
      setReportReason(ReportReason.INAPPROPRIATE);
      setReportModalPostId(postId);
  };

  const handleCloseReportModal = () => {
      setReportModalPostId(null);
      setReportReason(ReportReason.INAPPROPRIATE);
  };

  const handleConfirmReport = () => { 
      if (reportModalPostId) { 
          reportPost(reportModalPostId, reportReason); 
          handleCloseReportModal(); 
      } 
  };

  const toggleComments = (postId: string) => {
      const newSet = new Set(expandedComments);
      if (newSet.has(postId)) newSet.delete(postId); else newSet.add(postId);
      setExpandedComments(newSet);
  };

  const handleCommentSubmit = (postId: string) => {
      const text = commentText[postId];
      if (text && text.trim()) { 
          // Safety check is now inside StoreContext.addComment
          addComment(postId, text); 
          setCommentText(prev => ({ ...prev, [postId]: '' })); 
      }
  };

  const handleSchoolFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === 'MY_SCHOOL') {
          if (!user?.schoolId) {
              if (window.confirm("You haven't selected a school yet. Go to profile to update?")) {
                  navigate(profileRoute);
              }
              return;
          }
          setFilterSchoolId(user.schoolId);
      } else {
          setFilterSchoolId(value);
      }
  };

  const filteredPosts = posts.filter(p => {
      if (filterSchoolId && p.schoolId !== filterSchoolId) return false;
      if (filterSubjectId !== 'All' && !p.tags?.includes(filterSubjectId)) return false;
      if (filterGeneralTopic !== 'All') {
          const topicTag = `general:${filterGeneralTopic}`;
          if (!p.tags?.includes(topicTag)) return false;
      }
      return true;
  });

  const socialAds = React.useMemo(() => manualAds.filter(ad => ad.isActive && (ad.placement === 'social' || ad.placement === 'both')), [manualAds]);
  const userRole = user?.role;
  const locationHint = user?.schoolId;
  const profileRoute = userRole === UserRole.TEACHER ? '/teacher/profile' : userRole === UserRole.ADMIN ? '/admin/profile' : '/student/profile';
  const resolveAuthorName = (authorId: string, fallbackName: string, fallbackUsername?: string) => {
      const liveUser = allUsers.find(u => u.id === authorId);
      if (liveUser) return formatDisplayName(liveUser, { withAt: true });
      if (fallbackUsername) return `@${fallbackUsername}`;
      return fallbackName;
  };

  const feedWithAds = React.useMemo(() => {
      if (!socialAds.length) {
          return filteredPosts.map(post => ({ type: 'post' as const, post }));
      }
      const items: Array<{ type: 'post'; post: typeof filteredPosts[number] } | { type: 'ad'; ad: typeof socialAds[number]; key: string }> = [];
      const FREQUENCY = 5;
      let adIndex = 0;
      filteredPosts.forEach((post, index) => {
          if (index > 0 && index % FREQUENCY === 0) {
              const ad = socialAds[adIndex % socialAds.length];
              items.push({ type: 'ad', ad, key: `social-feed-ad-${index}-${ad.id}-${adIndex}` });
              adIndex++;
          }
          items.push({ type: 'post', post });
      });
      if (!items.some(item => item.type === 'ad')) {
          const fallbackAd = socialAds[0];
          items.splice(Math.min(1, items.length), 0, { type: 'ad', ad: fallbackAd, key: `social-feed-ad-fallback-${fallbackAd.id}` });
      }
      return items;
  }, [filteredPosts, socialAds]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 relative">
       {/* Cropper Modal */}
       {cropImage && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
                <div className="relative flex-1 w-full bg-black/50">
                    <Cropper image={cropImage} crop={crop} zoom={zoom} rotation={rotation} aspect={aspect} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                </div>
                <div className="bg-white p-6 rounded-t-3xl z-20">
                    <div className="flex gap-4">
                        <button onClick={() => setCropImage(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                        <button onClick={saveCroppedImage} disabled={isCropping} className="flex-2 py-3 bg-brand-500 text-white rounded-xl font-bold w-full flex justify-center items-center gap-2">
                            {isCropping ? <Loader2 className="animate-spin" /> : 'Save Image'}
                        </button>
                    </div>
                </div>
            </div>
       )}

       <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{t('classroom_feed')}</h2>
            <div className="flex gap-2">
                 <select value={filterSchoolId === user?.schoolId ? 'MY_SCHOOL' : filterSchoolId} onChange={handleSchoolFilterChange} className="p-2 rounded-xl text-xs font-bold border border-gray-200 outline-none bg-white text-gray-700 max-w-[140px] truncate">
                     <option value="">{t('all_schools')}</option>
                     <option value="MY_SCHOOL">{t('my_school')}</option>
                     <option disabled>──────────</option>
                     {schools.filter(s => s.id !== user?.schoolId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                 <select value={filterSubjectId} onChange={(e) => setFilterSubjectId(e.target.value)} className="p-2 rounded-xl text-xs font-bold border border-gray-200 outline-none bg-white text-gray-700">
                     <option value="All">{t('all')}</option>
                     {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                 <select value={filterGeneralTopic} onChange={(e) => setFilterGeneralTopic(e.target.value as 'All' | string)} className="p-2 rounded-xl text-xs font-bold border border-gray-200 outline-none bg-white text-gray-700">
                     <option value="All">{t('all')} {t('topic')}</option>
                     {socialTopics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                 </select>
            </div>
       </div>

       {/* Create Post */}
       <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex gap-3 mb-3">
             <img src={user?.avatar} className="w-10 h-10 rounded-full bg-gray-100" />
             <div className="flex-1 space-y-3">
                 <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder={t('share_placeholder')} className="w-full bg-gray-50 rounded-xl p-3 outline-none resize-none text-sm h-20 text-gray-900" />
                 {postImagePreview && <div className="relative w-full h-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-200"><img src={postImagePreview} className="w-full h-full object-contain" /><button onClick={() => setPostImagePreview(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"><X size={16} /></button></div>}
             </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex gap-2 w-full md:w-auto">
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-100 text-gray-500 rounded-lg"><ImageIcon size={20} /></button>
                 <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="flex-1 md:flex-none text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-700 font-medium">
                     <option value="">{t('topic')}...</option>
                     {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                 <select value={selectedGeneralTopic} onChange={(e) => setSelectedGeneralTopic(e.target.value)} className="flex-1 md:flex-none text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-700 font-medium">
                     <option value="">{t('social_topic_placeholder')}</option>
                     {socialTopics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                 </select>
                 <select value={targetSchoolId} onChange={(e) => setTargetSchoolId(e.target.value)} className="flex-1 md:flex-none text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-700 font-medium max-w-[150px] truncate">
                     <option value="">{t('global')}</option>
                     {user?.schoolId && <option value={user.schoolId}>{t('my_school')}</option>}
                     <option disabled>──────────</option>
                     {schools.filter(s => s.id !== user?.schoolId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              <button onClick={handlePost} disabled={isPosting || (!newPostContent.trim() && !postImagePreview)} className="w-full md:w-auto bg-brand-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">{isPosting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} {t('post_btn')}</button>
          </div>
       </div>

       {/* Feed */}
      <div className="space-y-4">
         {feedWithAds.length > 0 ? feedWithAds.map(item => {
            if (item.type === 'ad') {
                return (
                    <SocialAdCard
                      key={item.key}
                      ad={item.ad}
                      label={t('ads')}
                      userId={user?.id}
                      userRole={userRole}
                      locationHint={locationHint}
                    />
                );
            }
            const post = item.post;
             const schoolName = post.schoolId ? schools.find(s => s.id === post.schoolId)?.name : 'Global';
             const isMe = user?.id === post.authorId;
             const isFollowing = user?.following?.includes(post.authorId);
             const displayName = resolveAuthorName(post.authorId, post.authorName, post.authorUsername);

             return (
             <div key={post.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                        <Link to={`/student/profile/${post.authorId}`}><img src={post.authorAvatar} className="w-10 h-10 rounded-full border border-gray-100" /></Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link to={`/student/profile/${post.authorId}`} className="font-bold text-gray-800 text-sm">{displayName}</Link>
                                {!isMe && <button onClick={() => toggleFollow(post.authorId)} className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-lg font-bold">{isFollowing ? t('following') : t('follow')}</button>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                                <span className="bg-blue-50 text-blue-500 px-1.5 rounded font-bold"><Globe size={10} className="inline mr-1" /> {schoolName}</span>
                                {post.tags?.map(tagId => {
                                    if (tagId.startsWith('general:')) {
                                        const topicId = tagId.replace('general:', '');
                                        const topicName = socialTopics.find(st => st.id === topicId)?.name || topicId;
                                        return <span key={tagId} className="bg-amber-50 text-amber-600 px-1.5 rounded font-bold text-[10px]">{topicName}</span>;
                                    }
                                    const tagName = availableSubjects.find(s => s.id === tagId)?.name || tagId;
                                    return <span key={tagId} className="bg-gray-100 text-gray-600 px-1.5 rounded">{tagName}</span>;
                                })}
                            </div>
                        </div>
                   </div>
                   <button onClick={() => handleOpenReportModal(post.id)} className="text-gray-300 hover:text-red-500"><AlertTriangle size={14} /></button>
                </div>
                {post.content && <p className="text-gray-900 font-medium mb-4 whitespace-pre-wrap">{post.content}</p>}
                {post.imageUrl && <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100"><img src={post.imageUrl} className="w-full max-h-[400px] object-cover" /></div>}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex gap-4">
                        <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-green-600"><ThumbsUp size={18} /><span className="text-xs font-bold">{post.likes}</span></button>
                        <button onClick={() => toggleDislike(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-red-600"><ThumbsDown size={18} /><span className="text-xs font-bold">{post.dislikes}</span></button>
                    </div>
                    <button onClick={() => toggleComments(post.id)} className="flex items-center gap-2 text-gray-500 hover:text-blue-500"><span className="text-xs font-bold">{post.comments.length} {t('comments')}</span><MessageSquare size={18} /></button>
                </div>

                {expandedComments.has(post.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-50 bg-gray-50/50 rounded-xl p-3">
                        <div className="space-y-3 mb-4">
                            {post.comments.map(c => {
                                const baseName = resolveAuthorName(c.authorId, c.authorName, c.authorUsername);
                                const initial = baseName.replace(/^@/, '').charAt(0)?.toUpperCase() || 'U';
                                return (
                                    <div key={c.id} className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600 shrink-0">
                                            {initial}
                                        </div>
                                        <div className="bg-white p-2 rounded-r-xl rounded-bl-xl border border-gray-100 shadow-sm text-sm">
                                            <Link to={`/student/profile/${c.authorId}`} className="font-bold text-gray-800 text-xs block">{baseName}</Link>
                                            <p className="text-gray-700">{c.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-2"><input type="text" placeholder={t('write_comment')} value={commentText[post.id] || ''} onChange={(e) => setCommentText(prev => ({...prev, [post.id]: e.target.value}))} onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-900" /><button onClick={() => handleCommentSubmit(post.id)} className="text-brand-600"><Send size={16} /></button></div>
                    </div>
                )}
             </div>
            )}) : <div className="text-center py-10 text-gray-400">No posts found.</div>}
       </div>

       {/* Safety Modal */}
       {safetyViolation && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
               <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl border-4 border-red-100">
                   <h3 className="font-black text-2xl text-center text-gray-900 mb-2">{t('safety_warning')}</h3>
                   <p className="text-center text-gray-500 mb-6">{safetyViolation}</p>
                   <button onClick={() => setSafetyViolation(null)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold">{t('understand')}</button>
               </div>
           </div>
       )}

       {/* Report Modal */}
       {reportModalPostId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
                    <button onClick={handleCloseReportModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{t('report')}</h3>
                            <p className="text-sm text-gray-500">{t('report_modal_hint')}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('reason')}</label>
                            <select value={reportReason} onChange={(e) => setReportReason(e.target.value as ReportReason)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50">
                                <option value={ReportReason.SPAM}>{t('report_reason_spam')}</option>
                                <option value={ReportReason.HARASSMENT}>{t('report_reason_harassment')}</option>
                                <option value={ReportReason.INAPPROPRIATE}>{t('report_reason_inappropriate')}</option>
                                <option value={ReportReason.MISINFORMATION}>{t('report_reason_misinformation')}</option>
                                <option value={ReportReason.OTHER}>{t('report_reason_other')}</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleCloseReportModal} className="flex-1 border border-gray-200 rounded-xl py-3 font-bold text-gray-600">{t('cancel')}</button>
                            <button onClick={handleConfirmReport} className="flex-1 bg-red-500 text-white rounded-xl py-3 font-bold">{t('report')}</button>
                        </div>
                    </div>
                </div>
            </div>
       )}
    </div>
  );
};

const SocialAdCard: React.FC<{
  ad: ManualAd;
  label: string;
  userId?: string;
  userRole?: UserRole;
  locationHint?: string;
}> = ({ ad, label, userId, userRole, locationHint }) => {
  const { adRef, logAdClick } = useAdTracking({
      adId: ad.id,
      placement: ad.placement,
      context: 'social',
      userId,
      userRole,
      locationHint
  });

  return (
    <div ref={adRef} className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">{label}</span>
            {ad.highlightLabel && <span className="text-[10px] font-black text-amber-400 uppercase">{ad.highlightLabel}</span>}
        </div>
        <h4 className="text-lg font-black text-gray-900">{ad.title}</h4>
        {ad.description && <p className="text-sm text-gray-600">{ad.description}</p>}
        {ad.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-gray-100">
                <img src={ad.imageUrl} className="w-full h-44 object-cover" />
            </div>
        )}
        {ad.ctaText && ad.ctaUrl && (
            <a
              href={ad.ctaUrl}
              target="_blank"
              rel="noreferrer"
              onClick={logAdClick}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600"
            >
                {ad.ctaText}
            </a>
        )}
    </div>
  );
};

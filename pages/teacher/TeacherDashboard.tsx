
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, BookOpen, Users, Trash2, Edit2, Star, Search, Plus, Eye, X, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: string;
}

interface ChartData {
    name: string;
    sales: number;
    fullTitle: string;
}

export const TeacherDashboard = () => {
  const { user, exams, deleteExam, results, users, systemSettings, t, transactions, availableSubjects } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewResultsExamId, setViewResultsExamId] = useState<string | null>(null);

  const myExams = exams.filter(e => e.creatorId === user?.id);
  const totalSales = myExams.reduce((acc, curr) => acc + curr.sales, 0);
  const myTransactions = transactions.filter(tr => tr.teacherId === user?.id);
  const totalPointsEarned = myTransactions.reduce((acc, tr) => acc + tr.amount, 0);
  const totalGrossTL = totalPointsEarned * systemSettings.pointConversionRate;
  const netIncomeTL = totalGrossTL * ((100 - systemSettings.commissionRate) / 100);
  const avgRating = myExams.length > 0 ? (myExams.reduce((acc, curr) => acc + (curr.rating || 0), 0) / myExams.length).toFixed(1) : '0.0';

  const chartData: ChartData[] = [...myExams].sort((a, b) => b.sales - a.sales).slice(0, 5).map(e => ({ name: e.title.length > 10 ? e.title.substring(0, 10) + '...' : e.title, sales: e.sales, fullTitle: e.title }));
  const filteredExams = myExams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id: string) => { if (window.confirm(t('delete_confirm'))) deleteExam(id); };
  const handleEdit = (id: string) => { navigate(`/teacher/edit/${id}`); };

  const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg shadow-gray-200`}><Icon size={24} /></div>
        <div><p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p><p className="text-2xl font-black text-gray-900">{value}</p></div>
    </div>
  );

  const getExamResults = () => {
      if (!viewResultsExamId) return [];
      return results.filter(r => r.examId === viewResultsExamId).map(r => {
            const student = users.find(u => u.id === r.studentId);
            return { ...r, studentName: student?.name || 'Unknown', studentAvatar: student?.avatar };
        });
  };
  const currentExamResults = getExamResults();

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">
      <div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-gray-900">{t('teacher_dashboard')}</h2><button onClick={() => navigate('/teacher/create')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg active:scale-95 transform"><Plus size={20} /> {t('create_exam')}</button></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label={t('net_earnings')} value={`₺${netIncomeTL.toFixed(2)}`} color="bg-emerald-500" />
        <StatCard icon={BookOpen} label={t('total_exams')} value={myExams.length} color="bg-blue-500" />
        <StatCard icon={Users} label={t('total_sales')} value={totalSales} color="bg-violet-500" />
        <StatCard icon={Star} label={t('avg_rating')} value={avgRating} color="bg-amber-500" />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 h-96 relative overflow-hidden" style={{ minWidth: 0 }}>
         <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Users size={18} className="text-brand-600" /> {t('top_sellers')}</h3>
         <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} fontWeight={600} tickMargin={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} fontWeight={600} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} formatter={(value: number) => [`${value} Sales`, 'Sales']} labelStyle={{ color: '#111827', fontWeight: 'bold' }} />
                <Bar dataKey="sales" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={50} animationDuration={1000} />
            </BarChart>
         </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4"><h3 className="font-bold text-gray-800 text-xl">{t('my_exams')}</h3><div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="text" placeholder={t('search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm text-gray-900 shadow-sm font-medium" /></div></div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider"><tr><th className="p-4 pl-6 whitespace-nowrap">{t('title')}</th><th className="p-4 hidden md:table-cell">{t('subject')}</th><th className="p-4">{t('sales')}</th><th className="p-4 hidden md:table-cell">{t('price')}</th><th className="p-4 hidden md:table-cell">{t('avg_rating')}</th><th className="p-4 text-center">{t('action')}</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredExams.map(e => {
                            const subjName = availableSubjects.find(s => s.id === e.subjectId)?.name || 'Unknown';
                            return (
                            <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 pl-6"><div className="font-bold text-gray-900">{e.title}</div>{e.topic && <div className="text-xs text-gray-500 font-semibold">{e.topic}</div>}</td>
                                <td className="p-4 text-gray-600 text-sm hidden md:table-cell"><span className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-700">{subjName}</span></td>
                                <td className="p-4 font-bold text-gray-900">{e.sales}</td>
                                <td className="p-4 text-emerald-600 font-bold hidden md:table-cell"><div className="flex flex-col"><span>{e.price} Pts</span><span className="text-xs text-gray-500">₺{(e.price * systemSettings.pointConversionRate).toFixed(2)}</span></div></td>
                                <td className="p-4 text-amber-500 font-bold hidden md:table-cell"><div className="flex items-center gap-1"><Star size={14} fill="currentColor" /> {e.rating || '0.0'}</div></td>
                                <td className="p-4"><div className="flex items-center justify-center gap-2"><button onClick={() => setViewResultsExamId(e.id)} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 border border-purple-100 transition-colors" title={t('view_results')}><Eye size={18} /></button><button onClick={() => handleEdit(e.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors" title={t('edit')}><Edit2 size={18} /></button><button onClick={() => handleDelete(e.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition-colors" title={t('delete')}><Trash2 size={18} /></button></div></td>
                            </tr>
                        )})}
                        {filteredExams.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-gray-500"><div className="flex flex-col items-center gap-2"><BookOpen size={48} className="opacity-20" /><p className="font-bold">{t('no_exams')}</p></div></td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {viewResultsExamId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-fade-in relative border border-gray-200">
                  <button onClick={() => setViewResultsExamId(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                  <div className="p-6 border-b border-gray-100"><h3 className="text-xl font-bold text-gray-900">{t('student_results')}</h3><p className="text-sm text-gray-500 font-medium">{filteredExams.find(e => e.id === viewResultsExamId)?.title}</p></div>
                  <div className="flex-1 overflow-y-auto p-6">
                      {currentExamResults.length === 0 ? <div className="text-center text-gray-400 py-10"><Users size={48} className="mx-auto mb-2 opacity-30" /><p className="font-medium">{t('no_student_results')}</p></div> : <div className="space-y-3">{currentExamResults.map((res, idx) => (<div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200"><div className="flex items-center gap-3"><img src={res.studentAvatar} className="w-10 h-10 rounded-full border border-gray-200" /><div><div className="font-bold text-gray-900">{res.studentName}</div><div className="text-xs text-gray-500">{new Date(res.date).toLocaleDateString()}</div></div></div><div className="text-right"><div className="font-black text-brand-600 text-lg">{res.score}/{res.totalQuestions}</div><div className="text-xs font-bold text-gray-400 uppercase">Score</div></div></div>))}</div>}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};



import React, { useState, useEffect } from 'react';
import { Settings, Save, FileText } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminSettings = () => {
  const { systemSettings, updateSystemSettings, t } = useStore();
  const [commission, setCommission] = useState(20);
  const [maintenance, setMaintenance] = useState(false);
  const [pointConversion, setPointConversion] = useState(0.1);
  const [studentTerms, setStudentTerms] = useState('');
  const [teacherTerms, setTeacherTerms] = useState('');

  useEffect(() => {
    if (systemSettings) {
        setCommission(systemSettings.commissionRate);
        setMaintenance(systemSettings.maintenanceMode);
        setPointConversion(systemSettings.pointConversionRate || 0.1);
        setStudentTerms(systemSettings.studentTerms || '');
        setTeacherTerms(systemSettings.teacherTerms || '');
    }
  }, [systemSettings]);

  const handleSave = () => {
      updateSystemSettings({
          commissionRate: commission,
          maintenanceMode: maintenance,
          pointConversionRate: pointConversion,
          studentTerms,
          teacherTerms
      });
  };
  
  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-3xl font-bold text-gray-800">{t('sys_settings')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gray-100 rounded-2xl">
                   <Settings size={24} className="text-gray-600" />
                </div>
                <div>
                   <h3 className="font-bold text-lg text-gray-800">{t('gen_config')}</h3>
                   <p className="text-sm text-gray-500">{t('config_desc')}</p>
                </div>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('commission_rate')}</label>
                   <input 
                     type="number" 
                     value={commission}
                     onChange={(e) => setCommission(Number(e.target.value))}
                     className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900" 
                   />
                   <p className="text-xs text-gray-400 mt-1">{t('comm_desc')}</p>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('point_conversion')}</label>
                   <input 
                     type="number" 
                     step="0.01"
                     value={pointConversion}
                     onChange={(e) => setPointConversion(parseFloat(e.target.value))}
                     className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900" 
                   />
                   <p className="text-xs text-gray-400 mt-1">{t('point_conv_desc')} (Current: 100 Points = {(100 * pointConversion).toFixed(2)} TL)</p>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('maintenance_mode')}</label>
                   <div 
                     onClick={() => setMaintenance(!maintenance)}
                     className="flex items-center gap-3 cursor-pointer"
                   >
                      <div className={`w-14 h-8 rounded-full relative transition-colors ${maintenance ? 'bg-brand-500' : 'bg-gray-200'}`}>
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${maintenance ? 'left-7' : 'left-1'}`}></div>
                      </div>
                      <span className={`text-sm font-medium ${maintenance ? 'text-brand-600' : 'text-gray-600'}`}>
                          {maintenance ? 'Maintenance ON' : t('sys_active')}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gray-100 rounded-2xl">
                   <FileText size={24} className="text-gray-600" />
                </div>
                <div>
                   <h3 className="font-bold text-lg text-gray-800">{t('contract_mgmt')}</h3>
                   <p className="text-sm text-gray-500">Edit terms of service for roles.</p>
                </div>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('student_contract')}</label>
                   <textarea 
                     value={studentTerms}
                     onChange={(e) => setStudentTerms(e.target.value)}
                     className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900 text-xs font-mono h-32" 
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('teacher_contract')}</label>
                   <textarea 
                     value={teacherTerms}
                     onChange={(e) => setTeacherTerms(e.target.value)}
                     className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900 text-xs font-mono h-32" 
                   />
                </div>
             </div>
          </div>
      </div>

      <button 
          onClick={handleSave}
          className="fixed bottom-6 right-6 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-colors shadow-2xl shadow-brand-200 z-10 hover:scale-105"
      >
         <Save size={20} /> {t('save_changes')}
      </button>
    </div>
  );
};
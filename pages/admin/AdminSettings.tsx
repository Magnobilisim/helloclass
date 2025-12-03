

import React, { useState, useEffect } from 'react';
import { Settings, Save, FileText, Gift, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminSettings = () => {
  const { systemSettings, updateSystemSettings, t } = useStore();
  const [commission, setCommission] = useState(20);
  const [maintenance, setMaintenance] = useState(false);
  const [pointConversion, setPointConversion] = useState(0.1);
  const [studentTerms, setStudentTerms] = useState('');
  const [teacherTerms, setTeacherTerms] = useState('');
  const [adReward, setAdReward] = useState(50);
  const [referralReward, setReferralReward] = useState(100);
  const [packages, setPackages] = useState(systemSettings.pointPackages || []);
  const [packageName, setPackageName] = useState('');
  const [packagePoints, setPackagePoints] = useState(100);
  const [packagePrice, setPackagePrice] = useState(0);
  const [packageDesc, setPackageDesc] = useState('');
  const [aiWizardCost, setAiWizardCost] = useState(systemSettings.aiWizardCost || 0);
  const [aiExplainCost, setAiExplainCost] = useState(systemSettings.aiExplainCost || 0);

  useEffect(() => {
    if (systemSettings) {
        setCommission(systemSettings.commissionRate);
        setMaintenance(systemSettings.maintenanceMode);
        setPointConversion(systemSettings.pointConversionRate || 0.1);
        setStudentTerms(systemSettings.studentTerms || '');
        setTeacherTerms(systemSettings.teacherTerms || '');
        setAdReward(systemSettings.adRewardPoints || 0);
        setReferralReward(systemSettings.referralRewardPoints || 0);
        setPackages(systemSettings.pointPackages || []);
        setAiWizardCost(systemSettings.aiWizardCost ?? 0);
        setAiExplainCost(systemSettings.aiExplainCost ?? 0);
    }
  }, [systemSettings]);

  const handleAddPackage = () => {
      if (!packageName.trim() || packagePoints <= 0 || packagePrice <= 0) return;
      const newPackage = {
          id: `pkg-${Date.now()}`,
          name: packageName.trim(),
          points: packagePoints,
          price: packagePrice,
          description: packageDesc.trim()
      };
      setPackages(prev => [...prev, newPackage]);
      setPackageName('');
      setPackagePoints(100);
      setPackagePrice(0);
      setPackageDesc('');
  };

  const removePackage = (id: string) => {
      setPackages(prev => prev.filter(pkg => pkg.id !== id));
  };

  const handleSave = () => {
      updateSystemSettings({
          commissionRate: commission,
          maintenanceMode: maintenance,
          pointConversionRate: pointConversion,
          studentTerms,
          teacherTerms,
          adRewardPoints: adReward,
          referralRewardPoints: referralReward,
          pointPackages: packages,
          aiWizardCost,
          aiExplainCost
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

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">{t('ad_reward_points')}</label>
                       <input 
                         type="number" 
                         value={adReward}
                         onChange={(e) => setAdReward(Number(e.target.value))}
                         className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900" 
                       />
                       <p className="text-xs text-gray-400 mt-1">{t('ad_reward_hint')}</p>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">{t('referral_reward_points')}</label>
                       <input 
                         type="number" 
                         value={referralReward}
                         onChange={(e) => setReferralReward(Number(e.target.value))}
                         className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900" 
                       />
                       <p className="text-xs text-gray-400 mt-1">{t('referral_reward_hint')}</p>
                    </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('ai_wizard_cost')}</label>
                   <input
                      type="number"
                      min={0}
                      value={aiWizardCost}
                      onChange={e => setAiWizardCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900"
                   />
                   <p className="text-xs text-gray-400 mt-1">{t('ai_wizard_cost_hint')}</p>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t('ai_explain_cost')}</label>
                   <input
                      type="number"
                      min={0}
                      value={aiExplainCost}
                      onChange={e => setAiExplainCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-gray-900"
                   />
                   <p className="text-xs text-gray-400 mt-1">{t('ai_explain_cost_hint')}</p>
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
                   <p className="text-sm text-gray-500">{t('contract_hint')}</p>
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

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                  <Gift size={20} />
              </div>
              <div>
                  <h3 className="font-bold text-lg text-gray-800">{t('point_packages')}</h3>
                  <p className="text-sm text-gray-500">{t('point_packages_desc')}</p>
              </div>
          </div>
          <div className="space-y-3">
              {packages.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('no_packages')}</p>
              ) : (
                  packages.map(pkg => (
                      <div key={pkg.id} className="flex flex-wrap items-center gap-3 p-3 border border-gray-100 rounded-2xl">
                          <div className="flex-1">
                              <p className="font-semibold text-gray-900">{pkg.name}</p>
                              <p className="text-sm text-gray-500">{pkg.points} {t('points')} • ₺{pkg.price.toFixed(2)}</p>
                              {pkg.description && <p className="text-xs text-gray-400">{pkg.description}</p>}
                          </div>
                          <button onClick={() => removePackage(pkg.id)} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={18} />
                          </button>
                      </div>
                  ))
              )}
          </div>
          <div className="grid md:grid-cols-4 gap-4">
              <input 
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder={t('package_name')}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
              />
              <input 
                type="number"
                value={packagePoints}
                onChange={(e) => setPackagePoints(Number(e.target.value))}
                placeholder={t('package_points')}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
              />
              <input 
                type="number"
                value={packagePrice}
                onChange={(e) => setPackagePrice(Number(e.target.value))}
                placeholder={t('package_price')}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
              />
              <input 
                value={packageDesc}
                onChange={(e) => setPackageDesc(e.target.value)}
                placeholder={t('package_description')}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
              />
          </div>
          <button 
            onClick={handleAddPackage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-semibold text-sm w-full md:w-auto"
          >
            <Plus size={16} /> {t('add_package')}
          </button>
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
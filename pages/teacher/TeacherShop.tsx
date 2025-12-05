import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Zap, CreditCard, Wallet, TrendingUp, Clock, FileText } from 'lucide-react';

export const TeacherShop = () => {
  const { user, systemSettings, t, transactions, purchaseAiCredits, aiUsageLogs, showAlert } = useStore();

  if (!user) return null;

  const myTransactions = transactions.filter(tr => tr.teacherId === user.id);
  const totalPointsEarned = myTransactions.reduce((sum, tr) => sum + tr.amount, 0);
  const grossTL = totalPointsEarned * (systemSettings.pointConversionRate || 0);
  const netIncomeTL = grossTL * ((100 - systemSettings.commissionRate) / 100);

  const packages = systemSettings.teacherCreditPackages || [];
  const usageLogs = aiUsageLogs.filter(log => log.userId === user.id).slice(0, 8);

  const handleRequestPayout = () => {
    showAlert(t('payout_request_placeholder'), 'info');
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      <header className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Zap className="text-brand-500" size={28} />
          <div>
            <p className="text-xs uppercase font-bold text-gray-400">{t('teacher_wallet_title')}</p>
            <h1 className="text-2xl font-black text-gray-900">{t('teacher_shop_headline')}</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg flex items-center gap-4">
            <div className="bg-white/20 rounded-2xl p-4">
              <CreditCard size={28} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-80">{t('ai_credits_balance')}</p>
              <p className="text-3xl font-black">{user.points} {t('points')}</p>
              <p className="text-sm opacity-80">{t('ai_credits_hint')}</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <Wallet size={28} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">{t('net_earnings')}</p>
              <p className="text-3xl font-black text-gray-900">₺{netIncomeTL.toFixed(2)}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <TrendingUp size={14} /> {t('commission_info').replace('{commission}', `${systemSettings.commissionRate}%`)}
              </p>
            </div>
            <button
              onClick={handleRequestPayout}
              className="ml-auto bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              {t('request_payout')}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase font-bold text-gray-400">{t('ai_credit_packages')}</p>
            <h2 className="text-xl font-bold text-gray-900">{t('ai_credit_packages_subtitle')}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                <span className="text-xs font-bold text-gray-400 uppercase">{t('credits')}</span>
              </div>
              <p className="text-3xl font-black text-indigo-600 mt-2">{pkg.points}</p>
              <p className="text-sm text-gray-500 mb-4">₺{pkg.price.toFixed(2)}</p>
              {pkg.description && <p className="text-sm text-gray-500 flex-1">{pkg.description}</p>}
              <button
                onClick={() => purchaseAiCredits(pkg.id)}
                className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors"
              >
                {t('purchase')}
              </button>
            </div>
          ))}
          {packages.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">
              {t('no_packages_defined')}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="text-indigo-500" />
          <div>
            <p className="text-xs uppercase font-bold text-gray-400">{t('ai_usage_log_title')}</p>
            <h2 className="text-xl font-bold text-gray-900">{t('ai_usage_log_subtitle')}</h2>
          </div>
        </div>
        {usageLogs.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            {t('ai_usage_log_empty')}
          </div>
        ) : (
          <div className="space-y-3">
            {usageLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between border border-gray-100 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {t('ai_usage_entry').replace('{cost}', `${log.cost}`)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()} • {log.topic || t('general_topic')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">{t('balance_after')}</p>
                  <p className="text-lg font-black text-indigo-600">{log.creditsAfter}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="text-amber-500" />
          <div>
            <p className="text-xs uppercase font-bold text-gray-400">{t('earning_history_title')}</p>
            <h2 className="text-xl font-bold text-gray-900">{t('earning_history_subtitle')}</h2>
          </div>
        </div>
        {myTransactions.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            {t('no_transactions')}
          </div>
        ) : (
          <div className="space-y-3">
            {myTransactions
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 6)
              .map(tr => (
                <div key={tr.id} className="flex items-center justify-between border border-gray-100 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t('purchase_success')} • {tr.examId}</p>
                    <p className="text-xs text-gray-500">{new Date(tr.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">{tr.amount} {t('points')}</p>
                    <p className="text-xs text-gray-400">₺{(tr.amount * systemSettings.pointConversionRate).toFixed(2)}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

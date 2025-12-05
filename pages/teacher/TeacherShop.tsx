import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Zap, CreditCard, Wallet, TrendingUp, Clock, FileText, X } from 'lucide-react';

const statusBadgeClass = (status: string) => {
  if (status === 'approved') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (status === 'rejected') return 'bg-red-50 text-red-500 border-red-100';
  return 'bg-amber-50 text-amber-600 border-amber-100';
};

export const TeacherShop = () => {
  const { user, systemSettings, t, transactions, purchaseAiCredits, aiUsageLogs, showAlert, payouts, requestPayout, payoutRequests } = useStore();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  if (!user) return null;

  const myTransactions = transactions.filter(tr => tr.teacherId === user.id);
  const totalPointsEarned = myTransactions.reduce((sum, tr) => sum + tr.amount, 0);
  const grossTL = totalPointsEarned * (systemSettings.pointConversionRate || 0);
  const netIncomeTL = grossTL * ((100 - systemSettings.commissionRate) / 100);
  const myPayouts = payouts.filter(p => p.teacherId === user.id);
  const totalPaidOut = myPayouts.reduce((sum, p) => sum + p.amountTL, 0);
  const myRequests = payoutRequests.filter(req => req.teacherId === user.id);
  const pendingAmount = myRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amountTL, 0);
  const availablePayoutTL = Math.max(0, netIncomeTL - totalPaidOut - pendingAmount);

  const packages = systemSettings.teacherCreditPackages || [];
  const usageLogs = aiUsageLogs.filter(log => log.userId === user.id).slice(0, 8);

  const handleRequestClick = () => {
    if (availablePayoutTL <= 0) {
      showAlert(t('payout_amount_invalid'), 'error');
      return;
    }
    setPayoutAmount(availablePayoutTL.toFixed(2));
    setPayoutNote('');
    setShowPayoutModal(true);
  };

  const handleSubmitPayout = () => {
    const parsed = Number(payoutAmount);
    if (!parsed || parsed <= 0) {
      showAlert(t('payout_amount_invalid'), 'error');
      return;
    }
    if (requestPayout(parsed, payoutNote.trim() ? payoutNote.trim() : undefined)) {
      setShowPayoutModal(false);
      setPayoutAmount('');
      setPayoutNote('');
    }
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
            <div className="ml-auto flex flex-col items-end gap-1">
              <p className="text-xs text-gray-500 font-semibold">
                {t('available_payout_balance').replace('{amount}', `₺${availablePayoutTL.toFixed(2)}`)}
              </p>
              <button
                onClick={handleRequestClick}
                disabled={availablePayoutTL <= 0}
                className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {t('request_payout')}
              </button>
            </div>
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase font-bold text-gray-400">{t('payout_requests')}</p>
            <h2 className="text-xl font-bold text-gray-900">{t('payout_requests_subtitle')}</h2>
          </div>
          {pendingAmount > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl">
              {t('pending_amount').replace('{amount}', `₺${pendingAmount.toFixed(2)}`)}
            </span>
          )}
        </div>
        {myRequests.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
            {t('no_payout_requests')}
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map(req => (
                <div key={req.id} className="flex items-center justify-between border border-gray-100 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-800">₺{req.amountTL.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleString()}
                      {req.note ? ` • ${req.note}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${statusBadgeClass(req.status)}`}>
                    {t(`status_${req.status}`)}
                  </span>
                </div>
              ))}
          </div>
        )}
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

      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 relative">
            <button onClick={() => setShowPayoutModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-gray-900">{t('request_payout')}</h3>
            <p className="text-sm text-gray-500">
              {t('request_payout_desc').replace('{amount}', `₺${availablePayoutTL.toFixed(2)}`)}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t('enter_amount')}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t('optional_note')}</label>
                <textarea
                  value={payoutNote}
                  onChange={e => setPayoutNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                  rows={3}
                  placeholder={t('optional_note_placeholder')}
                />
              </div>
            </div>
            <button
              onClick={handleSubmitPayout}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              {t('submit_request')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

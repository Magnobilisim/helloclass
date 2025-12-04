
import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Star, Check, PlayCircle, Loader2, Package, CreditCard } from 'lucide-react';

export const StudentShop = () => {
  const { user, purchaseItem, toggleEquip, t, shopItems, systemSettings, watchAdForPoints, purchasePointPackage } = useStore();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [activeTab, setActiveTab] = useState<'market' | 'inventory'>('market');
  const adReward = systemSettings.adRewardPoints || 0;
  const inventoryCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      (user?.inventory || []).forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
      });
      return counts;
  }, [user?.inventory]);

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setTimeout(() => {
        setIsWatchingAd(false);
        watchAdForPoints();
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <header className="bg-gradient-to-r from-brand-400 to-orange-500 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ShoppingBag size={32} /> {t('shop')}
          </h2>
          <p className="opacity-90">{t('shop_subtitle')}</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/30">
             <Star className="text-yellow-300 fill-yellow-300" size={24} />
             <span className="text-2xl font-black">{user?.points}</span>
             <span className="text-sm font-medium uppercase tracking-wider opacity-80">{t('points')}</span>
          </div>
        </div>
      </header>

      <div className="bg-gray-100 p-1.5 rounded-2xl flex relative">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === 'market' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
          ></div>
          <button 
            onClick={() => setActiveTab('market')}
            className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'market' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <ShoppingBag size={18} /> {t('buy_more')}
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'inventory' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <Package size={18} /> {t('inventory')}
          </button>
      </div>

      {activeTab === 'market' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-xl gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <PlayCircle className="text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-0.5 text-yellow-400">{t('watch_ad')}</h3>
                        <p className="text-gray-400 text-xs">{t('watch_ad_desc')}</p>
                        <p className="text-xs text-gray-300 font-bold mt-1">{t('watch_ad_value').replace('{points}', `${adReward}`)}</p>
                    </div>
                </div>
                <button 
                    onClick={handleWatchAd}
                    disabled={isWatchingAd}
                    className="w-full md:w-auto bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {isWatchingAd ? <Loader2 className="animate-spin" size={20} /> : t('watch')} 
                    {isWatchingAd ? t('watching_ad') : `+${adReward} ${t('points')}`}
                </button>
            </div>

            {systemSettings.pointPackages && systemSettings.pointPackages.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <CreditCard size={18} className="text-brand-500" /> {t('buy_points')}
                          </h3>
                          <p className="text-sm text-gray-500">{t('buy_points_desc')}</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {systemSettings.pointPackages.map(pkg => (
                          <div key={pkg.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                              <div className="text-xs font-bold text-gray-400 uppercase">{pkg.name}</div>
                              <div className="text-2xl font-black text-gray-900">{pkg.points} {t('points')}</div>
                              <div className="text-sm text-gray-500">₺{pkg.price.toFixed(2)}</div>
                              {pkg.description && <p className="text-xs text-gray-400">{pkg.description}</p>}
                              <button 
                                onClick={() => purchasePointPackage(pkg.id)}
                                className="mt-auto bg-brand-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
                              >
                                {t('purchase')}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopItems.map(item => {
                const isOwned = user?.inventory.includes(item.type);
                const canAfford = (user?.points || 0) >= item.price;
                
                // Try to translate item name and desc
                const nameKey = `item_name_${item.type}`;
                const descKey = `item_desc_${item.type}`;
                
                const translatedName = t(nameKey) !== nameKey ? t(nameKey) : item.name;
                const translatedDesc = t(descKey) !== descKey ? t(descKey) : item.description;

                return (
                    <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
                        {item.icon}
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-1">{translatedName}</h3>
                    <p className="text-gray-500 text-sm mb-6 px-4 min-h-[40px] leading-snug">{translatedDesc}</p>
                    
                    <div className="mt-auto w-full">
                        {isOwned && item.type === 'AVATAR_FRAME' ? (
                        <button disabled className="w-full py-3 rounded-xl bg-green-50 text-green-600 border border-green-100 font-bold flex items-center justify-center gap-2 cursor-default">
                            <Check size={18} /> {t('owned')}
                        </button>
                        ) : (
                        <button 
                            onClick={() => {
                                const success = purchaseItem(item);
                                if(success && item.type === 'AVATAR_FRAME') setActiveTab('inventory');
                            }}
                            disabled={!canAfford}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            canAfford 
                                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-200 hover:scale-105' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isOwned && item.type !== 'AVATAR_FRAME' ? t('buy_more') : t('buy')} • {item.price}
                        </button>
                        )}
                    </div>
                    </div>
                );
                })}
            </div>
          </div>
      )}

      {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {shopItems.filter(item => user?.inventory.includes(item.type)).length === 0 ? (
                <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
                    <Package size={48} className="opacity-20 mb-4" />
                    <p className="font-bold text-lg text-gray-500">{t('empty_inventory')}</p>
                    <button onClick={() => setActiveTab('market')} className="mt-4 text-brand-600 font-bold hover:underline">
                        {t('go_to_market_btn')}
                    </button>
                </div>
            ) : (
                shopItems.filter(item => user?.inventory.includes(item.type)).map(item => {
                    const count = inventoryCounts[item.type] || 0;
                    const isEquipped = user?.activeFrame === item.type;
                    const canEquip = item.type === 'AVATAR_FRAME';
                    
                    const nameKey = `item_name_${item.type}`;
                    const descKey = `item_desc_${item.type}`;
                    const translatedName = t(nameKey) !== nameKey ? t(nameKey) : item.name;
                    const translatedDesc = t(descKey) !== descKey ? t(descKey) : item.description;

                    return (
                        <div key={`inv-${item.id}`} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                            <div className="text-4xl bg-gray-50 p-4 rounded-2xl">{item.icon}</div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 truncate flex items-center gap-2">
                                    {translatedName}
                                    {count > 1 && <span className="text-xs font-bold text-gray-400">×{count}</span>}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{translatedDesc}</p>
                            </div>
                            {canEquip ? (
                                <button 
                                    onClick={() => toggleEquip(item.type)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${isEquipped ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'}`}
                                >
                                    {isEquipped ? t('unequip') : t('equip')}
                                </button>
                            ) : (
                                <div className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-lg">
                                    {t('consumable')}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
          </div>
      )}
    </div>
  );
};

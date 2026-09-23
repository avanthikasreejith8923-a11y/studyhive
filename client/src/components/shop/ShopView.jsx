import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { shopAPI } from '../../services/api';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { DeskDecorRenderer } from '../library/DeskDecorRenderer';
import { Sparkles, Check, Lock, ShoppingBag, Coins, ShieldCheck, ArrowRight, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Gear' },
  { id: 'hair', name: 'Hair 🦱' },
  { id: 'outfit', name: 'Outfits 🧥' },
  { id: 'accessory', name: 'Accessories 👓' },
  { id: 'deskDecor', name: 'Desk Decor 🪴' },
];

export const ShopView = () => {
  const { user, updateUser } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModalItem, setConfirmModalItem] = useState(null);
  const [notification, setNotification] = useState('');

  // Fetch shop catalog on mount
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await shopAPI.getCatalog();
        setCatalog(data.catalog || []);
        if (data.user) {
          updateUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load shop catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  const ownedItems = user?.ownedItems || [];
  const equippedItems = user?.equippedItems || {
    hair: 'hair_curly',
    outfit: 'outfit_sweater',
    accessory: 'acc_glasses',
    deskDecor: 'decor_mug',
  };

  const handleEquip = async (itemId) => {
    setActionLoading(true);
    setNotification('');
    try {
      const data = await shopAPI.equip(itemId);
      updateUser(data.user);
      setNotification(`Equipped item successfully! ✨`);
    } catch (err) {
      setNotification(err.message || 'Failed to equip item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!confirmModalItem) return;
    setActionLoading(true);
    setNotification('');
    try {
      const data = await shopAPI.purchase(confirmModalItem.id, true);
      updateUser(data.user);
      setNotification(`Unlocked & equipped ${confirmModalItem.name}! 🍯`);
      setConfirmModalItem(null);
    } catch (err) {
      setNotification(err.message || 'Failed to complete purchase.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCatalog =
    selectedCategory === 'all'
      ? catalog
      : catalog.filter((item) => item.category === selectedCategory);

  // Level & XP calculations
  const xpCurrent = (user?.xp || 0) % 100;
  const xpNextThreshold = 100;

  return (
    <div className="space-y-6">
      {/* Top Banner: Honey Jar & Level Progression */}
      <div className="pixel-panel p-5 bg-honey-100 border-4 border-pixel-border flex flex-col md:flex-row items-center justify-between gap-5 shadow-pixel">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cream-50 border-3 border-pixel-border flex items-center justify-center text-2xl shadow-pixel-sm">
            🍯
          </div>
          <div>
            <div className="font-pixel text-xs text-honey-800 uppercase">
              HONEY RESERVES & LEVEL
            </div>
            <div className="font-pixel text-xl sm:text-2xl text-oak-900 mt-0.5">
              {user?.honey ?? 50} Honey Drops
            </div>
            <p className="font-sans text-xs text-oak-700">
              Earn honey drops and XP by completing focused Pomodoro study sessions.
            </p>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div className="bg-cream-50 border-2 border-pixel-border p-3.5 shadow-pixel-sm min-w-[240px] w-full md:w-auto">
          <div className="flex items-center justify-between font-pixel text-[10px] text-oak-900 mb-1.5">
            <span className="flex items-center gap-1">
              <span className="text-honey-600">⭐</span>
              LEVEL {user?.level || 1}
            </span>
            <span className="font-sans text-xs font-bold text-honey-800">
              {xpCurrent} / {xpNextThreshold} XP
            </span>
          </div>
          <div className="w-full h-3 bg-cream-300 border border-pixel-border p-0.5 shadow-inner">
            <div
              className="h-full bg-honey-500 transition-all duration-300"
              style={{ width: `${(xpCurrent / xpNextThreshold) * 100}%` }}
            />
          </div>
          <div className="font-sans text-[10px] text-oak-600 text-right mt-1">
            {xpNextThreshold - xpCurrent} XP needed for Level {(user?.level || 1) + 1}
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-honey-200 border-2 border-pixel-border font-sans text-sm text-oak-900 shadow-pixel-sm animate-gentle-pulse flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="text-xs font-bold">✕</button>
        </div>
      )}

      {/* Main Grid: Left = Preview, Right = Catalog & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Avatar & Desk Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="pixel-panel p-5 bg-cream-100 shadow-pixel text-center">
            <div className="font-pixel text-xs text-oak-900 mb-3 border-b-2 border-pixel-border pb-2 flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-honey-700" />
              <span>LIVE AVATAR PREVIEW</span>
            </div>

            {/* Avatar Display Box */}
            <div className="relative bg-cream-200 border-3 border-pixel-border p-6 shadow-pixel-sm flex flex-col items-center justify-center min-h-[180px] overflow-hidden">
              <PixelAvatar size={100} equipped={equippedItems} animated={true} />

              {/* Desk Surface Preview under avatar */}
              <div className="w-full max-w-[200px] h-6 bg-[#92400E] border-2 border-pixel-border mt-3 relative flex items-center justify-end px-3">
                <div className="absolute -top-6 right-4">
                  <DeskDecorRenderer decorId={equippedItems.deskDecor} size={28} />
                </div>
              </div>
            </div>

            {/* Loadout Summary Details */}
            <div className="mt-4 text-left font-sans text-xs space-y-2 bg-cream-50 p-3 border-2 border-pixel-border">
              <div className="font-pixel text-[9px] text-honey-800 mb-1">EQUIPPED LOADOUT</div>
              <div className="flex justify-between border-b border-pixel-border/20 pb-1">
                <span className="text-oak-600">Hair:</span>
                <span className="font-semibold text-oak-900 truncate max-w-[130px]">
                  {catalog.find((i) => i.id === equippedItems.hair)?.name || 'Cozy Curls'}
                </span>
              </div>
              <div className="flex justify-between border-b border-pixel-border/20 pb-1">
                <span className="text-oak-600">Outfit:</span>
                <span className="font-semibold text-oak-900 truncate max-w-[130px]">
                  {catalog.find((i) => i.id === equippedItems.outfit)?.name || 'Knit Sweater'}
                </span>
              </div>
              <div className="flex justify-between border-b border-pixel-border/20 pb-1">
                <span className="text-oak-600">Accessory:</span>
                <span className="font-semibold text-oak-900 truncate max-w-[130px]">
                  {catalog.find((i) => i.id === equippedItems.accessory)?.name || 'Round Glasses'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-oak-600">Desk Decor:</span>
                <span className="font-semibold text-oak-900 truncate max-w-[130px]">
                  {catalog.find((i) => i.id === equippedItems.deskDecor)?.name || 'Steaming Mug'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Catalog Grid & Categories (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="pixel-panel p-5 bg-cream-100 shadow-pixel">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-5 border-b-2 border-pixel-border pb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`pixel-btn text-xs py-1.5 px-3 ${
                    selectedCategory === cat.id
                      ? 'bg-honey-500 text-oak-900 font-bold'
                      : 'bg-cream-50 text-oak-700 hover:bg-cream-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="text-center py-10 font-sans text-sm text-oak-600">
                Opening library wardrobe & shop archives...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredCatalog.map((item) => {
                  const isOwned = ownedItems.includes(item.id);
                  const isEquipped =
                    equippedItems && equippedItems[item.category] === item.id;
                  const canAfford = (user?.honey || 0) >= item.cost;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 border-2 transition-all flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-amber-50 border-honey-600 shadow-pixel ring-1 ring-honey-500'
                          : isOwned
                          ? 'bg-cream-50 border-pixel-border shadow-pixel-sm'
                          : 'bg-cream-200/80 border-pixel-border/60 shadow-pixel-sm'
                      }`}
                    >
                      <div>
                        {/* Card Header: Icon & Category */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl p-1 bg-cream-100 border border-pixel-border">
                            {item.icon}
                          </span>
                          <span className="font-pixel text-[8px] bg-cream-200 px-1.5 py-0.5 border border-pixel-border text-oak-700 uppercase">
                            {item.category}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="font-pixel text-[11px] text-oak-900 mb-1 leading-snug">
                          {item.name}
                        </h4>
                        <p className="font-sans text-xs text-oak-600 mb-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Pricing & Action */}
                      <div className="pt-2 border-t border-pixel-border/20 flex items-center justify-between gap-2 mt-auto">
                        <div className="font-pixel text-[10px] text-honey-800">
                          {item.cost === 0 ? 'FREE' : `🍯 ${item.cost}`}
                        </div>

                        <div>
                          {isEquipped ? (
                            <span className="bg-emerald-600 text-white font-pixel text-[9px] px-2 py-1 border border-pixel-border shadow-pixel-sm flex items-center gap-1">
                              <Check size={10} />
                              EQUIPPED
                            </span>
                          ) : isOwned ? (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleEquip(item.id)}
                              className="pixel-btn bg-cream-100 hover:bg-white text-[9px] py-1 px-3 text-oak-900 font-bold"
                            >
                              EQUIP
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoading || !canAfford}
                              onClick={() => setConfirmModalItem(item)}
                              className={`pixel-btn text-[9px] py-1 px-2.5 flex items-center gap-1 ${
                                canAfford
                                  ? 'pixel-btn-primary'
                                  : 'bg-cream-300 text-oak-400 border-pixel-border cursor-not-allowed'
                              }`}
                            >
                              <Lock size={10} />
                              <span>UNLOCK</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {confirmModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm pixel-panel bg-cream-100 p-0 overflow-hidden shadow-pixel-lg">
            <div className="pixel-panel-header">
              <span className="font-pixel text-[10px]">UNLOCK CATALOG ITEM</span>
              <button
                onClick={() => setConfirmModalItem(null)}
                className="hover:bg-honey-500 p-0.5 border border-pixel-border"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5 text-center space-y-4">
              <div className="text-4xl p-3 bg-cream-50 border-2 border-pixel-border inline-block shadow-pixel-sm">
                {confirmModalItem.icon}
              </div>

              <div>
                <h3 className="font-pixel text-sm text-oak-900">
                  {confirmModalItem.name}
                </h3>
                <p className="font-sans text-xs text-oak-600 mt-1">
                  {confirmModalItem.description}
                </p>
              </div>

              <div className="bg-honey-100 border-2 border-pixel-border p-3 text-xs font-sans text-oak-800 space-y-1">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-bold text-honey-900 font-pixel text-[11px]">
                    🍯 {confirmModalItem.cost} Honey
                  </span>
                </div>
                <div className="flex justify-between border-t border-pixel-border/20 pt-1">
                  <span>Your Balance:</span>
                  <span className="font-bold text-oak-900 font-pixel text-[11px]">
                    🍯 {user?.honey ?? 0} Honey
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmModalItem(null)}
                  className="pixel-btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmPurchase}
                  className="pixel-btn-primary text-xs px-5 py-2"
                >
                  {actionLoading ? 'UNLOCKING...' : 'CONFIRM & EQUIP 🍯'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

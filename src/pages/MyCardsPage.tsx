import { useState, useMemo } from 'react';
import { CardList } from '../components/CardList';
import type { CreditCard } from '../types';
import cardsData from '../data/cards.json';
import paymentsData from '../data/payments.json';

// 處理信用卡和簽帳金融卡
const allCards: CreditCard[] = (cardsData.cards as CreditCard[]).map((card) => {
  // 檢查是否為簽帳金融卡
  const isDebitCard =
    card.name.includes('金融卡') ||
    card.name.includes('簽帳') ||
    card.name.includes('VISA金融卡') ||
    card.name.includes('debit') ||
    card.officialUrl?.includes('visa-debit') ||
    false;

  return {
    ...card,
    isDebitCard,
    cardType: isDebitCard ? 'debit' : 'credit',
  };
});

// 處理行動支付和電子票證
const allPayments: CreditCard[] = paymentsData.payments.map((payment) => {
  // 判斷是行動支付還是電子票證
  const isETicket = ['easycard', 'ipass', 'icash-pay'].includes(payment.id);
  const cardType = isETicket ? 'eticket' : 'mobile';

  return {
    ...payment,
    bank: payment.provider,
    isPayment: true,
    paymentType: isETicket ? 'eticket' : 'mobile',
    cardType,
  };
}) as CreditCard[];
const allItems: CreditCard[] = [...allCards, ...allPayments];

interface MyCardsPageProps {
  myCards: string[];
  favorites: string[];
  onToggleOwn: (cardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
}

export function MyCardsPage({
  myCards,
  favorites,
  onToggleOwn,
  onToggleFavorite,
}: MyCardsPageProps) {
  const [viewMode, setViewMode] = useState<'owned' | 'favorites' | 'all'>(
    'all'
  );
  const [cardType, setCardType] = useState<
    'all' | 'credit' | 'debit' | 'mobile' | 'eticket'
  >('all');
  const [showExpired, setShowExpired] = useState(false);

  // 篩選我的優惠工具
  const filteredCards = useMemo(() => {
    let cards: CreditCard[] = [];

    switch (viewMode) {
      case 'owned':
        cards = allItems.filter((item) => myCards.includes(item.id));
        break;
      case 'favorites':
        cards = allItems.filter((item) => favorites.includes(item.id));
        break;
      case 'all':
        // 顯示所有擁有或收藏的工具（聯集）
        cards = allItems.filter(
          (item) => myCards.includes(item.id) || favorites.includes(item.id)
        );
        break;
    }

    // 根據卡片類型篩選
    if (cardType !== 'all') {
      cards = cards.filter((card) => card.cardType === cardType);
    }

    // 按銀行和名稱排序
    cards.sort((a, b) => {
      const bankCompare = a.bank.localeCompare(b.bank);
      if (bankCompare !== 0) return bankCompare;
      return a.name.localeCompare(b.name);
    });

    return cards;
  }, [myCards, favorites, viewMode, cardType]);

  // 計算各類別的優惠數量
  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();

    filteredCards.forEach((card) => {
      card.benefits.forEach((benefit) => {
        const count = stats.get(benefit.category) || 0;
        stats.set(benefit.category, count + 1);
      });
    });

    return Array.from(stats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredCards]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <span>👤</span>
          <span>我的錢包</span>
        </h1>

        {/* 卡片類型選擇 */}
        <div className="flex justify-center mb-4 overflow-x-auto">
          <div className="flex bg-base-200 rounded-lg p-1 gap-1 min-w-fit">
            <button
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                cardType === 'all'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
              onClick={() => setCardType('all')}
            >
              全部
            </button>
            <button
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                cardType === 'credit'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
              onClick={() => setCardType('credit')}
            >
              💳 信用卡
            </button>
            <button
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                cardType === 'debit'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
              onClick={() => setCardType('debit')}
            >
              🏛️ 簽帳金融卡
            </button>
            <button
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                cardType === 'mobile'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
              onClick={() => setCardType('mobile')}
            >
              📱 行動支付
            </button>
            <button
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                cardType === 'eticket'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
              onClick={() => setCardType('eticket')}
            >
              🎫 電子票證
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* 檢視模式 */}
          <div className="tabs tabs-boxed">
            <button
              className={`tab ${viewMode === 'all' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              <span className="flex items-center gap-1">
                <span>📊</span>
                全部 (
                {
                  allItems.filter(
                    (item) =>
                      myCards.includes(item.id) || favorites.includes(item.id)
                  ).length
                }
                )
              </span>
            </button>
            <button
              className={`tab ${viewMode === 'owned' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('owned')}
            >
              <span className="flex items-center gap-1">
                <span>💳</span>
                已擁有 ({myCards.length})
              </span>
            </button>
            <button
              className={`tab ${viewMode === 'favorites' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('favorites')}
            >
              <span className="flex items-center gap-1">
                <span>⭐</span>
                已收藏 ({favorites.length})
              </span>
            </button>
          </div>

          {/* 顯示過期選項 */}
          <div className="form-control justify-end ml-auto">
            <label className="label cursor-pointer gap-2">
              <span className="label-text">顯示已過期活動</span>
              <input
                type="checkbox"
                className="toggle"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* 統計資訊 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">錢包統計</h2>
              <div className="stat">
                <div className="stat-title">目前檢視</div>
                <div className="stat-value text-2xl text-primary">
                  {filteredCards.length} 項
                </div>
                <div className="stat-desc">
                  {viewMode === 'all' && '錢包裡的所有項目'}
                  {viewMode === 'owned' && '錢包裡已擁有的'}
                  {viewMode === 'favorites' && '錢包裡已收藏的'}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">優惠涵蓋</h2>
              <div className="stat">
                <div className="stat-title">類別數量</div>
                <div className="stat-value text-2xl text-success">
                  {categoryStats.length} 類
                </div>
                <div className="stat-desc">涵蓋各種消費類別</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="card-body">
              <h2 className="card-title text-lg mb-2">熱門優惠類別</h2>
              <div className="space-y-2">
                {categoryStats.map(([category, count]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <span className="badge badge-outline">{category}</span>
                    <span className="text-sm font-semibold">
                      {count} 項優惠
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredCards.length === 0 && (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {viewMode === 'owned' &&
                '👆 先將您擁有的支付工具加入收藏，系統將為您智慧匹配最優惠方案！'}
              {viewMode === 'favorites' &&
                '⭐ 收藏感興趣的支付工具，方便隨時比較回饋率和優惠條件！'}
              {viewMode === 'all' &&
                '🚀 開始建立您的智慧錢包，找到最適合的支付優惠！'}
            </span>
          </div>
        )}
      </div>

      <CardList
        cards={filteredCards}
        myCards={myCards}
        favorites={favorites}
        onToggleOwn={onToggleOwn}
        onToggleFavorite={onToggleFavorite}
        isLoading={false}
        hasSearched={true}
        showExpired={showExpired}
      />
    </div>
  );
}

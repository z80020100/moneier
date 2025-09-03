import { useState, useMemo } from 'react';
import { CardList } from '../components/CardList';
import type { CreditCard } from '../types';
import cardsData from '../data/cards.json';
import paymentsData from '../data/payments.json';

const allCards: CreditCard[] = cardsData.cards as CreditCard[];
const allPayments: CreditCard[] = paymentsData.payments.map((payment) => {
  // 判斷是行動支付還是電子票證
  const isETicket = ['easycard', 'ipass', 'icash-pay'].includes(payment.id);
  return {
    ...payment,
    bank: payment.provider,
    isPayment: true,
    paymentType: isETicket ? 'eticket' : 'mobile',
  };
}) as CreditCard[];
const allItems: CreditCard[] = [...allCards, ...allPayments];

interface AllCardsPageProps {
  myCards: string[];
  favorites: string[];
  onToggleOwn: (cardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
}

export function AllCardsPage({
  myCards,
  favorites,
  onToggleOwn,
  onToggleFavorite,
}: AllCardsPageProps) {
  const [selectedTypes, setSelectedTypes] = useState<
    Set<'credit' | 'mobile' | 'eticket'>
  >(
    new Set(['credit', 'mobile', 'eticket']) // 預設全選
  );
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [showExpired, setShowExpired] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'benefits' | 'rate'>('name');

  // 取得所有信用卡銀行列表（只有信用卡才需要）
  const creditCardBanks = useMemo(() => {
    const bankSet = new Set(allCards.map((card) => card.bank));
    return Array.from(bankSet).sort();
  }, []);

  // 篩選和排序卡片
  const filteredCards = useMemo(() => {
    let cards = [...allItems];

    // 第一層：種類篩選（多選）
    if (selectedTypes.size > 0 && selectedTypes.size < 3) {
      // 如果不是全選
      cards = cards.filter((card) => {
        if (!card.isPayment) {
          // 信用卡
          return selectedTypes.has('credit');
        } else if (card.paymentType === 'mobile') {
          // 行動支付
          return selectedTypes.has('mobile');
        } else if (card.paymentType === 'eticket') {
          // 電子票證
          return selectedTypes.has('eticket');
        }
        return false;
      });
    }

    // 第二層：銀行篩選（只有包含信用卡時才顯示）
    if (selectedTypes.has('credit') && selectedBank) {
      cards = cards.filter((card) => {
        // 只篩選信用卡的銀行，不影響支付方式
        if (!card.isPayment) {
          return card.bank === selectedBank;
        }
        return true; // 支付方式保留
      });
    }

    // 排序
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'benefits':
          // 按優惠數量排序
          return b.benefits.length - a.benefits.length;
        case 'rate': {
          // 按最高回饋率排序
          const aMaxRate = Math.max(
            ...a.benefits.map((benefit) => benefit.maxRate)
          );
          const bMaxRate = Math.max(
            ...b.benefits.map((benefit) => benefit.maxRate)
          );
          return bMaxRate - aMaxRate;
        }
        default: // 'name'
          // 按名稱排序
          return a.name.localeCompare(b.name);
      }
    });

    return cards;
  }, [selectedTypes, selectedBank, sortBy]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <span>💳</span>
          <span>所有優惠</span>
        </h1>

        {/* 第一層：種類篩選（多選按鈕） */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm sm:btn-md transition-all duration-200 ${
              selectedTypes.size === 3
                ? 'btn-primary hover:btn-primary hover:shadow-lg hover:-translate-y-0.5 hover:scale-105'
                : 'btn-outline btn-primary hover:btn-outline hover:border-primary hover:text-primary hover:bg-transparent hover:shadow-md hover:-translate-y-0.5 hover:scale-105'
            }`}
            onClick={() => {
              if (selectedTypes.size === 3) {
                setSelectedTypes(new Set()); // 清空
              } else {
                setSelectedTypes(new Set(['credit', 'mobile', 'eticket'])); // 全選
              }
              setSelectedBank(''); // 清除銀行篩選
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">🎯</span>
              <span>全部</span>
              <span className="badge badge-neutral badge-xs sm:badge-sm">
                {allItems.length}
              </span>
            </span>
          </button>
          <button
            className={`btn btn-sm sm:btn-md transition-all duration-200 ${
              selectedTypes.has('credit')
                ? 'btn-info hover:btn-info hover:shadow-lg hover:-translate-y-0.5 hover:scale-105'
                : 'btn-outline btn-info hover:btn-outline hover:border-info hover:text-info hover:bg-transparent hover:shadow-md hover:-translate-y-0.5 hover:scale-105'
            }`}
            onClick={() => {
              const newTypes = new Set(selectedTypes);
              if (selectedTypes.has('credit')) {
                newTypes.delete('credit');
                setSelectedBank(''); // 清除銀行篩選
              } else {
                newTypes.add('credit');
              }
              setSelectedTypes(newTypes);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">💳</span>
              <span>信用卡</span>
              <span className="badge badge-neutral badge-xs sm:badge-sm">
                {allCards.length}
              </span>
            </span>
          </button>
          <button
            className={`btn btn-sm sm:btn-md transition-all duration-200 ${
              selectedTypes.has('mobile')
                ? 'btn-secondary hover:btn-secondary hover:shadow-lg hover:-translate-y-0.5 hover:scale-105'
                : 'btn-outline btn-secondary hover:btn-outline hover:border-secondary hover:text-secondary hover:bg-transparent hover:shadow-md hover:-translate-y-0.5 hover:scale-105'
            }`}
            onClick={() => {
              const newTypes = new Set(selectedTypes);
              if (selectedTypes.has('mobile')) {
                newTypes.delete('mobile');
              } else {
                newTypes.add('mobile');
              }
              setSelectedTypes(newTypes);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">📱</span>
              <span className="hidden sm:inline">行動支付</span>
              <span className="sm:hidden">行動</span>
              <span className="badge badge-neutral badge-xs sm:badge-sm">
                {allPayments.filter((p) => p.paymentType === 'mobile').length}
              </span>
            </span>
          </button>
          <button
            className={`btn btn-sm sm:btn-md transition-all duration-200 ${
              selectedTypes.has('eticket')
                ? 'btn-accent hover:btn-accent hover:shadow-lg hover:-translate-y-0.5 hover:scale-105'
                : 'btn-outline btn-accent hover:btn-outline hover:border-accent hover:text-accent hover:bg-transparent hover:shadow-md hover:-translate-y-0.5 hover:scale-105'
            }`}
            onClick={() => {
              const newTypes = new Set(selectedTypes);
              if (selectedTypes.has('eticket')) {
                newTypes.delete('eticket');
              } else {
                newTypes.add('eticket');
              }
              setSelectedTypes(newTypes);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">🎫</span>
              <span className="hidden sm:inline">電子票證</span>
              <span className="sm:hidden">票證</span>
              <span className="badge badge-neutral badge-xs sm:badge-sm">
                {allPayments.filter((p) => p.paymentType === 'eticket').length}
              </span>
            </span>
          </button>
        </div>

        {/* 第二層：條件篩選與排序 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-4">
          {/* 手機版：排序和銀行篩選同一行 */}
          <div className="flex gap-2 w-full sm:w-auto">
            {/* 排序選項 */}
            <select
              className="select select-bordered select-sm flex-1 sm:flex-initial sm:w-48"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'name' | 'benefits' | 'rate')
              }
            >
              <option value="name">名稱</option>
              <option value="benefits">優惠數量</option>
              <option value="rate">最高回饋率</option>
            </select>

            {/* 銀行篩選（只有包含信用卡時才顯示） */}
            {selectedTypes.has('credit') && (
              <select
                className="select select-bordered select-sm flex-1 sm:flex-initial sm:w-48"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="">所有銀行</option>
                {creditCardBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 顯示過期選項 - 手機版單獨一行，桌面版推到最右邊 */}
          <div className="form-control sm:ml-auto">
            <label className="label cursor-pointer gap-2 justify-start sm:justify-end">
              <span className="label-text text-sm">顯示已過期</span>
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="stats stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">全部</div>
            <div className="stat-value text-primary">
              {filteredCards.length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">擁有</div>
            <div className="stat-value text-success">
              {filteredCards.filter((card) => myCards.includes(card.id)).length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">收藏</div>
            <div className="stat-value text-warning">
              {
                filteredCards.filter((card) => favorites.includes(card.id))
                  .length
              }
            </div>
          </div>
        </div>
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

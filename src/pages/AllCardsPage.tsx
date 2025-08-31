import { useState, useMemo } from 'react';
import { CardList } from '../components/CardList';
import type { CreditCard } from '../types';
import cardsData from '../data/cards.json';

const allCards: CreditCard[] = cardsData.cards as CreditCard[];

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
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [showExpired, setShowExpired] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'bank'>('bank');

  // 取得所有銀行列表
  const banks = useMemo(() => {
    const bankSet = new Set(allCards.map((card) => card.bank));
    return Array.from(bankSet).sort();
  }, []);

  // 篩選和排序卡片
  const filteredCards = useMemo(() => {
    let cards = [...allCards];

    // 篩選銀行
    if (selectedBank) {
      cards = cards.filter((card) => card.bank === selectedBank);
    }

    // 排序
    cards.sort((a, b) => {
      if (sortBy === 'bank') {
        const bankCompare = a.bank.localeCompare(b.bank);
        if (bankCompare !== 0) return bankCompare;
        return a.name.localeCompare(b.name);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return cards;
  }, [selectedBank, sortBy]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <span>💳</span>
          <span>所有信用卡</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* 銀行篩選 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">篩選銀行</span>
            </label>
            <select
              className="select select-bordered w-full sm:w-48"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              <option value="">全部銀行</option>
              {banks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          {/* 排序選項 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">排序方式</span>
            </label>
            <select
              className="select select-bordered w-full sm:w-48"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'bank')}
            >
              <option value="bank">依銀行排序</option>
              <option value="name">依卡片名稱排序</option>
            </select>
          </div>

          {/* 顯示過期選項 */}
          <div className="form-control justify-end">
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

        <div className="stats stats-vertical sm:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">總卡片數</div>
            <div className="stat-value text-primary">
              {filteredCards.length}
            </div>
            <div className="stat-desc">
              {selectedBank ? `${selectedBank} 的卡片` : '所有銀行'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">我擁有的</div>
            <div className="stat-value text-success">
              {filteredCards.filter((card) => myCards.includes(card.id)).length}
            </div>
            <div className="stat-desc">已加入我的卡片</div>
          </div>
          <div className="stat">
            <div className="stat-title">收藏的</div>
            <div className="stat-value text-warning">
              {
                filteredCards.filter((card) => favorites.includes(card.id))
                  .length
              }
            </div>
            <div className="stat-desc">已加入最愛</div>
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

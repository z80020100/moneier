import { useState, useMemo } from 'react';
import { CardList } from '../components/CardList';
import type { CreditCard } from '../types';
import cardsData from '../data/cards.json';

const allCards: CreditCard[] = cardsData.cards as CreditCard[];

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
  const [showExpired, setShowExpired] = useState(false);

  // 篩選我的卡片
  const filteredCards = useMemo(() => {
    let cards: CreditCard[] = [];

    switch (viewMode) {
      case 'owned':
        cards = allCards.filter((card) => myCards.includes(card.id));
        break;
      case 'favorites':
        cards = allCards.filter((card) => favorites.includes(card.id));
        break;
      case 'all':
        // 顯示所有擁有或收藏的卡片（聯集）
        cards = allCards.filter(
          (card) => myCards.includes(card.id) || favorites.includes(card.id)
        );
        break;
    }

    // 按銀行和名稱排序
    cards.sort((a, b) => {
      const bankCompare = a.bank.localeCompare(b.bank);
      if (bankCompare !== 0) return bankCompare;
      return a.name.localeCompare(b.name);
    });

    return cards;
  }, [myCards, favorites, viewMode]);

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
          <span>我的卡片</span>
        </h1>

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
                  allCards.filter(
                    (card) =>
                      myCards.includes(card.id) || favorites.includes(card.id)
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
              <h2 className="card-title text-lg">卡片統計</h2>
              <div className="stat">
                <div className="stat-title">目前檢視</div>
                <div className="stat-value text-2xl text-primary">
                  {filteredCards.length} 張
                </div>
                <div className="stat-desc">
                  {viewMode === 'all' && '所有我的卡片'}
                  {viewMode === 'owned' && '已擁有的卡片'}
                  {viewMode === 'favorites' && '已收藏的卡片'}
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
                '您還沒有標記任何已擁有的卡片。在搜尋或瀏覽卡片時，點擊「+ 我有此卡」來加入您實際擁有的信用卡。'}
              {viewMode === 'favorites' &&
                '您還沒有收藏任何卡片。在搜尋或瀏覽卡片時，點擊星星圖示（⭐）來收藏感興趣的信用卡。'}
              {viewMode === 'all' &&
                '您還沒有任何卡片。開始搜尋並加入您擁有或感興趣的信用卡吧！'}
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

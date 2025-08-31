import type { CreditCard } from '../types';
import { CardItem } from './CardItem';
import { SEARCH_PLACEHOLDER } from '../constants';

interface CardListProps {
  cards: CreditCard[];
  category?: string;
  myCards: string[];
  favorites: string[];
  onToggleOwn: (cardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
  isLoading?: boolean;
  hasSearched?: boolean;
}

export function CardList({
  cards,
  category,
  myCards,
  favorites,
  onToggleOwn,
  onToggleFavorite,
  isLoading,
  hasSearched = false,
}: CardListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card bg-base-100 shadow-lg mx-2 sm:mx-0">
            <div className="card-body p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-5 sm:h-6 bg-base-300 rounded w-1/2 sm:w-1/3 mb-4"></div>
                <div className="h-6 sm:h-8 bg-base-300 rounded w-1/3 sm:w-1/4 mb-3"></div>
                <div className="h-3 sm:h-4 bg-base-300 rounded w-5/6 sm:w-3/4 mb-2"></div>
                <div className="h-3 sm:h-4 bg-base-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    if (!hasSearched) {
      // 初始狀態 - 還沒搜尋
      return (
        <div className="text-center py-12 sm:py-16 px-6">
          <div className="text-5xl sm:text-6xl mb-6">💳</div>
          <p className="text-xl sm:text-2xl text-base-content/70 font-medium mb-3">
            開始搜尋信用卡優惠
          </p>
          <p className="text-sm sm:text-base text-base-content/50 max-w-md mx-auto">
            {SEARCH_PLACEHOLDER}
          </p>
        </div>
      );
    } else {
      // 搜尋後沒找到結果
      return (
        <div className="text-center py-12 sm:py-16 px-6">
          <div className="text-5xl sm:text-6xl mb-6">🔍</div>
          <p className="text-xl sm:text-2xl text-base-content/70 font-medium mb-3">
            沒有找到相關的信用卡
          </p>
          <p className="text-sm sm:text-base text-base-content/50 max-w-md mx-auto">
            試試搜尋「Uber Eats」或「外送」
          </p>
        </div>
      );
    }
  }

  const sortedCards = [...cards].sort((a, b) => {
    const aIsMine = myCards.includes(a.id) ? 1 : 0;
    const bIsMine = myCards.includes(b.id) ? 1 : 0;

    if (aIsMine !== bIsMine) {
      return bIsMine - aIsMine;
    }

    // 如果沒有類別，按卡片的最高回饋率排序
    if (!category) {
      const aMaxRate = Math.max(
        ...a.benefits.map((benefit) => benefit.maxRate)
      );
      const bMaxRate = Math.max(
        ...b.benefits.map((benefit) => benefit.maxRate)
      );
      return bMaxRate - aMaxRate;
    }

    const aBenefit = a.benefits.find(
      (benefit) => benefit.category === category
    );
    const bBenefit = b.benefits.find(
      (benefit) => benefit.category === category
    );
    const aRate = aBenefit?.maxRate || 0;
    const bRate = bBenefit?.maxRate || 0;
    return bRate - aRate;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm text-base-content/70 px-4 sm:px-0 gap-2 sm:gap-0">
        <span>找到 {cards.length} 張符合的信用卡</span>
        {myCards.length > 0 && (
          <span className="text-primary font-medium">
            我的卡片：{myCards.length} 張
          </span>
        )}
      </div>

      {sortedCards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          category={category}
          isOwned={myCards.includes(card.id)}
          isFavorite={favorites.includes(card.id)}
          onToggleOwn={onToggleOwn}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

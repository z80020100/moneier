import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { SearchBar } from '../components/SearchBar';
import { CardList } from '../components/CardList';
import type { CreditCard } from '../types';
import cardsData from '../data/cards.json';
import merchantsData from '../data/merchants.json';
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
const merchantCategories: {
  [category: string]: { keywords: string[]; description: string };
} = merchantsData;

interface SearchPageProps {
  myCards: string[];
  favorites: string[];
  onToggleOwn: (cardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
}

export function SearchPage({
  myCards,
  favorites,
  onToggleOwn,
  onToggleFavorite,
}: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined
  );
  const [filteredCards, setFilteredCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  // 卡片和電子支付的模糊搜尋
  const cardFuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ['name', 'bank', 'provider'],
        threshold: 0.4,
      }),
    []
  );

  // 商家和類別的模糊搜尋
  const merchantFuse = useMemo(() => {
    const searchableItems = Object.entries(merchantCategories).flatMap(
      ([category, data]) =>
        data.keywords.map((keyword) => ({ keyword, category }))
    );

    return new Fuse(searchableItems, {
      keys: ['keyword'],
      threshold: 0.3,
    });
  }, []);

  const handleSearch = (searchTerm: string) => {
    setIsLoading(true);
    setQuery(searchTerm);
    setHasSearched(true);

    setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredCards([]);
        setActiveCategory(undefined);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      const uniqueCards = new Map<string, CreditCard>();
      let detectedCategory: string | undefined;

      // 1. 先搜尋卡片名稱和銀行（優先）
      const cardResults = cardFuse.search(searchTerm);
      const hasDirectMatch = cardResults.length > 0;

      cardResults.forEach((result) => {
        uniqueCards.set(result.item.id, result.item);
      });

      // 2. 搜尋商家/類別名稱（只有在沒有直接匹配時才設定 activeCategory）
      const merchantResults = merchantFuse.search(searchTerm);
      const matchedCategories = new Set<string>();

      merchantResults.forEach((result) => {
        const category = result.item.category;
        matchedCategories.add(category);
        if (!detectedCategory && !hasDirectMatch) {
          detectedCategory = category;
        }
      });

      // 根據匹配的類別篩選卡片和電子支付
      if (matchedCategories.size > 0) {
        allItems.forEach((item) => {
          const hasMatchingBenefit = item.benefits.some((benefit) =>
            Array.from(matchedCategories).includes(benefit.category)
          );
          if (hasMatchingBenefit) {
            uniqueCards.set(item.id, item);
          }
        });
      }

      // 如果完全沒有結果，嘗試完全匹配類別名稱
      if (uniqueCards.size === 0) {
        const categories = Object.keys(merchantCategories);

        categories.forEach((category) => {
          // 只做完全匹配，避免「銀行」匹配到「餐飲」
          if (category === searchTerm) {
            allItems.forEach((item) => {
              const hasCategory = item.benefits.some(
                (benefit) => benefit.category === category
              );
              if (hasCategory) {
                uniqueCards.set(item.id, item);
                detectedCategory = category;
              }
            });
          }
        });
      }

      setFilteredCards(Array.from(uniqueCards.values()));
      setActiveCategory(detectedCategory);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <SearchBar onSearch={handleSearch} query={query} />
      </div>

      {hasSearched && filteredCards.length > 0 && (
        <div className="flex justify-end mb-4 px-4 sm:px-0">
          <label className="label cursor-pointer gap-2">
            <span className="label-text text-sm">顯示已過期活動</span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
            />
          </label>
        </div>
      )}

      <CardList
        cards={filteredCards}
        category={activeCategory}
        myCards={myCards}
        favorites={favorites}
        onToggleOwn={onToggleOwn}
        onToggleFavorite={onToggleFavorite}
        isLoading={isLoading}
        hasSearched={hasSearched}
        showExpired={showExpired}
      />
    </div>
  );
}

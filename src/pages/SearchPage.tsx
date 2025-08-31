import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { SearchBar } from '../components/SearchBar';
import { CardList } from '../components/CardList';
import type { CreditCard } from '../types';
import cardsData from '../data/cards.json';
import merchantsData from '../data/merchants.json';

const allCards: CreditCard[] = cardsData.cards as CreditCard[];
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

  // 卡片的模糊搜尋
  const cardFuse = useMemo(
    () =>
      new Fuse(allCards, {
        keys: ['name', 'bank'],
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

      // 1. 搜尋商家/類別名稱
      const merchantResults = merchantFuse.search(searchTerm);
      const matchedCategories = new Set<string>();

      merchantResults.forEach((result) => {
        const category = result.item.category;
        matchedCategories.add(category);
        if (!detectedCategory) {
          detectedCategory = category;
        }
      });

      // 根據匹配的類別篩選卡片
      if (matchedCategories.size > 0) {
        allCards.forEach((card) => {
          const hasMatchingBenefit = card.benefits.some((benefit) =>
            Array.from(matchedCategories).includes(benefit.category)
          );
          if (hasMatchingBenefit) {
            uniqueCards.set(card.id, card);
          }
        });
      }

      // 2. 搜尋卡片名稱和銀行
      const cardResults = cardFuse.search(searchTerm);
      cardResults.forEach((result) => {
        uniqueCards.set(result.item.id, result.item);
      });

      // 如果完全沒有結果，嘗試完全匹配類別名稱
      if (uniqueCards.size === 0) {
        const categories = Object.keys(merchantCategories);

        categories.forEach((category) => {
          // 只做完全匹配，避免「銀行」匹配到「餐飲」
          if (category === searchTerm) {
            allCards.forEach((card) => {
              const hasCategory = card.benefits.some(
                (benefit) => benefit.category === category
              );
              if (hasCategory) {
                uniqueCards.set(card.id, card);
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

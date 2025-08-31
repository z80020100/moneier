import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { SearchBar } from './components/SearchBar';
import { CardList } from './components/CardList';
import { storage } from './services/storage';
import type { CreditCard } from './types';
import './index.css';

// 直接匯入 JSON 資料
import cardsData from './data/cards.json';
import merchantsData from './data/merchants.json';

const allCards: CreditCard[] = cardsData.cards as CreditCard[];
const merchantCategories: {
  [category: string]: { keywords: string[]; description: string };
} = merchantsData;

function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined
  );
  const [filteredCards, setFilteredCards] = useState<CreditCard[]>([]);
  const [myCards, setMyCards] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // 初始載入資料
  useEffect(() => {
    setFilteredCards([]); // 初始不顯示任何卡片
    setMyCards(storage.getMyCards());
    setFavorites(storage.getFavorites());
    setIsLoading(false);
  }, []);

  const handleSearch = (searchTerm: string) => {
    setIsLoading(true);
    setQuery(searchTerm);
    setHasSearched(true);
    storage.addSearch(searchTerm);

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

  const handleToggleOwn = (cardId: string) => {
    storage.toggleMyCard(cardId);
    setMyCards(storage.getMyCards());
  };

  const handleToggleFavorite = (cardId: string) => {
    storage.toggleFavorite(cardId);
    setFavorites(storage.getFavorites());
  };

  return (
    <div className="min-h-screen bg-base-200 sm:bg-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <header className="text-center py-6 sm:py-8 mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
            Moneier
          </h1>
          <p className="text-base sm:text-lg text-base-content/70 mt-2">
            信用卡優惠查詢
          </p>
        </header>

        <main>
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
            onToggleOwn={handleToggleOwn}
            onToggleFavorite={handleToggleFavorite}
            isLoading={isLoading}
            hasSearched={hasSearched}
            showExpired={showExpired}
          />
        </main>

        <footer className="text-center mt-8 sm:mt-12 py-6 text-xs sm:text-sm text-base-content/50 px-4">
          <p>資料僅供參考，請以銀行公告為準。</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { SearchBar } from '../components/SearchBar';
import { CardList } from '../components/CardList';
import type { CreditCard } from '../types';
import cardsData from '../data/cards.json';
import merchantsData from '../data/merchants.json';
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
  const [selectedTypes, setSelectedTypes] = useState<
    Set<'credit' | 'debit' | 'mobile' | 'eticket'>
  >(new Set(['credit', 'debit', 'mobile', 'eticket'])); // 預設全選

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

      let finalCards = Array.from(uniqueCards.values());

      // 根據選擇的類型篩選（多選）
      if (selectedTypes.size > 0 && selectedTypes.size < 4) {
        // 如果不是全選
        finalCards = finalCards.filter((card) => {
          return selectedTypes.has(card.cardType || 'credit');
        });
      }

      setFilteredCards(finalCards);
      setActiveCategory(detectedCategory);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <SearchBar onSearch={handleSearch} query={query} />

        {/* 卡片類型選擇 */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          <button
            className={`btn btn-sm sm:btn-md transition-all duration-200 ${
              selectedTypes.size === 4
                ? 'btn-primary hover:btn-primary hover:shadow-lg hover:-translate-y-0.5 hover:scale-105'
                : 'btn-outline btn-primary hover:btn-outline hover:border-primary hover:text-primary hover:bg-transparent hover:shadow-md hover:-translate-y-0.5 hover:scale-105'
            }`}
            onClick={() => {
              if (selectedTypes.size === 4) {
                setSelectedTypes(new Set()); // 清空
              } else {
                setSelectedTypes(
                  new Set(['credit', 'debit', 'mobile', 'eticket'])
                ); // 全選
              }
              if (hasSearched) handleSearch(query);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">🎯</span>
              <span>全部</span>
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
              } else {
                newTypes.add('credit');
              }
              setSelectedTypes(newTypes);
              if (hasSearched) handleSearch(query);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">💳</span>
              <span>信用卡</span>
            </span>
          </button>
          <button
            className={`btn btn-sm sm:btn-md transition-all duration-200 ${
              selectedTypes.has('debit')
                ? 'btn-warning hover:btn-warning hover:shadow-lg hover:-translate-y-0.5 hover:scale-105'
                : 'btn-outline btn-warning hover:btn-outline hover:border-warning hover:text-warning hover:bg-transparent hover:shadow-md hover:-translate-y-0.5 hover:scale-105'
            }`}
            onClick={() => {
              const newTypes = new Set(selectedTypes);
              if (selectedTypes.has('debit')) {
                newTypes.delete('debit');
              } else {
                newTypes.add('debit');
              }
              setSelectedTypes(newTypes);
              if (hasSearched) handleSearch(query);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">🏛️</span>
              <span>簽帳金融卡</span>
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
              if (hasSearched) handleSearch(query);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">📱</span>
              <span>行動支付</span>
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
              if (hasSearched) handleSearch(query);
            }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">🎫</span>
              <span>電子票證</span>
            </span>
          </button>
        </div>
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

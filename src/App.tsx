import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SearchPage } from './pages/SearchPage';
import { AllCardsPage } from './pages/AllCardsPage';
import { MyCardsPage } from './pages/MyCardsPage';
import { storage } from './services/storage';
import cardsData from './data/cards.json';
import paymentsData from './data/payments.json';
import './index.css';

// 處理信用卡和簽帳金融卡
const allCards = cardsData.cards.map((card) => {
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
const allPayments = paymentsData.payments.map((payment) => {
  // 判斷是行動支付還是電子票證
  const isETicket = ['easycard', 'ipass', 'icash-pay'].includes(payment.id);
  const cardType = isETicket ? 'eticket' : 'mobile';

  return {
    ...payment,
    isPayment: true,
    paymentType: isETicket ? 'eticket' : 'mobile',
    cardType,
  };
});

const allItems = [...allCards, ...allPayments];

// 統計資訊
const totalBenefits = allItems.reduce(
  (sum, item) => sum + item.benefits.length,
  0
);
const lastUpdateDate = new Date()
  .toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  .replace(/\//g, '-');

function App() {
  const [myCards, setMyCards] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // 初始載入資料
  useEffect(() => {
    setMyCards(storage.getMyCards());
    setFavorites(storage.getFavorites());
  }, []);

  const handleToggleOwn = (cardId: string) => {
    storage.toggleMyCard(cardId);
    setMyCards(storage.getMyCards());
  };

  const handleToggleFavorite = (cardId: string) => {
    storage.toggleFavorite(cardId);
    setFavorites(storage.getFavorites());
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 sm:bg-base-100">
        <Navbar />

        <header className="bg-gradient-to-b from-base-100 to-base-100/80 shadow-sm border-b border-base-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 sm:py-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-2 lg:p-3 border border-primary/20">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-lg lg:text-xl">💳</span>
                    <div className="text-center lg:text-left">
                      <div className="text-lg lg:text-xl font-bold text-primary">
                        {allItems.length}
                      </div>
                      <div className="text-xs text-base-content/60">種方案</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-2 lg:p-3 border border-success/20">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-lg lg:text-xl">👤</span>
                    <div className="text-center lg:text-left">
                      <div className="text-lg lg:text-xl font-bold text-success">
                        {myCards.length}
                      </div>
                      <div className="text-xs text-base-content/60">
                        我的收藏
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg p-2 lg:p-3 border border-warning/20">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-lg lg:text-xl">🎁</span>
                    <div className="text-center lg:text-left">
                      <div className="text-lg lg:text-xl font-bold text-warning">
                        {totalBenefits}
                      </div>
                      <div className="text-xs text-base-content/60">項回饋</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-lg p-2 lg:p-3 border border-info/20">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-lg lg:text-xl">📅</span>
                    <div className="text-center lg:text-left">
                      <div className="text-lg lg:text-xl font-bold text-info">
                        {lastUpdateDate.slice(5)}
                      </div>
                      <div className="text-xs text-base-content/60">
                        最後更新
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
          <main className="py-6">
            <Routes>
              <Route
                path="/"
                element={
                  <SearchPage
                    myCards={myCards}
                    favorites={favorites}
                    onToggleOwn={handleToggleOwn}
                    onToggleFavorite={handleToggleFavorite}
                  />
                }
              />
              <Route
                path="/all-cards"
                element={
                  <AllCardsPage
                    myCards={myCards}
                    favorites={favorites}
                    onToggleOwn={handleToggleOwn}
                    onToggleFavorite={handleToggleFavorite}
                  />
                }
              />
              <Route
                path="/my-cards"
                element={
                  <MyCardsPage
                    myCards={myCards}
                    favorites={favorites}
                    onToggleOwn={handleToggleOwn}
                    onToggleFavorite={handleToggleFavorite}
                  />
                }
              />
            </Routes>
          </main>

          <footer className="text-center mt-8 sm:mt-12 py-6 text-xs sm:text-sm text-base-content/50 px-4">
            <p>💡 資料僅供參考，實際優惠請以各機構官方公告為準</p>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

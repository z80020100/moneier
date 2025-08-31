export const storage = {
  getMyCards(): string[] {
    const saved = localStorage.getItem('myCards');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse myCards from localStorage', e);
      return [];
    }
  },

  setMyCards(cardIds: string[]) {
    localStorage.setItem('myCards', JSON.stringify(cardIds));
  },

  toggleMyCard(cardId: string): boolean {
    const myCards = this.getMyCards();
    const index = myCards.indexOf(cardId);

    if (index > -1) {
      myCards.splice(index, 1);
      this.setMyCards(myCards);
      return false;
    } else {
      myCards.push(cardId);
      this.setMyCards(myCards);
      return true;
    }
  },

  getFavorites(): string[] {
    const saved = localStorage.getItem('favoriteCards');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse favoriteCards from localStorage', e);
      return [];
    }
  },

  toggleFavorite(cardId: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(cardId);

    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem('favoriteCards', JSON.stringify(favorites));
      return false;
    } else {
      favorites.push(cardId);
      localStorage.setItem('favoriteCards', JSON.stringify(favorites));
      return true;
    }
  },

  getLastSearches(): string[] {
    const saved = localStorage.getItem('lastSearches');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse lastSearches from localStorage', e);
      return [];
    }
  },

  addSearch(query: string) {
    if (!query.trim()) return;

    const searches = this.getLastSearches();
    const filtered = searches.filter((s) => s !== query);
    const updated = [query, ...filtered].slice(0, 5); // 保留最近5次搜尋

    localStorage.setItem('lastSearches', JSON.stringify(updated));
  },
};

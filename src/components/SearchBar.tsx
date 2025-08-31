import { useState, useEffect } from 'react';
import { SEARCH_PLACEHOLDER, QUICK_SEARCH_ITEMS } from '../constants';

interface SearchBarProps {
  onSearch: (query: string) => void;
  query: string;
}

export function SearchBar({ onSearch, query }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(query);
  const [showError, setShowError] = useState(false);

  // 同步外部 query 到內部 inputValue
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    setShowError(false);
    onSearch(trimmedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (showError) {
      setShowError(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setShowError(false);
    onSearch('');
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-0">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="form-control">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={SEARCH_PLACEHOLDER}
                className={`input input-bordered w-full h-12 sm:h-14 text-base sm:text-lg pr-12 ${showError ? 'input-error' : ''}`}
                value={inputValue}
                onChange={handleInputChange}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
              />
              {inputValue && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  onClick={handleClear}
                  title="清除搜尋"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary h-12 sm:h-14 px-6 sm:px-8 text-lg"
            >
              <span className="sm:hidden">🔍 搜尋</span>
              <span className="hidden sm:inline">🔍</span>
            </button>
          </div>

          {/* 錯誤提示 */}
          {showError && (
            <div className="text-error text-sm mt-2 px-1">請輸入搜尋關鍵字</div>
          )}
        </form>

        {/* 快速搜尋按鈕 */}
        {!query && (
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {QUICK_SEARCH_ITEMS.map((item) => (
              <button
                key={item}
                className="btn btn-outline btn-sm sm:btn-md h-10 px-4 text-sm sm:text-base"
                onClick={() => {
                  setInputValue(item);
                  setShowError(false);
                  onSearch(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

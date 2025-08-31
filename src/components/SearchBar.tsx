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
      <div className="w-full max-w-2xl lg:max-w-4xl">
        <form onSubmit={handleSubmit} className="form-control">
          <div className="relative">
            <input
              type="text"
              placeholder={SEARCH_PLACEHOLDER}
              className={`input input-bordered input-lg w-full pr-32 text-base lg:text-lg shadow-lg focus:shadow-xl transition-all duration-200 ${showError ? 'input-error' : ''}`}
              value={inputValue}
              onChange={handleInputChange}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
            />
            <div className="absolute right-1 top-1 bottom-1 flex gap-1">
              {inputValue && (
                <button
                  type="button"
                  className="btn btn-ghost btn-circle"
                  onClick={handleClear}
                  title="清除搜尋"
                >
                  ✕
                </button>
              )}
              <button type="submit" className="btn btn-primary px-6 lg:px-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 lg:mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="hidden lg:inline">搜尋</span>
              </button>
            </div>
          </div>

          {/* 錯誤提示 */}
          {showError && (
            <div className="text-error text-sm mt-2 px-1 animate-pulse">
              請輸入搜尋關鍵字
            </div>
          )}
        </form>

        {/* 快速搜尋按鈕 */}
        {!query && (
          <div className="mt-6">
            <div className="text-sm text-base-content/60 text-center mb-3 hidden lg:block">
              熱門搜尋
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3 justify-center">
              {QUICK_SEARCH_ITEMS.map((item) => (
                <button
                  key={item}
                  className="btn btn-outline btn-sm lg:btn-md hover:btn-primary transition-all duration-200 shadow-sm hover:shadow-md"
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
          </div>
        )}
      </div>
    </div>
  );
}

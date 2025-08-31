import { useState } from 'react';
import type { CreditCard, Benefit } from '../types';

interface CardItemProps {
  card: CreditCard;
  category?: string;
  isOwned?: boolean;
  isFavorite?: boolean;
  onToggleOwn: (cardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
  showExpired?: boolean;
}

export function CardItem({
  card,
  category,
  isOwned,
  isFavorite,
  onToggleOwn,
  onToggleFavorite,
  showExpired = false,
}: CardItemProps) {
  const [conditionStatus, setConditionStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const isExpired = (benefit: Benefit) => {
    if (!benefit.validTo) return false;
    return new Date(benefit.validTo) < new Date();
  };

  const relevantBenefits = category
    ? card.benefits.filter((benefit) => benefit.category === category)
    : card.benefits;

  const filteredBenefits = showExpired
    ? relevantBenefits
    : relevantBenefits.filter((benefit) => !isExpired(benefit));

  const calculateActualRate = (benefit: Benefit) => {
    const requiredConditions = benefit.conditions.filter((c) => c.required);
    const optionalConditions = benefit.conditions.filter((c) => !c.required);

    const allRequiredMet = requiredConditions.every(
      (condition) => conditionStatus[condition.id] === true
    );

    if (!allRequiredMet) {
      return benefit.baseRate;
    }

    const metOptionalConditions = optionalConditions.filter(
      (condition) => conditionStatus[condition.id] === true
    ).length;

    const progressRatio =
      benefit.conditions.length > 0
        ? (requiredConditions.length + metOptionalConditions) /
          benefit.conditions.length
        : 1;

    return (
      benefit.baseRate + (benefit.maxRate - benefit.baseRate) * progressRatio
    );
  };

  const getConditionProgress = (benefit: Benefit) => {
    const requiredConditions = benefit.conditions.filter((c) => c.required);
    const optionalConditions = benefit.conditions.filter((c) => !c.required);

    const metRequiredCount = requiredConditions.filter(
      (condition) => conditionStatus[condition.id] === true
    ).length;

    const metOptionalCount = optionalConditions.filter(
      (condition) => conditionStatus[condition.id] === true
    ).length;

    const totalMet = metRequiredCount + metOptionalCount;
    const totalConditions = benefit.conditions.length;

    return {
      metRequiredCount,
      requiredCount: requiredConditions.length,
      metOptionalCount,
      optionalCount: optionalConditions.length,
      totalMet,
      totalConditions,
      progressPercentage:
        totalConditions > 0 ? (totalMet / totalConditions) * 100 : 100,
      allRequiredMet: metRequiredCount === requiredConditions.length,
    };
  };

  const getRateColor = (rate: number) => {
    if (rate >= 8) return 'text-error';
    if (rate >= 5) return 'text-warning';
    if (rate >= 3) return 'text-success';
    return 'text-info';
  };

  const handleConditionChange = (conditionId: string, checked: boolean) => {
    setConditionStatus((prev) => ({
      ...prev,
      [conditionId]: checked,
    }));
  };

  if (filteredBenefits.length === 0) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-shadow mx-2 sm:mx-0">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="card-title text-lg sm:text-xl mb-2">
                <span className="text-base sm:text-lg">{card.bank}</span>
                <span className="text-primary font-bold">{card.name}</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {isOwned && (
                  <span className="badge badge-success text-xs">✓ 我的卡</span>
                )}
                {!card.isActive && (
                  <span className="badge badge-ghost text-xs">停發</span>
                )}
              </div>
            </div>

            <button
              className={`btn btn-circle min-h-10 h-10 w-10 ml-3 ${isFavorite ? 'btn-warning' : 'btn-ghost hover:btn-warning'}`}
              onClick={() => onToggleFavorite(card.id)}
              title={isFavorite ? '取消收藏' : '加入收藏'}
            >
              <span className="text-lg">{isFavorite ? '★' : '☆'}</span>
            </button>
          </div>

          <div className="flex justify-end">
            <button
              className={`btn min-h-9 h-9 px-4 text-sm ${
                isOwned
                  ? 'btn-outline btn-success hover:btn-success'
                  : 'btn-accent hover:btn-accent-focus'
              }`}
              onClick={() => onToggleOwn(card.id)}
            >
              {isOwned ? '✓ 已擁有' : '+ 我有此卡'}
            </button>
          </div>
        </div>

        {filteredBenefits.map((benefit, index) => {
          const actualRate = calculateActualRate(benefit);
          const expired = isExpired(benefit);
          const progress = getConditionProgress(benefit);
          const hasMultipleConditions = benefit.conditions.length > 1;

          return (
            <div
              key={index}
              className={`pb-6 mb-6 last:mb-0 last:pb-0 border-b border-base-300 last:border-b-0 ${
                expired
                  ? 'relative bg-base-200/50 rounded-lg p-4 border-2 border-dashed border-base-300/60'
                  : ''
              }`}
            >
              {expired && (
                <div className="absolute -top-2 -right-2 bg-error text-error-content px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 rotate-12">
                  ❌ 已過期
                </div>
              )}

              <div
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 ${expired ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span
                    className={`badge badge-lg ${expired ? 'badge-ghost' : 'badge-primary'}`}
                  >
                    {benefit.category}
                  </span>
                  <div
                    className={`text-2xl sm:text-3xl font-bold ${expired ? 'text-base-content/40 line-through' : getRateColor(actualRate)}`}
                  >
                    {actualRate.toFixed(1)}% 回饋
                  </div>
                  <div
                    className={`text-base sm:text-lg font-semibold ${expired ? 'text-base-content/40' : 'text-base-content/80'}`}
                  >
                    (最高 {benefit.maxRate}%)
                  </div>
                </div>
              </div>

              {/* 優惠說明 - 主要內容 */}
              {benefit.notes && (
                <div
                  className={`${
                    expired
                      ? 'bg-base-300/30 border-2 border-base-300/50 opacity-50'
                      : 'bg-gradient-to-r from-primary/15 to-primary/5 border-2 border-primary/50'
                  } rounded-2xl p-5 mb-6 shadow-sm`}
                >
                  <div
                    className={`text-lg sm:text-xl font-semibold leading-relaxed ${
                      expired ? 'text-base-content/50' : 'text-base-content'
                    }`}
                  >
                    {benefit.notes}
                    {expired && (
                      <span className="ml-2 text-xs opacity-75">
                        （此優惠已過期）
                      </span>
                    )}
                  </div>
                  {benefit.referenceUrl && (
                    <div className="mt-3 flex justify-end">
                      <a
                        href={benefit.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                          expired
                            ? 'bg-base-300/50 text-base-content/40 cursor-not-allowed'
                            : 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-focus'
                        }`}
                        onClick={
                          expired ? (e) => e.preventDefault() : undefined
                        }
                      >
                        <span>活動頁面</span>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* 條件進度條 */}
              {benefit.conditions.length > 0 && !expired && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-base-content/80">
                      達成進度
                    </div>
                    <div className="text-sm text-base-content/60">
                      {progress.totalMet} / {progress.totalConditions} 條件
                    </div>
                  </div>

                  {/* 進度條 */}
                  <div className="w-full bg-base-300 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        progress.allRequiredMet
                          ? progress.progressPercentage === 100
                            ? 'bg-success'
                            : 'bg-warning'
                          : 'bg-error/60'
                      }`}
                      style={{ width: `${progress.progressPercentage}%` }}
                    ></div>
                  </div>

                  {/* 詳細進度說明 */}
                  <div className="flex justify-between text-xs text-base-content/60">
                    <div>
                      必要條件: {progress.metRequiredCount}/
                      {progress.requiredCount}
                      {!progress.allRequiredMet && (
                        <span className="text-error ml-1">⚠</span>
                      )}
                    </div>
                    {progress.optionalCount > 0 && (
                      <div>
                        加分條件: {progress.metOptionalCount}/
                        {progress.optionalCount}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {benefit.validTo && (
                <div className="text-sm text-base-content/80 mb-3 p-3 bg-info/20 border border-info/30 rounded-lg">
                  <div className="flex items-center gap-2 font-medium">
                    📅 活動期間
                    {expired && (
                      <span className="badge badge-error badge-sm">已過期</span>
                    )}
                  </div>
                  <div className="mt-1 text-base-content/70">
                    {benefit.validFrom || '即日起'} ~ {benefit.validTo}
                  </div>
                </div>
              )}

              {benefit.monthlyLimit && (
                <div className="text-sm text-base-content/80 mb-4 p-3 bg-warning/20 border border-warning/30 rounded-lg">
                  <div className="font-medium">💰 每月上限</div>
                  <div className="mt-1 text-base-content/70">
                    {benefit.monthlyLimit} 元
                  </div>
                </div>
              )}

              {benefit.conditions.length > 0 && (
                <div
                  className={`${expired ? 'bg-base-300/30 opacity-50' : 'bg-base-200'} rounded-lg p-3 sm:p-4`}
                >
                  <h4
                    className={`font-medium mb-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 ${expired ? 'text-base-content/50' : ''}`}
                  >
                    <span>達成條件:{expired && ' （已過期）'}</span>
                    {hasMultipleConditions && !expired && (
                      <div className="text-xs text-base-content/60">
                        勾選條件看實際回饋率
                      </div>
                    )}
                    {expired && (
                      <div className="text-xs text-error/60">此活動已結束</div>
                    )}
                  </h4>
                  <div className="space-y-3">
                    {benefit.conditions.map((condition) => {
                      const isChecked = conditionStatus[condition.id] || false;
                      return (
                        <label
                          key={condition.id}
                          className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg transition-colors ${
                            expired
                              ? 'cursor-not-allowed opacity-60 bg-base-300/20'
                              : `cursor-pointer touch-manipulation ${
                                  isChecked
                                    ? 'bg-success/10 border border-success/30'
                                    : 'hover:bg-base-300/50 active:bg-base-300/70'
                                }`
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm sm:checkbox-md mt-1"
                            checked={isChecked}
                            onChange={(e) =>
                              handleConditionChange(
                                condition.id,
                                e.target.checked
                              )
                            }
                            disabled={expired}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="flex-1">
                                {condition.description}
                              </span>
                              {condition.required ? (
                                <span className="badge badge-error badge-xs self-start">
                                  必要
                                </span>
                              ) : (
                                <span className="badge badge-info badge-xs self-start">
                                  加分
                                </span>
                              )}
                            </div>
                            {condition.value && (
                              <div className="text-xs sm:text-sm text-base-content/60 mt-2">
                                {typeof condition.value === 'number'
                                  ? `${condition.value} 元`
                                  : condition.value}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {card.notes && (
          <div className="text-sm text-base-content/60 mt-2 pt-2 border-t">
            {card.notes}
          </div>
        )}
      </div>
    </div>
  );
}

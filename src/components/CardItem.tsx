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
    const conditions = benefit.conditions || [];
    const requiredConditions = conditions.filter((c) => c.required);
    const optionalConditions = conditions.filter((c) => !c.required);

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
      (benefit.conditions?.length || 0) > 0
        ? (requiredConditions.length + metOptionalConditions) /
          (benefit.conditions?.length || 0)
        : 1;

    return (
      benefit.baseRate + (benefit.maxRate - benefit.baseRate) * progressRatio
    );
  };

  const getConditionProgress = (benefit: Benefit) => {
    const conditions = benefit.conditions || [];
    const requiredConditions = conditions.filter((c) => c.required);
    const optionalConditions = conditions.filter((c) => !c.required);

    const metRequiredCount = requiredConditions.filter(
      (condition) => conditionStatus[condition.id] === true
    ).length;

    const metOptionalCount = optionalConditions.filter(
      (condition) => conditionStatus[condition.id] === true
    ).length;

    const totalMet = metRequiredCount + metOptionalCount;
    const totalConditions = benefit.conditions?.length || 0;

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
        {/* Header區域：標題 + 按鈕的垂直佈局 */}
        <div className="mb-4">
          <h2 className="card-title text-lg sm:text-xl">
            <span className="text-base sm:text-lg">
              {card.cardType === 'credit' && (
                <span className="badge badge-info badge-sm mr-1">
                  💳 信用卡
                </span>
              )}
              {card.cardType === 'debit' && (
                <span className="badge badge-warning badge-sm mr-1">
                  🏛️ 簽帳金融卡
                </span>
              )}
              {card.cardType === 'mobile' && (
                <span className="badge badge-secondary badge-sm mr-1">
                  行動支付
                </span>
              )}
              {card.cardType === 'eticket' && (
                <span className="badge badge-accent badge-sm mr-1">
                  電子票證
                </span>
              )}
              {card.bank}
            </span>
            {card.officialUrl ? (
              <a
                href={card.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:text-primary-focus transition-colors inline-flex items-center gap-1"
              >
                <span>{card.name}</span>
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
            ) : (
              <span className="text-primary font-bold">{card.name}</span>
            )}
          </h2>

          {card.previousNames && card.previousNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2 mb-2">
              <svg
                className="w-3 h-3 text-base-content/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {card.previousNames.map((name, index) => (
                <span
                  key={index}
                  className="badge badge-ghost badge-sm text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex flex-wrap items-center gap-2">
              {!card.isActive && (
                <span className="badge badge-ghost text-xs">停發</span>
              )}
            </div>

            {/* 按鈕區域在標題下方 */}
            <div className="flex items-center gap-2">
              <button
                className={`btn btn-circle btn-sm min-h-8 h-8 w-8 transition-all duration-200 ${
                  isOwned
                    ? 'btn-success text-white hover:scale-110 shadow-md hover:shadow-lg'
                    : 'btn-outline btn-success hover:btn-success hover:text-white hover:scale-110 hover:shadow-md'
                }`}
                onClick={() => onToggleOwn(card.id)}
                title={
                  isOwned
                    ? card.isPayment
                      ? '取消已安裝'
                      : '取消已擁有'
                    : card.isPayment
                      ? '標記為已安裝'
                      : '標記為已擁有'
                }
              >
                {isOwned ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </button>

              <button
                className={`btn btn-circle btn-sm min-h-8 h-8 w-8 transition-all duration-200 ${
                  isFavorite
                    ? 'btn-warning text-white hover:scale-110 shadow-md hover:shadow-lg'
                    : 'btn-outline btn-warning hover:btn-warning hover:text-white hover:scale-110 hover:shadow-md'
                }`}
                onClick={() => onToggleFavorite(card.id)}
                title={isFavorite ? '取消收藏' : '加入收藏'}
              >
                {isFavorite ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {filteredBenefits.map((benefit, index) => {
          const actualRate = calculateActualRate(benefit);
          const expired = isExpired(benefit);
          const progress = getConditionProgress(benefit);
          const hasMultipleConditions = (benefit.conditions?.length || 0) > 1;

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
                    className={`badge ${expired ? 'badge-ghost' : 'badge-primary'} text-xs px-2 py-1`}
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
                    } flex items-center gap-2`}
                  >
                    <span>
                      {benefit.notes}
                      {expired && (
                        <span className="ml-2 text-xs opacity-75">
                          （此優惠已過期）
                        </span>
                      )}
                    </span>
                    {benefit.referenceUrl && (
                      <a
                        href={benefit.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center transition-colors ${
                          expired
                            ? 'text-base-content/40 cursor-not-allowed'
                            : 'text-primary hover:text-primary-focus'
                        }`}
                        onClick={
                          expired ? (e) => e.preventDefault() : undefined
                        }
                      >
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
                    )}
                  </div>
                </div>
              )}

              {/* 條件進度條 */}
              {(benefit.conditions?.length || 0) > 0 && !expired && (
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

              {(benefit.conditions?.length || 0) > 0 && (
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
                    {(benefit.conditions || []).map((condition) => {
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
                              <span className="flex-1 flex items-center gap-2">
                                {condition.description}
                                {condition.registrationUrl &&
                                  condition.type === 'registration' &&
                                  !expired && (
                                    <a
                                      href={condition.registrationUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-primary hover:text-primary-focus transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
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
                                  )}
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

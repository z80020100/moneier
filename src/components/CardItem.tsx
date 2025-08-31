import { useState } from 'react';
import type { CreditCard, Benefit } from '../types';

interface CardItemProps {
  card: CreditCard;
  category?: string;
  isOwned?: boolean;
  isFavorite?: boolean;
  onToggleOwn: (cardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
}

export function CardItem({
  card,
  category,
  isOwned,
  isFavorite,
  onToggleOwn,
  onToggleFavorite,
}: CardItemProps) {
  const [conditionStatus, setConditionStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const relevantBenefits = category
    ? card.benefits.filter((benefit) => benefit.category === category)
    : card.benefits;

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

  const isExpired = (benefit: Benefit) => {
    if (!benefit.validTo) return false;
    return new Date(benefit.validTo) < new Date();
  };

  if (relevantBenefits.length === 0) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-shadow mx-2 sm:mx-0">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
          <div className="flex-1">
            <h2 className="card-title text-lg sm:text-xl mb-2">
              <span className="text-base sm:text-lg">{card.bank}</span>
              <span className="text-primary font-bold">{card.name}</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {isOwned && (
                <span className="badge badge-primary text-xs">我的卡</span>
              )}
              {!card.isActive && (
                <span className="badge badge-ghost text-xs">停發</span>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 sm:ml-4 justify-end">
            <button
              className={`btn btn-sm sm:btn-md h-10 px-4 text-sm ${isOwned ? 'btn-ghost' : 'btn-primary'}`}
              onClick={() => onToggleOwn(card.id)}
            >
              {isOwned ? '移除' : '我有此卡'}
            </button>
            <button
              className={`btn btn-sm sm:btn-md btn-circle h-10 w-10 text-lg ${isFavorite ? 'btn-warning' : 'btn-ghost'}`}
              onClick={() => onToggleFavorite(card.id)}
              title={isFavorite ? '取消收藏' : '加入收藏'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>

        {relevantBenefits.map((benefit, index) => {
          const actualRate = calculateActualRate(benefit);
          const expired = isExpired(benefit);
          const progress = getConditionProgress(benefit);
          const hasMultipleConditions = benefit.conditions.length > 1;

          return (
            <div key={index} className="mb-6 last:mb-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="badge badge-lg badge-primary">
                    {benefit.category}
                  </span>
                  <div
                    className={`text-2xl sm:text-3xl font-bold ${getRateColor(actualRate)} ${expired ? 'opacity-50' : ''}`}
                  >
                    {actualRate.toFixed(1)}% 回饋
                  </div>
                  <div className="text-sm text-base-content/60">
                    (最高 {benefit.maxRate}%)
                  </div>
                </div>
                {expired && (
                  <div className="badge badge-error text-xs self-start sm:self-center">
                    已過期
                  </div>
                )}
              </div>

              {/* 條件進度條 - 只在有多個條件時顯示 */}
              {hasMultipleConditions && !expired && (
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
                <div className="text-sm text-base-content/60 mb-3 p-2 bg-info/10 rounded">
                  📅 活動期間: {benefit.validFrom || '即日起'} ~{' '}
                  {benefit.validTo}
                </div>
              )}

              {benefit.monthlyLimit && (
                <div className="text-sm text-base-content/60 mb-4 p-2 bg-warning/10 rounded">
                  💰 每月上限: {benefit.monthlyLimit} 元
                </div>
              )}

              {benefit.conditions.length > 0 && (
                <div className="bg-base-200 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>達成條件:</span>
                    {hasMultipleConditions && (
                      <div className="text-xs text-base-content/60">
                        勾選條件看實際回饋率
                      </div>
                    )}
                  </h4>
                  <div className="space-y-3">
                    {benefit.conditions.map((condition) => {
                      const isChecked = conditionStatus[condition.id] || false;
                      return (
                        <label
                          key={condition.id}
                          className={`flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-lg transition-colors touch-manipulation ${
                            isChecked
                              ? 'bg-success/10 border border-success/30'
                              : 'hover:bg-base-300/50 active:bg-base-300/70'
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

              {benefit.notes && (
                <div className="text-sm text-base-content/70 mt-3">
                  {benefit.notes}
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

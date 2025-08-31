export interface Condition {
  id: string;
  type:
    | 'registration'
    | 'payment_method'
    | 'min_amount'
    | 'platform'
    | 'merchant'
    | 'monthly_limit'
    | 'new_user'
    | 'other';
  description: string;
  required: boolean;
  value?: string | number;
}

export interface Benefit {
  category: string;
  baseRate: number;
  maxRate: number;
  conditions: Condition[];
  monthlyLimit?: number;
  validFrom?: string;
  validTo?: string;
  notes?: string;
  referenceUrl?: string;
}

export interface CreditCard {
  id: string;
  bank: string;
  name: string;
  benefits: Benefit[];
  notes?: string;
  isActive?: boolean;
}

export interface MerchantMapping {
  [merchant: string]: string;
}

export interface UserPreferences {
  myCards: string[];
  favoriteCards: string[];
  lastSearches: string[];
}

/**
 * TILEORA Centralized Currency System
 * 
 * Base Currency: INR (₹ - Indian Rupee)
 * All underlying product prices are stored in INR in the catalogue.
 * Conversions apply configurable benchmark exchange rates without mutating base data.
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  name: string;
  rateFromINR: number; // 1 INR in target currency
  decimals: number;
  locale: string;
  flagEmoji?: string;
}

/**
 * Standard benchmark conversion rates relative to 1 INR base.
 * Configured as realistic reference rates.
 */
export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    label: 'INR (₹)',
    name: 'Indian Rupee',
    rateFromINR: 1.0,
    decimals: 0,
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD ($)',
    name: 'US Dollar',
    rateFromINR: 0.012, // 1 INR ≈ $0.012 (~₹83.33/$)
    decimals: 2,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'EUR (€)',
    name: 'Euro',
    rateFromINR: 0.011, // 1 INR ≈ €0.011 (~₹90.91/€)
    decimals: 2,
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    label: 'GBP (£)',
    name: 'British Pound',
    rateFromINR: 0.0094, // 1 INR ≈ £0.0094 (~₹106.38/£)
    decimals: 2,
    locale: 'en-GB',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    label: 'JPY (¥)',
    name: 'Japanese Yen',
    rateFromINR: 1.85, // 1 INR ≈ ¥1.85 (~₹0.54/¥)
    decimals: 0,
    locale: 'ja-JP',
  },
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];
export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

/**
 * Converts a base INR amount to target currency without mutating the original value.
 */
export function convertFromINR(amountInINR: number, targetCurrency: CurrencyCode): number {
  if (isNaN(amountInINR)) return 0;
  const config = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.INR;
  const converted = amountInINR * config.rateFromINR;
  return converted;
}

/**
 * Formats a converted amount with appropriate symbol, separators, and decimal precision.
 */
export function formatCurrencyValue(convertedAmount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
  
  if (currency === 'INR') {
    // Standard Indian number formatting (e.g. ₹2,850)
    const formattedNum = Math.round(convertedAmount).toLocaleString('en-IN');
    return `${config.symbol}${formattedNum}`;
  }
  
  if (currency === 'JPY') {
    // JPY uses 0 decimals
    const formattedNum = Math.round(convertedAmount).toLocaleString('ja-JP');
    return `${config.symbol}${formattedNum}`;
  }

  // USD, EUR, GBP use 2 decimal places
  const formattedNum = convertedAmount.toLocaleString(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${config.symbol}${formattedNum}`;
}

/**
 * Complete centralized formatting utility: takes base amount in INR and returns formatted string in target currency.
 */
export function formatPrice(
  amountInINR: number,
  targetCurrency: CurrencyCode,
  options?: {
    unit?: string;
    showBaseNotice?: boolean;
  }
): string {
  const converted = convertFromINR(amountInINR, targetCurrency);
  const formatted = formatCurrencyValue(converted, targetCurrency);
  const unitStr = options?.unit ? ` ${options.unit}` : '';
  return `${formatted}${unitStr}`;
}

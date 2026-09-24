/**
 * Currency utility for AroundMe AI
 * Handles dynamic currency symbols based on restaurant location or active city.
 * Defaults to Nigerian Naira (₦) for Nigeria / Nigerian cities.
 */

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyConfig {
  symbol: string;
  code: CurrencyCode;
  name: string;
}

/**
 * Detect currency from a city/country string or coordinate range
 */
export function getCurrencyForLocation(
  cityOrAddress?: string,
  lat?: number,
  lng?: number
): CurrencyConfig {
  const text = (cityOrAddress || '').toLowerCase();

  // Nigerian detection (cities, states, country, or coordinate bounding box)
  const isNigeria =
    text.includes('nigeria') ||
    text.includes('benin') ||
    text.includes('edo') ||
    text.includes('lagos') ||
    text.includes('abuja') ||
    text.includes('fct') ||
    text.includes('port harcourt') ||
    text.includes('rivers') ||
    text.includes('akwa ibom') ||
    text.includes('uyo') ||
    text.includes('calabar') ||
    text.includes('ibadan') ||
    text.includes('oyo') ||
    text.includes('enugu') ||
    text.includes('delta') ||
    text.includes('warri') ||
    text.includes('asaba') ||
    text.includes('kano') ||
    text.includes('kaduna') ||
    text.includes('anambra') ||
    text.includes('imo') ||
    text.includes('owerri') ||
    (lat !== undefined && lng !== undefined && lat >= 4.0 && lat <= 14.0 && lng >= 2.5 && lng <= 15.0);

  if (isNigeria) {
    return {
      symbol: '₦',
      code: 'NGN',
      name: 'Nigerian Naira',
    };
  }

  // UK
  if (text.includes('london') || text.includes('uk') || text.includes('united kingdom') || text.includes('england')) {
    return {
      symbol: '£',
      code: 'GBP',
      name: 'British Pound',
    };
  }

  // Europe (Eurozone)
  if (
    text.includes('france') ||
    text.includes('paris') ||
    text.includes('germany') ||
    text.includes('berlin') ||
    text.includes('italy') ||
    text.includes('rome') ||
    text.includes('spain') ||
    text.includes('madrid') ||
    text.includes('amsterdam')
  ) {
    return {
      symbol: '€',
      code: 'EUR',
      name: 'Euro',
    };
  }

  // US / New York / Default Dollar Zone
  if (
    text.includes('usa') ||
    text.includes('united states') ||
    text.includes('new york') ||
    text.includes('ny') ||
    text.includes('california') ||
    text.includes('san francisco') ||
    text.includes('dollar')
  ) {
    return {
      symbol: '$',
      code: 'USD',
      name: 'US Dollar',
    };
  }

  // Default to Naira for Nigeria
  return {
    symbol: '₦',
    code: 'NGN',
    name: 'Nigerian Naira',
  };
}

/**
 * Format a price level (1 to 4) into its appropriate currency tier
 * e.g., level 1 in Nigeria -> '₦'
 *       level 2 in Nigeria -> '₦₦'
 *       level 1 in New York -> '$'
 */
export function formatPriceTier(
  priceLevel: number,
  cityOrAddress?: string,
  lat?: number,
  lng?: number
): string {
  const currency = getCurrencyForLocation(cityOrAddress, lat, lng);
  const count = Math.max(1, Math.min(4, Math.round(priceLevel || 2)));
  return currency.symbol.repeat(count);
}

/**
 * Replace any hardcoded '$' in legacy priceText strings with the appropriate symbol
 */
export function sanitizePriceText(
  priceText?: string,
  priceLevel: number = 2,
  cityOrAddress?: string,
  lat?: number,
  lng?: number
): string {
  const currency = getCurrencyForLocation(cityOrAddress, lat, lng);
  if (!priceText) {
    return formatPriceTier(priceLevel, cityOrAddress, lat, lng);
  }

  // If priceText is made of '$' symbols, convert to the localized currency symbol
  if (/^\$+$/.test(priceText.trim())) {
    return currency.symbol.repeat(priceText.trim().length);
  }

  // If it already has currency symbols
  if (priceText.includes('$') && currency.symbol !== '$') {
    return priceText.replace(/\$/g, currency.symbol);
  }

  return priceText;
}

/**
 * Convert a price from USD to AED. If not USD, returns the price as is.
 * @param {number} price - The price to convert.
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'AED').
 * @returns {number} - The converted price.
 */
export function convertToAED(price, currencyCode) {

  if (currencyCode === 'USD') {
    return price / 3.67;
  }
  
  
  return price;
} 
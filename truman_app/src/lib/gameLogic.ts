// Game logic utilities for Grim Market

export const INITIAL_BALANCE = 1000;
export const PAYOUT_MULTIPLIER = 2;

export type Prediction = 'higher' | 'lower';

export interface BetResult {
  won: boolean;
  payout: number;
}

/**
 * Determine if a bet won based on the prediction and actual counts
 */
export function determineBetResult(
  prediction: Prediction,
  previousCount: number,
  newCount: number,
  betAmount: number
): BetResult {
  // If counts are equal, it's a push - return the bet
  if (newCount === previousCount) {
    return { won: false, payout: betAmount };
  }

  const won =
    (prediction === 'higher' && newCount > previousCount) ||
    (prediction === 'lower' && newCount < previousCount);

  return {
    won,
    payout: won ? betAmount * PAYOUT_MULTIPLIER : 0,
  };
}

/**
 * Calculate potential payout for a bet
 */
export function calculatePotentialPayout(amount: number): number {
  return amount * PAYOUT_MULTIPLIER;
}

/**
 * Validate if a bet amount is valid
 */
export function validateBetAmount(amount: number, balance: number): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Bet amount must be greater than 0' };
  }

  if (amount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'Bet amount must be a whole number' };
  }

  return { valid: true };
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Get a color class based on the change direction
 */
export function getChangeColor(previous: number, current: number): string {
  if (current > previous) return 'text-red-500';
  if (current < previous) return 'text-green-500';
  return 'text-gray-500';
}

/**
 * Get the change arrow based on direction
 */
export function getChangeArrow(previous: number, current: number): string {
  if (current > previous) return '▲';
  if (current < previous) return '▼';
  return '—';
}

/**
 * Calculate the percentage change
 */
export function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

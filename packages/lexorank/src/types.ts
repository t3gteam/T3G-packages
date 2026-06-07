export type LexoRank = string;

export interface RankBetweenOptions {
  alphabet?: string;
}

export interface GenerateInitialRanksOptions {
  alphabet?: string;
}

export interface RebalanceRanksOptions<T> {
  alphabet?: string;
  getRank?: (item: T) => string;
}

export interface ShouldRebalanceOptions {
  alphabet?: string;
  maxLength?: number;
}

export interface RankValidationResult {
  valid: boolean;
  reason?: string;
}

import {
  DEFAULT_ALPHABET,
  DEFAULT_INITIAL_RANK_COUNT,
  DEFAULT_MAX_RANK_LENGTH,
} from './constants';
import type {
  GenerateInitialRanksOptions,
  RankBetweenOptions,
  RankValidationResult,
  RebalanceRanksOptions,
  ShouldRebalanceOptions,
} from './types';

const getAlphabet = (alphabet = DEFAULT_ALPHABET): string => {
  if (alphabet.length < 2) {
    throw new Error('Alphabet must contain at least two characters.');
  }

  if (new Set(alphabet).size !== alphabet.length) {
    throw new Error('Alphabet must contain unique characters.');
  }

  return alphabet;
};

const getCharIndex = (char: string, alphabet: string): number => alphabet.indexOf(char);

const validateRankWithAlphabet = (rank: string, alphabet: string): RankValidationResult => {
  if (typeof rank !== 'string') {
    return { valid: false, reason: 'Rank must be a string.' };
  }

  if (rank.length === 0) {
    return { valid: false, reason: 'Rank must not be empty.' };
  }

  for (const char of rank) {
    if (!alphabet.includes(char)) {
      return { valid: false, reason: `Rank contains unsupported character "${char}".` };
    }
  }

  return { valid: true };
};

const assertValidRankWithAlphabet = (rank: string, alphabet: string): void => {
  const result = validateRankWithAlphabet(rank, alphabet);

  if (!result.valid) {
    throw new Error(result.reason ?? 'Rank is invalid.');
  }
};

export const validateRank = (rank: string): RankValidationResult =>
  validateRankWithAlphabet(rank, DEFAULT_ALPHABET);

export const assertValidRank = (rank: string): void => {
  assertValidRankWithAlphabet(rank, DEFAULT_ALPHABET);
};

const compareRanksWithAlphabet = (left: string, right: string, alphabet: string): number => {
  assertValidRankWithAlphabet(left, alphabet);
  assertValidRankWithAlphabet(right, alphabet);

  const limit = Math.max(left.length, right.length);

  for (let index = 0; index < limit; index += 1) {
    const leftChar = left[index];
    const rightChar = right[index];

    if (leftChar === undefined) return -1;
    if (rightChar === undefined) return 1;

    const diff = getCharIndex(leftChar, alphabet) - getCharIndex(rightChar, alphabet);
    if (diff !== 0) return diff;
  }

  return 0;
};

export const compareRanks = (left: string, right: string): number =>
  compareRanksWithAlphabet(left, right, DEFAULT_ALPHABET);

const middleChar = (alphabet: string): string => alphabet[Math.floor(alphabet.length / 2)];

const rankFromDigits = (digits: number[], alphabet: string): string => {
  const rank = digits.map((digit) => alphabet[digit]).join('');
  assertValidRankWithAlphabet(rank, alphabet);
  return rank;
};

const findBetweenDigits = (
  beforeDigits: number[],
  afterDigits: number[],
  alphabet: string,
): number[] => {
  const minDigit = 0;
  const maxDigit = alphabet.length - 1;
  const result: number[] = [];

  for (let index = 0; ; index += 1) {
    const beforeDigit = beforeDigits[index] ?? minDigit;
    const afterDigit = afterDigits[index] ?? maxDigit;

    if (afterDigit - beforeDigit > 1) {
      result.push(Math.floor((beforeDigit + afterDigit) / 2));
      return result;
    }

    result.push(beforeDigit);
  }
};

const rankToDigits = (rank: string | null | undefined, alphabet: string): number[] => {
  if (rank == null) return [];

  assertValidRankWithAlphabet(rank, alphabet);
  return Array.from(rank, (char) => getCharIndex(char, alphabet));
};

export const rankBetween = (
  before?: string | null,
  after?: string | null,
  options: RankBetweenOptions = {},
): string => {
  const alphabet = getAlphabet(options.alphabet);

  if (before == null && after == null) {
    return middleChar(alphabet);
  }

  if (before != null && after != null && compareRanksWithAlphabet(before, after, alphabet) >= 0) {
    throw new Error('Before rank must be lower than after rank.');
  }

  const beforeDigits = rankToDigits(before, alphabet);
  const afterDigits = rankToDigits(after, alphabet);
  const rank = rankFromDigits(findBetweenDigits(beforeDigits, afterDigits, alphabet), alphabet);

  if (before != null && compareRanksWithAlphabet(before, rank, alphabet) >= 0) {
    throw new Error('Unable to generate a rank after the before rank.');
  }

  if (after != null && compareRanksWithAlphabet(rank, after, alphabet) >= 0) {
    throw new Error('Unable to generate a rank before the after rank.');
  }

  return rank;
};

export const generateInitialRanks = (
  count: number,
  options: GenerateInitialRanksOptions = {},
): string[] => {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('Count must be a non-negative integer.');
  }

  const alphabet = getAlphabet(options.alphabet);
  const width = Math.max(2, Math.ceil(Math.log(DEFAULT_INITIAL_RANK_COUNT) / Math.log(alphabet.length)));
  const spaceSize = alphabet.length ** width;
  const step = Math.floor(spaceSize / (count + 1));

  if (count === 0) return [];
  if (step < 1) throw new Error('Count is too large for initial rank generation.');

  return Array.from({ length: count }, (_, index) => {
    let value = step * (index + 1);
    const digits = Array.from({ length: width }, () => 0);

    for (let digitIndex = width - 1; digitIndex >= 0; digitIndex -= 1) {
      digits[digitIndex] = value % alphabet.length;
      value = Math.floor(value / alphabet.length);
    }

    return rankFromDigits(digits, alphabet);
  });
};

export const rebalanceRanks = <T>(
  items: readonly T[],
  options: RebalanceRanksOptions<T> = {},
): Array<T & { rank: string }> => {
  const ranks = generateInitialRanks(items.length, { alphabet: options.alphabet });

  return items.map((item, index) => ({
    ...item,
    rank: ranks[index],
  }));
};

export const shouldRebalanceRank = (
  ranks: readonly string[] | string,
  options: ShouldRebalanceOptions = {},
): boolean => {
  const values = typeof ranks === 'string' ? [ranks] : [...ranks];
  const maxLength = options.maxLength ?? DEFAULT_MAX_RANK_LENGTH;
  const alphabet = getAlphabet(options.alphabet);

  if (values.length === 0) return false;

  const seen = new Set<string>();

  for (let index = 0; index < values.length; index += 1) {
    const rank = values[index];

    if (!validateRankWithAlphabet(rank, alphabet).valid || rank.length > maxLength || seen.has(rank)) {
      return true;
    }

    if (index > 0 && compareRanksWithAlphabet(values[index - 1], rank, alphabet) >= 0) {
      return true;
    }

    seen.add(rank);
  }

  return false;
};

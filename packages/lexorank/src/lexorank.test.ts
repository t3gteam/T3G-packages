import { describe, expect, it } from 'vitest';
import {
  compareRanks,
  generateInitialRanks,
  rankBetween,
  rebalanceRanks,
  shouldRebalanceRank,
  validateRank,
} from './lexorank';

const expectStrictlySorted = (ranks: string[]): void => {
  for (let index = 1; index < ranks.length; index += 1) {
    expect(compareRanks(ranks[index - 1], ranks[index])).toBeLessThan(0);
  }
};

describe('validateRank', () => {
  it('accepts lowercase alphanumeric ranks', () => {
    expect(validateRank('0az9')).toEqual({ valid: true });
  });

  it.each(['', 'A', 'a-z', 'a z', 'å'])('rejects invalid rank %s', (rank) => {
    expect(validateRank(rank).valid).toBe(false);
  });
});

describe('compareRanks', () => {
  it('compares equal, prefix, and multi-character ranks', () => {
    expect(compareRanks('a', 'a')).toBe(0);
    expect(compareRanks('a', 'aa')).toBeLessThan(0);
    expect(compareRanks('az', 'b')).toBeLessThan(0);
    expect(compareRanks('10', '0z')).toBeGreaterThan(0);
  });
});

describe('rankBetween', () => {
  it('generates ranks for empty and one-sided bounds', () => {
    expect(rankBetween(null, null)).toBe('i');
    expect(compareRanks('i', rankBetween('i', null))).toBeLessThan(0);
    expect(compareRanks(rankBetween(null, 'i'), 'i')).toBeLessThan(0);
  });

  it('generates a rank between spaced and adjacent ranks', () => {
    const spaced = rankBetween('a', 'z');
    const adjacent = rankBetween('a', 'b');

    expect(compareRanks('a', spaced)).toBeLessThan(0);
    expect(compareRanks(spaced, 'z')).toBeLessThan(0);
    expect(compareRanks('a', adjacent)).toBeLessThan(0);
    expect(compareRanks(adjacent, 'b')).toBeLessThan(0);
  });

  it('keeps repeated middle inserts strictly sorted', () => {
    const ranks = ['a', 'z'];

    for (let index = 0; index < 24; index += 1) {
      ranks.splice(1, 0, rankBetween(ranks[0], ranks[1]));
    }

    expectStrictlySorted(ranks);
  });

  it('supports custom alphabets consistently', () => {
    const rank = rankBetween('A', 'B', { alphabet: 'ABC' });

    expect(rank).toBe('AB');
    expect(shouldRebalanceRank(['A', rank, 'B'], { alphabet: 'ABC' })).toBe(false);
  });

  it('throws when bounds are invalid', () => {
    expect(() => rankBetween('b', 'a')).toThrow('Before rank must be lower');
    expect(() => rankBetween('A', 'z')).toThrow('unsupported character');
  });
});

describe('generateInitialRanks', () => {
  it('generates empty, single, and multiple sorted unique ranks', () => {
    expect(generateInitialRanks(0)).toEqual([]);

    const one = generateInitialRanks(1);
    const many = generateInitialRanks(10);

    expect(one).toHaveLength(1);
    expect(new Set(many).size).toBe(many.length);
    expectStrictlySorted(many);
  });
});

describe('rebalanceRanks', () => {
  it('does not mutate input and returns sorted unique ranks', () => {
    const items = [{ id: 1, rank: 'z' }, { id: 2, rank: 'a' }];
    const rebalanced = rebalanceRanks(items);

    expect(items).toEqual([{ id: 1, rank: 'z' }, { id: 2, rank: 'a' }]);
    expect(rebalanced.map((item) => item.id)).toEqual([1, 2]);
    expectStrictlySorted(rebalanced.map((item) => item.rank));
  });
});

describe('shouldRebalanceRank', () => {
  it('detects invalid, duplicate, unsorted, and too long ranks', () => {
    expect(shouldRebalanceRank('A')).toBe(true);
    expect(shouldRebalanceRank(['a', 'a'])).toBe(true);
    expect(shouldRebalanceRank(['b', 'a'])).toBe(true);
    expect(shouldRebalanceRank('abc', { maxLength: 2 })).toBe(true);
  });

  it('returns false for sorted valid ranks', () => {
    expect(shouldRebalanceRank(['a', 'b', 'c'])).toBe(false);
  });
});

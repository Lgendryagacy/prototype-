export type RankTier = 'founder' | 'legend' | 'master' | 'vanguard' | 'earlybird' | 'champion' | 'rookie';

export const isEligibleForRank = (rank?: number | null): boolean => {
  if (rank === null || rank === undefined || typeof rank !== 'number' || isNaN(rank)) {
    return false;
  }
  return rank >= 0 && rank <= 1000;
};

export const getTierFromRank = (rank: number): RankTier => {
  if (rank === 0) return 'founder';
  if (rank >= 1 && rank <= 5) return 'legend';
  if (rank >= 6 && rank <= 20) return 'master';
  if (rank >= 21 && rank <= 100) return 'vanguard';
  if (rank >= 101 && rank <= 300) return 'earlybird';
  if (rank >= 301 && rank <= 1000) return 'champion';
  return 'rookie';
};

export const getTierLabel = (tier: string | null | undefined): string => {
  switch (tier) {
    case 'founder':
      return 'Founder';
    case 'legend':
      return 'Top 5';
    case 'master':
      return 'Top 20';
    case 'vanguard':
      return 'Top 100';
    case 'earlybird':
      return 'Top 300';
    case 'champion':
      return 'Top 1000';
    case 'rookie':
    default:
      return 'Member';
  }
};

export const getRankData = (rank: number) => {
  const tier = getTierFromRank(rank);
  const label = getTierLabel(tier);
  const eligible = isEligibleForRank(rank);

  return {
    rank,
    tier,
    label,
    isEligible: eligible,
    name: label
  };
};

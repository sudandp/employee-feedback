import { weightedAverage, normalize } from '../utils/statistics';

export interface QuestionScore {
  score: number;
  weight: number;
  themeId: string;
}

export class ScoringService {
  static calculateWeightedScore(scores: QuestionScore[]): number {
    const values = scores.map(s => s.score);
    const weights = scores.map(s => s.weight);
    return weightedAverage(values, weights);
  }

  static calculateEngagementIndex(scores: QuestionScore[], minScale = 1, maxScale = 5): number {
    const weightedScore = this.calculateWeightedScore(scores);
    return normalize(weightedScore, minScale, maxScale);
  }

  static calculateThemeScores(scores: QuestionScore[]): Record<string, number> {
    const themeGroups: Record<string, QuestionScore[]> = {};
    
    for (const score of scores) {
      if (!themeGroups[score.themeId]) {
        themeGroups[score.themeId] = [];
      }
      themeGroups[score.themeId].push(score);
    }

    const themeScores: Record<string, number> = {};
    for (const [themeId, groupScores] of Object.entries(themeGroups)) {
      themeScores[themeId] = this.calculateEngagementIndex(groupScores);
    }

    return themeScores;
  }
}

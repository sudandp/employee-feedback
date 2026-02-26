import { logisticRegressionProbability } from '../utils/statistics';

export class RiskModelService {
  // P(resign) = 1 / (1 + e^-(β0 + β1*engagement + β2*tenure + β3*managerRating))
  // Example weights (would be trained in reality)
  private static readonly WEIGHTS = [-0.05, -0.02, -0.04];
  private static readonly BIAS = 2.5;

  static calculateAttritionRisk(engagementScore: number, tenureMonths: number, managerRating: number): number {
    // Normalize inputs roughly for the model
    const features = [
      engagementScore, // 0-100
      tenureMonths,    // months
      managerRating    // 1-5
    ];
    
    const prob = logisticRegressionProbability(features, this.WEIGHTS, this.BIAS);
    return prob * 100; // Return as percentage
  }
}

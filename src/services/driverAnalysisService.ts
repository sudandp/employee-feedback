import { pearsonCorrelation, linearRegression } from '../utils/statistics';

export interface DriverData {
  themeId: string;
  themeName: string;
  themeScores: number[];
  engagementScores: number[];
}

export interface DriverImpact {
  themeId: string;
  themeName: string;
  correlation: number;
  impact: number; // slope from linear regression
  performance: number; // average theme score
}

export class DriverAnalysisService {
  static analyzeDrivers(data: DriverData[]): DriverImpact[] {
    return data.map(driver => {
      const correlation = pearsonCorrelation(driver.themeScores, driver.engagementScores);
      const regression = linearRegression(driver.themeScores, driver.engagementScores);
      const performance = driver.themeScores.reduce((a, b) => a + b, 0) / (driver.themeScores.length || 1);

      return {
        themeId: driver.themeId,
        themeName: driver.themeName,
        correlation,
        impact: regression.slope,
        performance
      };
    }).sort((a, b) => b.impact - a.impact);
  }
}

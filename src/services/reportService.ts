import { ScoringService } from './scoringService';
import { DriverAnalysisService } from './driverAnalysisService';
import { TrendService } from './trendService';
import { ParticipationService } from './participationService';
import { RiskModelService } from './riskModelService';
import { NLPService } from './nlpService';

export class ReportService {
  static async generateCycleReport(
    cycleId: string,
    responses: any[],
    previousScore: number,
    invitedCount: number
  ) {
    // 1. Scoring
    const questionScores = responses.filter(r => r.numeric_value !== null).map(r => ({
      score: r.numeric_value,
      weight: r.weight || 1,
      themeId: r.theme_id
    }));

    const engagementIndex = ScoringService.calculateEngagementIndex(questionScores);
    const themeScores = ScoringService.calculateThemeScores(questionScores);

    // 2. Trend
    const trend = TrendService.calculateTrend(engagementIndex, previousScore);

    // 3. Participation
    const completedCount = new Set(responses.map(r => r.user_id)).size;
    const participationRate = ParticipationService.calculateResponseRate(completedCount, invitedCount);

    // 4. NLP
    const textResponses = responses.filter(r => r.text_value).map(r => r.text_value);
    const nlpInsights = await NLPService.analyzeResponses(textResponses);

    // 5. Risk
    // Mocking average tenure and manager rating for department level
    const riskScore = RiskModelService.calculateAttritionRisk(engagementIndex, 24, 3.5);

    return {
      cycleId,
      engagementIndex,
      themeScores,
      trend,
      participationRate,
      riskScore,
      nlpInsights,
      generatedAt: new Date().toISOString()
    };
  }
}

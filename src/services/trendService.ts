import { percentageDelta } from '../utils/statistics';

export class TrendService {
  static calculateTrend(currentScore: number, previousScore: number): number {
    return percentageDelta(currentScore, previousScore);
  }

  static aggregateTimeSeries(data: { date: string; score: number }[], interval: 'month' | 'quarter'): Record<string, number> {
    const aggregated: Record<string, { sum: number; count: number }> = {};

    for (const item of data) {
      const dateObj = new Date(item.date);
      let key = '';
      
      if (interval === 'month') {
        key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      } else if (interval === 'quarter') {
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
        key = `${dateObj.getFullYear()}-Q${quarter}`;
      }

      if (!aggregated[key]) {
        aggregated[key] = { sum: 0, count: 0 };
      }
      aggregated[key].sum += item.score;
      aggregated[key].count += 1;
    }

    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(aggregated)) {
      result[key] = val.sum / val.count;
    }

    return result;
  }
}

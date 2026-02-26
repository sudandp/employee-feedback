export class ParticipationService {
  static calculateResponseRate(completed: number, invited: number): number {
    if (invited === 0) return 0;
    return (completed / invited) * 100;
  }

  static isRisk(completed: number, invited: number, threshold = 60): boolean {
    return this.calculateResponseRate(completed, invited) < threshold;
  }
}

export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

export function median(data: number[]): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function standardDeviation(data: number[]): number {
  if (data.length === 0) return 0;
  const m = mean(data);
  const variance = data.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / data.length;
  return Math.sqrt(variance);
}

export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length === 0 || values.length !== weights.length) return 0;
  const sumProduct = values.reduce((sum, val, i) => sum + val * weights[i], 0);
  const sumWeights = weights.reduce((sum, w) => sum + w, 0);
  return sumWeights === 0 ? 0 : sumProduct / sumWeights;
}

export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || x.length !== y.length) return 0;
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let num = 0;
  let denX = 0;
  let denY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  if (x.length === 0 || x.length !== y.length) return { slope: 0, intercept: 0 };
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let num = 0;
  let den = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    num += dx * (y[i] - meanY);
    den += dx * dx;
  }
  
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  
  return { slope, intercept };
}

export function logisticRegressionProbability(features: number[], weights: number[], bias: number): number {
  if (features.length !== weights.length) return 0;
  const z = features.reduce((sum, x, i) => sum + x * weights[i], bias);
  return 1 / (1 + Math.exp(-z));
}

export function percentageDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 100;
  return ((value - min) / (max - min)) * 100;
}

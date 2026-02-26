import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

export interface NLPResult {
  sentimentScore: number; // -1 to 1
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  keywords: string[];
  topics: string[];
  isToxic: boolean;
  executiveSummary: string;
  managerRecommendations: string[];
}

export class NLPService {
  static async analyzeResponses(texts: string[]): Promise<NLPResult> {
    if (!process.env.OPENAI_API_KEY || texts.length === 0) {
      return {
        sentimentScore: 0.5,
        sentimentDistribution: { positive: 60, neutral: 30, negative: 10 },
        keywords: ['teamwork', 'communication'],
        topics: ['Culture', 'Management'],
        isToxic: false,
        executiveSummary: 'Mock summary due to missing API key or empty input.',
        managerRecommendations: ['Schedule 1-on-1s', 'Review compensation'],
      };
    }

    try {
      const prompt = `Analyze the following employee feedback responses. Return a JSON object with:
      - sentimentScore (number between -1 and 1)
      - sentimentDistribution (object with positive, neutral, negative percentages summing to 100)
      - keywords (array of strings)
      - topics (array of strings)
      - isToxic (boolean)
      - executiveSummary (string)
      - managerRecommendations (array of strings)
      
      Responses:
      ${texts.join('\n')}
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as NLPResult;
    } catch (error) {
      console.error('NLP Analysis failed:', error);
      throw error;
    }
  }
}

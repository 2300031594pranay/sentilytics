// Simple client-side sentiment analysis using keyword matching
// In production, this would call a Flask API with a trained ML model

const positiveWords = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'loved',
  'best', 'awesome', 'beautiful', 'happy', 'enjoy', 'enjoyed', 'perfect', 'brilliant',
  'outstanding', 'superb', 'incredible', 'magnificent', 'delightful', 'pleasant',
  'recommend', 'recommended', 'impressive', 'nice', 'like', 'liked', 'well', 'fun',
  'positive', 'satisfied', 'exciting', 'excited', 'worth', 'top', 'favorite',
  'comfortable', 'glad', 'pleased', 'thrilled', 'exceptional', 'marvelous'
]);

const negativeWords = new Set([
  'bad', 'terrible', 'horrible', 'awful', 'worst', 'hate', 'hated', 'poor', 'boring',
  'ugly', 'disgusting', 'disappointing', 'disappointed', 'waste', 'useless', 'annoying',
  'annoyed', 'angry', 'sad', 'unfortunately', 'negative', 'wrong', 'broken', 'fail',
  'failed', 'failure', 'never', 'nothing', 'nowhere', 'impossible', 'problem', 'problems',
  'trouble', 'difficult', 'hard', 'painful', 'miserable', 'dreadful', 'lousy', 'inferior'
]);

export interface SentimentResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  positiveScore: number;
  negativeScore: number;
  neutralScore: number;
  positiveWords: string[];
  negativeWords: string[];
}

export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
  
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];
  
  words.forEach(word => {
    if (positiveWords.has(word)) foundPositive.push(word);
    if (negativeWords.has(word)) foundNegative.push(word);
  });

  const total = Math.max(words.length, 1);
  const posRatio = foundPositive.length / total;
  const negRatio = foundNegative.length / total;
  const neutralRatio = 1 - posRatio - negRatio;

  // Normalize to probabilities
  const sum = posRatio + negRatio + Math.max(neutralRatio, 0.1);
  const positiveScore = Math.round((posRatio / sum) * 100);
  const negativeScore = Math.round((negRatio / sum) * 100);
  const neutralScore = 100 - positiveScore - negativeScore;

  let sentiment: 'Positive' | 'Negative' | 'Neutral';
  let confidence: number;

  if (foundPositive.length > foundNegative.length) {
    sentiment = 'Positive';
    confidence = Math.min(0.65 + posRatio * 3, 0.98);
  } else if (foundNegative.length > foundPositive.length) {
    sentiment = 'Negative';
    confidence = Math.min(0.65 + negRatio * 3, 0.98);
  } else {
    sentiment = 'Neutral';
    confidence = Math.max(0.5, 0.7 - (posRatio + negRatio));
  }

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    positiveScore,
    negativeScore,
    neutralScore,
    positiveWords: [...new Set(foundPositive)],
    negativeWords: [...new Set(foundNegative)],
  };
}

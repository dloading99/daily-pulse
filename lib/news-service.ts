import type { InsightDTO } from './types';

const SEARCH_API_URL = 'https://api.tavily.com/search';
const ALLOWED_DOMAINS = ['bloomberg.com', 'hbr.org', 'technologyreview.com', 'economist.com'];

export function identifySource(url: string): string {
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  })();

  if (hostname.includes('bloomberg.com')) return 'Bloomberg';
  if (hostname.includes('hbr.org')) return 'Harvard Business Review';
  if (hostname.includes('technologyreview.com')) return 'MIT Technology Review';
  if (hostname.includes('economist.com')) return 'The Economist';
  return 'Fonte Autorevole';
}

export function calculateDeterministicPulseScore(topic: string, title: string, content: string, sourceLabel: string): number {
  let score = 60;
  const normalizedSource = sourceLabel.toLowerCase();
  if (normalizedSource.includes('harvard') || normalizedSource.includes('economist')) score += 15;
  else if (normalizedSource.includes('technology')) score += 10;
  else if (normalizedSource.includes('bloomberg')) score += 5;

  const topicKeyword = topic.split(' ').find((word) => word.length > 3);
  if (topicKeyword && title.toLowerCase().includes(topicKeyword.toLowerCase())) {
    score += 10;
  }

  if (content && content.length > 1000) {
    score += 5;
  }

  return Math.min(score, 99);
}

function extractSummaryBullets(content: string): string[] {
  if (!content) return ['Sintesi non disponibile'];
  const sentences = content
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const bullets = sentences.slice(0, 3).map((sentence) => sentence.trim());
  if (bullets.length === 0) {
    bullets.push(content.slice(0, 160));
  }
  return bullets.slice(0, 3);
}

interface TavilyResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
    published_date?: string;
  }>;
}

export async function fetchDailyInsights(topic: string): Promise<InsightDTO[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.error('Tavily API key missing. Returning empty insights.');
    return [];
  }

  try {
    const response = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        query: topic,
        days: 7,
        include_domains: ALLOWED_DOMAINS,
        max_results: 5
      })
    });

    if (!response.ok) {
      console.error('Search API error', response.status, await response.text());
      return [];
    }

    const payload = (await response.json()) as TavilyResponse;
    if (!payload.results || payload.results.length === 0) return [];

    const mapped = payload.results.map((result) => {
      const source = identifySource(result.url);
      const summary_bullets = extractSummaryBullets(result.content);
      const pulseScore = calculateDeterministicPulseScore(topic, result.title, result.content, source);

      return {
        title: result.title,
        url: result.url,
        source,
        date: result.published_date ?? undefined,
        published_date: result.published_date ?? undefined,
        summary_bullets,
        pulseScore,
        content: result.content ?? null
      } satisfies InsightDTO;
    });

    return mapped.sort((a, b) => b.pulseScore - a.pulseScore).slice(0, 5);
  } catch (error) {
    console.error('Unhandled search error', error);
    return [];
  }
}

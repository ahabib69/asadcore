// Vercel serverless function: aggregates movie/box-office RSS feeds server-side (avoids browser CORS).
// Cached for 15 minutes at the edge. The same getNews() is used by the Vite dev middleware.
export interface NewsItem { title: string; link: string; source: string; industry: 'hollywood' | 'bollywood' | 'bangla'; pubDate: string; }
const FEEDS: { url: string; source: string; industry: NewsItem['industry'] }[] = [
  { url: 'https://variety.com/v/film/feed/', source: 'Variety', industry: 'hollywood' },
  { url: 'https://www.hollywoodreporter.com/t/film/feed/', source: 'Hollywood Reporter', industry: 'hollywood' },
  { url: 'https://www.bollywoodhungama.com/feed/', source: 'Bollywood Hungama', industry: 'bollywood' },
  { url: 'https://www.pinkvilla.com/rss.xml', source: 'Pinkvilla', industry: 'bollywood' },
  { url: 'https://www.thedailystar.net/entertainment/rss.xml', source: 'The Daily Star', industry: 'bangla' },
  { url: 'https://news.google.com/rss/search?q=site:prothomalo.com+%E0%A6%AC%E0%A6%BF%E0%A6%A8%E0%A7%8B%E0%A6%A6%E0%A6%A8&hl=bn&gl=BD&ceid=BD:bn', source: 'Prothom Alo', industry: 'bangla' },
  { url: 'https://news.google.com/rss/search?q=site:bdnews24.com+entertainment&hl=en&gl=BD&ceid=BD:en', source: 'bdnews24', industry: 'bangla' }
];
function decode(s: string) { return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/<[^>]+>/g, '').trim(); }
function parse(xml: string, source: string, industry: NewsItem['industry']): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks.slice(0, 8)) {
    const title = decode((b.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    let link = decode((b.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
    if (!link) link = (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || '';
    const pubDate = (b.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || b.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] || '';
    if (title && link) items.push({ title, link, source, industry, pubDate });
  }
  return items;
}
let cache: { at: number; items: NewsItem[] } | null = null;
export async function getNews(): Promise<NewsItem[]> {
  if (cache && Date.now() - cache.at < 15 * 60 * 1000) return cache.items;
  const results = await Promise.allSettled(FEEDS.map(async f => {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
    try { const r = await fetch(f.url, { signal: ctrl.signal, headers: { 'User-Agent': 'ASADCORE/2.0 RSS aggregator' } }); if (!r.ok) return []; return parse(await r.text(), f.source, f.industry); } finally { clearTimeout(t); }
  }));
  const items = results.flatMap(r => r.status === 'fulfilled' ? r.value : []).sort((a, b) => Date.parse(b.pubDate || '0') - Date.parse(a.pubDate || '0')).slice(0, 40);
  if (items.length) cache = { at: Date.now(), items };
  return items;
}
export default async function handler(_req: any, res: any) {
  try {
    const items = await getNews();
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ items, cachedAt: cache?.at || Date.now() });
  } catch (e: any) {
    res.status(200).json({ items: [], error: String(e?.message || e) });
  }
}

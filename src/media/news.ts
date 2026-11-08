import type { NewsItem } from '../../api/news';
export async function fetchNews(): Promise<NewsItem[]> { try { const r = await fetch('/api/news'); if (!r.ok) return []; const j = await r.json(); return j.items || []; } catch { return []; } }

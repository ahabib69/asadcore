import type { MusicTrack } from '../config';
const ID = (import.meta as any).env?.VITE_JAMENDO_ID as string | undefined;
export async function fetchJamendo(): Promise<MusicTrack[]> {
  if (!ID) return [];
  try {
    const u = new URL('https://api.jamendo.com/v3.0/tracks/');
    u.searchParams.set('client_id', ID); u.searchParams.set('format', 'json'); u.searchParams.set('limit', '30'); u.searchParams.set('audioformat', 'mp32'); u.searchParams.set('order', 'popularity_total'); u.searchParams.set('tags', 'ambient+cinematic+electronic');
    const r = await fetch(u.toString()); if (!r.ok) return []; const j = await r.json();
    return (j.results || []).filter((t: any) => t.audio).map((t: any) => ({ title: t.name, artist: t.artist_name, genre: 'Electronic' as const, src: t.audio, cover: t.album_image || t.image, license: 'Jamendo CC' }));
  } catch { return []; }
}

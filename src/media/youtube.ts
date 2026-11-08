// Shared YouTube IFrame Player API loader + helpers. Embeds only (no downloads).
let apiPromise: Promise<any> | null = null;
export function loadYouTubeAPI(): Promise<any> {
  if ((window as any).YT?.Player) return Promise.resolve((window as any).YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => { prev?.(); resolve((window as any).YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => reject(new Error('YouTube API failed to load'));
    document.head.appendChild(s);
    setTimeout(() => reject(new Error('YouTube API timeout')), 15000);
  });
  return apiPromise;
}
export const ytThumb = (id: string, q: 'hq' | 'mq' | 'maxres' = 'hq') => `https://i.ytimg.com/vi/${id}/${q}default.jpg`;
export const ytWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export interface YTHandle { player: any; destroy: () => void; }
export async function createYTPlayer(el: HTMLElement, videoId: string, opts: { autoplay?: boolean; onState?: (s: number) => void; onError?: (code: number) => void; onReady?: (p: any) => void } = {}): Promise<YTHandle> {
  const YT = await loadYouTubeAPI();
  return new Promise((resolve) => {
    const player = new YT.Player(el, {
      videoId,
      playerVars: { autoplay: opts.autoplay ? 1 : 0, rel: 0, modestbranding: 1, playsinline: 1, origin: location.origin },
      events: {
        onReady: (e: any) => { opts.onReady?.(e.target); if (opts.autoplay) e.target.playVideo(); resolve({ player: e.target, destroy: () => { try { e.target.destroy(); } catch {} } }); },
        onStateChange: (e: any) => opts.onState?.(e.data),
        onError: (e: any) => opts.onError?.(e.data)
      }
    });
  });
}
// Thumbnail reachability check used by the gallery to hide dead IDs.
export function checkThumbnail(id: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    const t = setTimeout(() => resolve(false), 8000);
    img.onload = () => { clearTimeout(t); resolve(img.naturalWidth > 120); };
    img.onerror = () => { clearTimeout(t); resolve(false); };
    img.src = ytThumb(id, 'mq');
  });
}

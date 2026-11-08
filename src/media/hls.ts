// Direct MP4 / HLS playback helper. hls.js is lazy-loaded only when needed.
export async function attachSource(video: HTMLVideoElement, src: string): Promise<() => void> {
  if (/\.m3u8($|\?)/i.test(src)) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = src; return () => { video.removeAttribute('src'); video.load(); }; }
    const { default: Hls } = await import('hls.js');
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src); hls.attachMedia(video);
      return () => hls.destroy();
    }
  }
  video.src = src;
  return () => { video.removeAttribute('src'); video.load(); };
}

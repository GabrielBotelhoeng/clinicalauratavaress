// Vídeos de fundo: carregam e tocam só perto da viewport; com movimento reduzido mostram apenas o poster.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const videos = document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]');

function load(video: HTMLVideoElement): void {
  if (video.dataset.loaded === 'true') return;
  video.dataset.loaded = 'true';
  if (video.dataset.poster) video.poster = video.dataset.poster;
  if (reduceMotion.matches) return;
  video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => {
    source.src = source.dataset.src ?? '';
  });
  video.load();
}

if (videos.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          load(video);
          if (!reduceMotion.matches) void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      }
    },
    { rootMargin: '300px 0px' },
  );
  videos.forEach((video) => observer.observe(video));
}

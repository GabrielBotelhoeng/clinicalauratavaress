// Vídeos de fundo: carregam e tocam só perto da viewport. Com movimento reduzido ou em telas
// estreitas (<768px, mesmo corte do botão de pausa) mostram apenas o poster — nenhuma requisição
// de mídia. Pausar pelo botão prevalece sobre o IntersectionObserver: ao voltar à viewport depois
// de pausado manualmente, o vídeo não retoma sozinho.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isCompact = window.matchMedia('(max-width: 767.98px)');

function canAutoplay(): boolean {
  return !reduceMotion.matches && !isCompact.matches;
}

function load(video: HTMLVideoElement): void {
  if (video.dataset.loaded === 'true') return;
  video.dataset.loaded = 'true';
  if (video.dataset.poster) video.poster = video.dataset.poster;
  if (!canAutoplay()) return;
  video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => {
    source.src = source.dataset.src ?? '';
  });
  video.load();
}

for (const root of document.querySelectorAll<HTMLElement>('[data-video-root]')) {
  const video = root.querySelector<HTMLVideoElement>('video[data-lazy-video]');
  if (!video) continue;

  const toggle = root.querySelector<HTMLButtonElement>('[data-video-toggle]');
  toggle?.addEventListener('click', () => {
    const paused = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(paused));
    video.dataset.userPaused = String(paused);
    if (paused) video.pause();
    else if (canAutoplay()) void video.play().catch(() => undefined);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          video.pause();
          continue;
        }
        load(video);
        if (video.dataset.userPaused !== 'true' && canAutoplay()) {
          void video.play().catch(() => undefined);
        }
      }
    },
    { rootMargin: '300px 0px' },
  );
  observer.observe(video);
}

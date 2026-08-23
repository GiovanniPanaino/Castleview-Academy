// gallery/gallery.js  (NO <script> TAGS IN THIS FILE)
(() => {
  // Open gallery panel from any [data-gallery] trigger
  document.addEventListener('click', (ev) => {
    const link = ev.target.closest('[data-gallery]');
    if (!link) return;
    ev.preventDefault();
    const panel = document.getElementById('galleryPanel');
    panel?.classList.add('open');
    panel?.setAttribute('aria-hidden','false');
    document.getElementById('overlay')?.classList.add('show');
    document.body.classList.add('no-scroll');
    panel?.scrollIntoView({behavior:'smooth', block:'start'});
  });
	const stopMedia = (root) => (window.CPA_UI?.stopMedia)
  ? window.CPA_UI.stopMedia(root)
  : (() => {
      root.querySelectorAll('video,audio').forEach(m=>{ try{m.pause();}catch{}; try{m.removeAttribute('src');}catch{}; try{m.load();}catch{}; });
      root.querySelectorAll('iframe').forEach(f=>{ try{f.src=f.src;}catch{}; });
    })();

  const grid       = document.getElementById('albumsGrid');
  const modal      = document.getElementById('albumModal');
  const viewport   = document.getElementById('viewport');
  const pager      = document.getElementById('pager');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const albumTitle = document.getElementById('albumTitle');

  // 1) Load albums JSON from the correct path
  const ALBUMS_URL = 'gallery/data/albums.json';
  fetch(ALBUMS_URL + '?v=' + Date.now(), { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load ${ALBUMS_URL}`);
      return r.json();
    })
    .then(albums => renderAlbums(albums))
    .catch(err => {
      console.error(err);
      if (grid) {
        grid.innerHTML = `
          <article class="card" style="grid-column:1/-1">
            <h3 style="margin:.2rem 0 .4rem">Gallery unavailable</h3>
            <p class="muted" style="margin:0">Could not load <code>${ALBUMS_URL}</code>. Check that the file exists and the server serves JSON.</p>
          </article>`;
      }
    });

  function renderAlbums(albums){
    if (!grid) return;
    grid.innerHTML = albums.map(a => `
      <article class="card album-card" data-album="${a.id}" style="padding:0;overflow:hidden">
        <img src="${a.cover}" alt="${a.title}"
             loading="lazy" decoding="async"
             style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">
        <div style="padding:.7rem 1rem">
          <h3 style="margin:.2rem 0">${a.title}</h3>
          ${a.count ? `<p class="muted" style="margin:.1rem 0 0">${a.count} photos</p>` : ''}
        </div>
      </article>
    `).join('');

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.album-card');
      if (!card) return;
      const id = card.getAttribute('data-album');
      const album = albums.find(x => x.id === id);
      if (album) openAlbum(album);
    });
  }

  // Album modal
  let slides = [];
  let idx = 0;

  function openAlbum(album){
    albumTitle && (albumTitle.textContent = album.title || 'Album');

    // Prefer explicit 'images' array (supports video slides)
    if (Array.isArray(album.images) && album.images.length){
      slides = album.images.slice();
    } else {
      // Fallback guesser if no 'images' array
      slides = buildGuesses(album);
    }

    if (!slides.length){
      viewport.innerHTML = `<div class="card" style="margin:1rem">No images found for this album.</div>`;
      pager.innerHTML = '';
    } else {
      idx = 0;
      drawSlide();
    }

    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open','');
  }

  function buildGuesses(album){
    const out = [];
    const base = (album.path || '').replace(/\/+$/,'');
    if (!base) return out;
    if (album.cover) out.push(album.cover);

    for (let i = 1; i <= 20; i++){
      out.push(`${base}/${i}.jpg`, `${base}/${i}.jpeg`, `${base}/${i}.webp`, `${base}/${i}.png`);
    }
    return [...new Set(out)];
  }

  function drawSlide() {
	stopMedia(viewport);
    const item = slides[idx];

    // Normalize
    const isObj = item && typeof item === 'object';
    const type  = isObj ? item.type : 'image';

    if (type === 'video'){
      const src    = item.src;
      const poster = item.poster ? ` poster="${item.poster}"` : '';
      const mime   = item.mime || 'video/mp4';

      viewport.innerHTML = `
        <video controls playsinline preload="none"${poster}
               style="width:100%;max-height:80vh;display:block;background:#000">
          <source src="${src}" type="${mime}">
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      // image string or {type:'image', src:''}
      const src = isObj ? item.src : item;
      viewport.innerHTML = `
        <img src="${src}" alt="Slide ${idx+1} of ${slides.length}"
             loading="eager" decoding="async"
             style="width:100%;height:auto;max-height:80vh;display:block;object-fit:contain;background:#000">
      `;
    }

    // Pager
    pager.innerHTML = slides.map((_, i) =>
      `<span class="dot${i===idx?' active':''}" data-i="${i}"></span>`
    ).join('');
  }

  pager?.addEventListener('click', (e) => {
    const dot = e.target.closest('.dot');
    if (!dot) return;
    const i = Number(dot.getAttribute('data-i'));
    if (Number.isInteger(i)) { idx = i; drawSlide(); }
  });

  document.getElementById('prevBtn')?.addEventListener('click', () => {
    if (!slides.length) return;
    idx = (idx - 1 + slides.length) % slides.length;
    drawSlide();
  });

  document.getElementById('nextBtn')?.addEventListener('click', () => {
    if (!slides.length) return;
    idx = (idx + 1) % slides.length;
    drawSlide();
  });

  document.getElementById('closeModal')?.addEventListener('click', () => {
  stopMedia(modal);
  modal.close?.();
  modal.removeAttribute('open');
});
// Tap/click the placeholder to view the current image full-size in the site lightbox
(() => {
  const siteLightbox = document.getElementById('lightbox');
  const siteImg = document.getElementById('lightbox-img');
  const siteCap = document.getElementById('lightbox-caption');
  if (!viewport || !siteLightbox || !siteImg || !siteCap) return;

  viewport.addEventListener('click', () => {
    const current = slides[idx];
    const isObj = current && typeof current === 'object';
    const isVideo = isObj && current.type === 'video';
    if (isVideo) return;  // ignore videos for "full image" tap

    const src = isObj ? current.src : current;
    if (!src) return;

    siteImg.src = src;
    siteImg.alt = `Slide ${idx + 1} of ${slides.length}`;
    siteCap.textContent = siteImg.alt;

    // show the generic lightbox
    if (typeof siteLightbox.showModal === 'function') siteLightbox.showModal();
    else siteLightbox.setAttribute('open', '');
    (window.CPA_UI?.showOverlay?.()) || document.getElementById('overlay')?.classList.add('show');
  });
})();

})();


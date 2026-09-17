(() => {
  const grid = document.getElementById('albumsGrid');
  const modal = document.getElementById('albumModal');
  const viewport = document.getElementById('viewport');
  const pager = document.getElementById('pager');
  const albumTitle = document.getElementById('albumTitle');
  let slides = [];
  let index = 0;

  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  fetch('data/albums.json')
    .then(response => {
      if (!response.ok) throw new Error('Unable to load gallery albums');
      return response.json();
    })
    .then(albums => {
      grid.innerHTML = albums.map(album => `
        <button type="button" class="album-card" data-album="${escape(album.id)}">
          <img src="${escape(album.cover)}" alt="${escape(album.title)}" loading="lazy" decoding="async" width="800" height="600">
          <span class="album-name">${escape(album.title)}</span>
        </button>
      `).join('');
      grid.addEventListener('click', event => {
        const card = event.target.closest('[data-album]');
        if (!card) return;
        const album = albums.find(item => item.id === card.dataset.album);
        if (!album) return;
        albumTitle.textContent = album.title;
        slides = album.images;
        index = 0;
        drawSlide();
        modal.showModal();
      });
    })
    .catch(() => {
      grid.innerHTML = '<p>Gallery unavailable. Please try again later.</p>';
    });

  function stopMedia() {
    viewport.querySelectorAll('video').forEach(video => video.pause());
  }

  function drawSlide() {
    stopMedia();
    const item = slides[index];
    const source = typeof item === 'string' ? item : item.src;
    if (item.type === 'video') {
      viewport.innerHTML = `<video controls playsinline preload="metadata"${item.poster ? ` poster="${escape(item.poster)}"` : ''}>
        <source src="${escape(source)}" type="${escape(item.mime || 'video/mp4')}">
      </video>`;
    } else {
      viewport.innerHTML = `<img src="${escape(source)}" alt="${escape(albumTitle.textContent)} — photo ${index + 1} of ${slides.length}" decoding="async">`;
    }
    pager.innerHTML = slides.map((_, i) => `<button type="button" class="dot${i === index ? ' active' : ''}" data-index="${i}" aria-label="View slide ${i + 1}"${i === index ? ' aria-current="true"' : ''}></button>`).join('');
  }

  function move(direction) {
    if (!slides.length) return;
    index = (index + direction + slides.length) % slides.length;
    drawSlide();
  }

  pager.addEventListener('click', event => {
    const dot = event.target.closest('[data-index]');
    if (!dot) return;
    index = Number(dot.dataset.index);
    drawSlide();
  });
  document.getElementById('prevBtn').addEventListener('click', () => move(-1));
  document.getElementById('nextBtn').addEventListener('click', () => move(1));
  document.getElementById('closeModal').addEventListener('click', () => modal.close());
  modal.addEventListener('close', stopMedia);
  modal.addEventListener('cancel', stopMedia);
  modal.addEventListener('keydown', event => {
    if (event.target.closest('video')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
})();

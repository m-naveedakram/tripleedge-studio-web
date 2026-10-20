(function () {
  const statLive = document.querySelector('.stat-item strong.live');
  const statReview = document.querySelector('.stat-item strong.review');

  function applyMeta(card, meta) {
    if (!meta) return;
    const img = card.querySelector('.app-icon img, .featured-icon img');
    const titleEl = card.querySelector('h3');
    if (meta.icon && img) {
      img.src = meta.icon;
      img.classList.add('has-img');
      const parent = img.closest('.app-icon, .featured-icon');
      if (parent) parent.classList.add('has-img');
      if (meta.title) img.alt = meta.title + ' app icon';
    }
    if (meta.title && titleEl) titleEl.textContent = meta.title;
  }

  fetch('data/play-metadata.json', {cache: 'no-cache'})
    .then(function (res) {
      if (!res.ok) throw new Error('metadata missing');
      return res.json();
    })
    .then(function (data) {
      if (statLive && data.liveCount != null) statLive.textContent = String(data.liveCount);
      if (statReview && data.reviewCount != null) statReview.textContent = String(data.reviewCount);
      document.querySelectorAll('[data-play-package]').forEach(function (el) {
        const pkg = el.getAttribute('data-play-package');
        const meta = data.apps && data.apps[pkg];
        const card = el.closest('article') || el;
        applyMeta(card, meta);
      });
    })
    .catch(function () {
      /* Static HTML fallbacks remain */
    });
})();

(function () {
  const statLive = document.querySelector('.stat-item strong.live');
  const statReview = document.querySelector('.stat-item strong.review');

  function normalizePlayIconUrl(icon) {
    if (!icon) return '';
    var url = icon.trim();
    var match = url.match(/^(https:\/\/play-lh\.googleusercontent\.com\/[^=?\s]+)/i);
    if (match) return match[1] + '=w256-h256';
    return url.replace(/=s0-br30=/gi, '=').replace(/=w\d+-h\d+$/i, '=w256-h256');
  }

  function applyMeta(card, meta) {
    if (!meta) return;
    var img = card.querySelector('.app-icon img, .featured-icon img');
    var titleEl = card.querySelector('h3');
    if (meta.icon && img) {
      var iconUrl = normalizePlayIconUrl(meta.icon);
      if (iconUrl) {
        img.referrerPolicy = 'no-referrer';
        img.src = iconUrl;
        var parent = img.closest('.app-icon, .featured-icon');
        if (parent) parent.classList.add('has-img');
        if (meta.title) img.alt = meta.title + ' app icon';
      }
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
        var pkg = el.getAttribute('data-play-package');
        var meta = data.apps && data.apps[pkg];
        if (meta && meta.icon) {
          meta = Object.assign({}, meta, {icon: normalizePlayIconUrl(meta.icon)});
        }
        var card = el.closest('article') || el;
        applyMeta(card, meta);
      });
    })
    .catch(function () {
      /* Static HTML fallbacks remain */
    });
})();

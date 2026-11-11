/**
 * 三三藝 Grid Gallery - 主程式（靜態頁版）
 * 佳士得風格分類導航，每頁 48 張，分頁導航
 * 卡片連結至 artwork/AW-XXXX.html 靜態頁
 */
(function () {
  'use strict';

  const CONFIG = { pageSize: 48 };

  const CATEGORY_NAMES = {
    all: '全部作品',
    'tea-leaves': '茶葉', 'tea-utensils': '茶器具', ceramics: '陶瓷',
    sculpture: '雕塑', 'scholar-objects': '文玩', bracelets: '手串',
    agarwood: '沉香', 'yixing-teapot': '紫砂壺', painting: '繪畫',
    antique: '古物', coral: '珊瑚', jade: '玉石', books: '書籍', other: '其他',
  };

  const state = { category: 'all', sort: 'default', layout: 'grid', page: 1, filtered: [] };

  const els = {
    grid: document.getElementById('grid-container'),
    categoryNav: document.getElementById('category-nav'),
    sortSelect: document.getElementById('sort-select'),
    resultCount: document.getElementById('result-count'),
    pageIndicator: document.getElementById('page-indicator'),
    pagination: document.getElementById('pagination'),
  };

  function init() {
    if (typeof ARTWORKS === 'undefined' || !ARTWORKS.length) {
      if (els.grid) els.grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">◯</div><div class="empty-state-text">尚無作品資料</div></div>';
      return;
    }
    // 從 URL 讀取 ?cat= 參數
    const urlCat = new URLSearchParams(window.location.search).get('cat');
    if (urlCat && CATEGORY_NAMES[urlCat]) state.category = urlCat;

    renderCategoryNav();
    applyFilters();
    bindEvents();
  }

  function renderCategoryNav() {
    const counts = {};
    ARTWORKS.forEach(function (a) { counts[a.category] = (counts[a.category] || 0) + 1; });
    const cats = Object.keys(counts).filter(function (c) { return counts[c] > 0; });
    cats.sort(function (a, b) {
      const ai = Object.keys(CATEGORY_NAMES).indexOf(a);
      const bi = Object.keys(CATEGORY_NAMES).indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1; if (bi === -1) return -1;
      return ai - bi;
    });
    let html = '<select class="cat-select" id="cat-select" aria-label="選擇分類">';
    html += '<option value="all">全部作品（' + ARTWORKS.length.toLocaleString() + '）</option>';
    cats.forEach(function (cat) {
      const name = CATEGORY_NAMES[cat] || cat;
      html += '<option value="' + cat + '"' + (cat === state.category ? ' selected' : '') + '>' + escapeHtml(name) + '（' + counts[cat].toLocaleString() + '）</option>';
    });
    html += '</select>';
    els.categoryNav.innerHTML = html;
  }

  function applyFilters() {
    state.page = 1;
    let items = state.category === 'all' ? ARTWORKS.slice() : ARTWORKS.filter(function (a) { return a.category === state.category; });
    items = sortItems(items, state.sort);
    state.filtered = items;
    renderPage();
  }

  function sortItems(items, sortType) {
    switch (sortType) {
      case 'random': return items.slice().sort(function () { return Math.random() - 0.5; });
      case 'id-asc': return items.slice().sort(function (a, b) { return a.id.localeCompare(b.id); });
      case 'id-desc': return items.slice().sort(function (a, b) { return b.id.localeCompare(a.id); });
      default: return items;
    }
  }

  function getTotalPages() { return Math.max(1, Math.ceil(state.filtered.length / CONFIG.pageSize)); }
  function getPageItems() {
    const start = (state.page - 1) * CONFIG.pageSize;
    return state.filtered.slice(start, start + CONFIG.pageSize);
  }

  function renderPage() {
    const totalPages = getTotalPages();
    if (state.page > totalPages) state.page = totalPages;
    const items = getPageItems();

    els.resultCount.textContent = state.filtered.length.toLocaleString() + ' 件作品';
    const startNum = state.filtered.length === 0 ? 0 : (state.page - 1) * CONFIG.pageSize + 1;
    const endNum = Math.min(state.page * CONFIG.pageSize, state.filtered.length);
    els.pageIndicator.textContent = '第 ' + startNum + '–' + endNum + ' 件';

    els.grid.innerHTML = '';
    if (items.length === 0) {
      els.grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">◯</div><div class="empty-state-text">此分類尚無作品</div></div>';
      els.pagination.innerHTML = '';
      return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach(function (artwork, idx) { fragment.appendChild(createCard(artwork, idx)); });
    els.grid.appendChild(fragment);
    renderPagination();
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function createCard(artwork, index) {
    const card = document.createElement('a');
    card.className = 'artwork-card';
    card.href = 'artwork/' + artwork.id + '.html';
    card.dataset.index = index;
    card.setAttribute('aria-label', artwork.title + ' (' + artwork.id + ')');
    const catName = CATEGORY_NAMES[artwork.category] || artwork.category;
    card.innerHTML =
      '<div class="artwork-image-wrap">' +
        '<span class="artwork-category-badge">' + catName + '</span>' +
        '<img class="artwork-image" data-src="' + artwork.thumb + '" alt="' + escapeHtml(artwork.title) + '" loading="lazy">' +
        '<div class="artwork-overlay">' +
          '<div class="artwork-overlay-info">' +
            '<div class="artwork-overlay-title">' + escapeHtml(artwork.title) + '</div>' +
            '<div class="artwork-overlay-id">' + artwork.id + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    lazyLoadImage(card.querySelector('.artwork-image'));
    return card;
  }

  function lazyLoadImage(img) {
    if (!img) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { loadImage(img); obs.unobserve(img); }
        });
      }, { rootMargin: '200px' });
      observer.observe(img);
    } else { loadImage(img); }
  }

  function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    const tempImg = new Image();
    tempImg.onload = function () {
      img.src = src; img.classList.add('loaded'); img.parentElement.classList.add('loaded');
    };
    tempImg.onerror = function () { img.parentElement.classList.add('loaded'); img.style.background = '#e7e5e4'; };
    tempImg.src = src;
  }

  function renderPagination() {
    const totalPages = getTotalPages();
    const current = state.page;
    if (totalPages <= 1) { els.pagination.innerHTML = ''; return; }
    let html = '';
    html += '<button class="page-btn page-nav-btn" data-page="' + (current - 1) + '" ' + (current === 1 ? 'disabled' : '') + ' aria-label="上一頁">&#8249;</button>';
    const pages = getPageNumbers(current, totalPages);
    pages.forEach(function (p) {
      if (p === '...') { html += '<span class="page-ellipsis">…</span>'; }
      else { html += '<button class="page-btn' + (p === current ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>'; }
    });
    html += '<button class="page-btn page-nav-btn" data-page="' + (current + 1) + '" ' + (current === totalPages ? 'disabled' : '') + ' aria-label="下一頁">&#8250;</button>';
    html += '<div class="page-info">第 ' + current + ' / ' + totalPages + ' 頁 · 每頁 ' + CONFIG.pageSize + ' 件</div>';
    els.pagination.innerHTML = html;
  }

  function getPageNumbers(current, total) {
    const delta = 2, range = [], rangeWithDots = [];
    let l;
    range.push(1);
    if (total <= 1) return range;
    for (let i = current - delta; i <= current + delta; i++) { if (i > 1 && i < total) range.push(i); }
    range.push(total);
    range.forEach(function (i) {
      if (l) { if (i - l === 2) { rangeWithDots.push(l + 1); } else if (i - l > 2) { rangeWithDots.push('...'); } }
      rangeWithDots.push(i); l = i;
    });
    return rangeWithDots;
  }

  function goToPage(page) {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;
    state.page = page; renderPage();
  }

  function bindEvents() {
    els.categoryNav.addEventListener('change', function (e) {
      if (e.target.classList.contains('cat-select')) { state.category = e.target.value; applyFilters(); }
    });
    if (els.sortSelect) {
      els.sortSelect.addEventListener('change', function (e) { state.sort = e.target.value; applyFilters(); });
    }
    document.querySelectorAll('.layout-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.layout-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.layout = btn.dataset.layout;
        if (state.layout === 'masonry') { els.grid.classList.add('masonry'); } else { els.grid.classList.remove('masonry'); }
      });
    });
    els.pagination.addEventListener('click', function (e) {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page)) goToPage(page);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();

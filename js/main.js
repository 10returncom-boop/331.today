/**
 * 三三藝 Grid Gallery - 主程式
 * 佳士得風格分類導航，每頁 48 張，分頁導航
 */

(function () {
  'use strict';

  // ===== 設定 =====
  const CONFIG = {
    pageSize: 48,
  };

  // 分類中文名稱對照（14 分類 + 全部）
  const CATEGORY_NAMES = {
    all: '全部作品',
    'tea-leaves': '茶葉',
    'tea-utensils': '茶器具',
    ceramics: '陶瓷',
    sculpture: '雕塑',
    'scholar-objects': '文玩',
    bracelets: '手串',
    agarwood: '沉香',
    'yixing-teapot': '紫砂壺',
    painting: '繪畫',
    antique: '古物',
    coral: '珊瑚',
    jade: '玉石',
    books: '書籍',
    other: '其他',
  };

  // ===== 狀態 =====
  const state = {
    category: 'all',
    sort: 'default',
    layout: 'grid',
    page: 1,
    filtered: [],
    displayed: [],
    lightboxIndex: -1,
  };

  // ===== DOM 參考 =====
  const els = {
    grid: document.getElementById('grid-container'),
    categoryNav: document.getElementById('category-nav'),
    sortSelect: document.getElementById('sort-select'),
    resultCount: document.getElementById('result-count'),
    pageIndicator: document.getElementById('page-indicator'),
    pagination: document.getElementById('pagination'),
    lightbox: document.getElementById('lightbox'),
    lightboxImage: document.getElementById('lightbox-image'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxId: document.getElementById('lightbox-id'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.getElementById('lightbox-prev'),
    lightboxNext: document.getElementById('lightbox-next'),
  };

  // ===== 初始化 =====
  function init() {
    if (typeof ARTWORKS === 'undefined' || !ARTWORKS.length) {
      els.grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">◯</div><div class="empty-state-text">尚無作品資料，請將圖片放入 import/ 資料夾後執行 build-gallery.ps1</div></div>';
      return;
    }

    renderCategoryNav();
    applyFilters();
    bindEvents();
  }

  // ===== 動態產生分類導航 =====
  function renderCategoryNav() {
    // 計算各分類數量
    const counts = {};
    ARTWORKS.forEach(function (a) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    let html = '';

    // 全部作品
    html += '<button class="cat-nav-item active" data-category="all">' +
      '<span class="cat-nav-name">全部作品</span>' +
      '<span class="cat-nav-count">' + ARTWORKS.length.toLocaleString() + '</span>' +
      '</button>';

    // 遍歷預定義分類（固定順序，0件也顯示）
    Object.keys(CATEGORY_NAMES).forEach(function (cat) {
      if (cat === 'all') return;
      const name = CATEGORY_NAMES[cat];
      const count = counts[cat] || 0;
      html += '<button class="cat-nav-item' + (count === 0 ? ' is-empty' : '') + '" data-category="' + cat + '">' +
        '<span class="cat-nav-name">' + escapeHtml(name) + '</span>' +
        '<span class="cat-nav-count">' + count.toLocaleString() + '</span>' +
        '</button>';
    });

    els.categoryNav.innerHTML = html;
  }

  // ===== 篩選與排序 =====
  function applyFilters() {
    state.page = 1;

    // 篩選
    let items = state.category === 'all'
      ? ARTWORKS.slice()
      : ARTWORKS.filter(function (a) { return a.category === state.category; });

    // 排序
    items = sortItems(items, state.sort);

    state.filtered = items;
    renderPage();
  }

  function sortItems(items, sortType) {
    switch (sortType) {
      case 'random':
        return items.slice().sort(function () { return Math.random() - 0.5; });
      case 'id-asc':
        return items.slice().sort(function (a, b) { return a.id.localeCompare(b.id); });
      case 'id-desc':
        return items.slice().sort(function (a, b) { return b.id.localeCompare(a.id); });
      default:
        return items;
    }
  }

  // ===== 分頁資訊 =====
  function getTotalPages() {
    return Math.max(1, Math.ceil(state.filtered.length / CONFIG.pageSize));
  }

  function getPageItems() {
    const start = (state.page - 1) * CONFIG.pageSize;
    const end = start + CONFIG.pageSize;
    return state.filtered.slice(start, end);
  }

  // ===== 渲染頁面 =====
  function renderPage() {
    const totalPages = getTotalPages();
    if (state.page > totalPages) state.page = totalPages;

    const items = getPageItems();
    state.displayed = items;

    // 更新計數與頁碼指示
    els.resultCount.textContent = state.filtered.length.toLocaleString() + ' 件作品';
    const startNum = state.filtered.length === 0 ? 0 : (state.page - 1) * CONFIG.pageSize + 1;
    const endNum = Math.min(state.page * CONFIG.pageSize, state.filtered.length);
    els.pageIndicator.textContent = '第 ' + startNum + '–' + endNum + ' 件';

    // 渲染 Grid
    els.grid.innerHTML = '';

    if (items.length === 0) {
      els.grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">◯</div><div class="empty-state-text">此分類尚無作品</div></div>';
      els.pagination.innerHTML = '';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(function (artwork, idx) {
      const card = createCard(artwork, idx);
      fragment.appendChild(card);
    });
    els.grid.appendChild(fragment);

    // 渲染分頁
    renderPagination();

    // 捲動至圖庫頂部
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== 建立作品卡片 =====
  function createCard(artwork, index) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    card.dataset.index = index;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
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

    card.addEventListener('click', function () {
      openLightbox(index);
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });

    return card;
  }

  // ===== 懶加載 =====
  function lazyLoadImage(img) {
    if (!img) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadImage(img);
            obs.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
      observer.observe(img);
    } else {
      loadImage(img);
    }
  }

  function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    const tempImg = new Image();
    tempImg.onload = function () {
      img.src = src;
      img.classList.add('loaded');
      img.parentElement.classList.add('loaded');
    };
    tempImg.onerror = function () {
      img.parentElement.classList.add('loaded');
      img.style.background = '#e7e5e4';
    };
    tempImg.src = src;
  }

  // ===== 分頁導航 =====
  function renderPagination() {
    const totalPages = getTotalPages();
    const current = state.page;

    if (totalPages <= 1) {
      els.pagination.innerHTML = '';
      return;
    }

    let html = '';

    // 上一頁
    html += '<button class="page-btn page-nav-btn" data-page="' + (current - 1) + '" ' +
      (current === 1 ? 'disabled' : '') + ' aria-label="上一頁">&#8249;</button>';

    // 頁碼邏輯：顯示首頁、末頁、當前頁前後各 2 頁，中間用省略號
    const pages = getPageNumbers(current, totalPages);

    pages.forEach(function (p) {
      if (p === '...') {
        html += '<span class="page-ellipsis">…</span>';
      } else {
        html += '<button class="page-btn' + (p === current ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
      }
    });

    // 下一頁
    html += '<button class="page-btn page-nav-btn" data-page="' + (current + 1) + '" ' +
      (current === totalPages ? 'disabled' : '') + ' aria-label="下一頁">&#8250;</button>';

    // 頁碼資訊
    html += '<div class="page-info">第 ' + current + ' / ' + totalPages + ' 頁 · 每頁 ' + CONFIG.pageSize + ' 件</div>';

    els.pagination.innerHTML = html;
  }

  function getPageNumbers(current, total) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    if (total <= 1) return range;

    for (let i = current - delta; i <= current + delta; i++) {
      if (i > 1 && i < total) range.push(i);
    }
    range.push(total);

    range.forEach(function (i) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }

  function goToPage(page) {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;
    state.page = page;
    renderPage();
  }

  // ===== Lightbox =====
  function openLightbox(index) {
    if (index < 0 || index >= state.displayed.length) return;

    state.lightboxIndex = index;
    updateLightbox();
    els.lightbox.classList.add('active');
    els.lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    els.lightbox.classList.remove('active');
    els.lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.lightboxIndex = -1;
  }

  function updateLightbox() {
    const artwork = state.displayed[state.lightboxIndex];
    if (!artwork) return;

    els.lightboxImage.src = artwork.full;
    els.lightboxImage.alt = artwork.title;
    els.lightboxTitle.textContent = artwork.title;
    els.lightboxId.textContent = artwork.id + ' · ' + (CATEGORY_NAMES[artwork.category] || artwork.category);
  }

  function lightboxPrev() {
    if (state.lightboxIndex > 0) {
      state.lightboxIndex--;
      updateLightbox();
    }
  }

  function lightboxNext() {
    if (state.lightboxIndex < state.displayed.length - 1) {
      state.lightboxIndex++;
      updateLightbox();
    }
  }

  // ===== 事件綁定 =====
  function bindEvents() {
    // 分類導航
    els.categoryNav.addEventListener('click', function (e) {
      const item = e.target.closest('.cat-nav-item');
      if (!item) return;

      els.categoryNav.querySelectorAll('.cat-nav-item').forEach(function (b) { b.classList.remove('active'); });
      item.classList.add('active');
      state.category = item.dataset.category;
      applyFilters();
    });

    // 排序
    els.sortSelect.addEventListener('change', function (e) {
      state.sort = e.target.value;
      applyFilters();
    });

    // 顯示模式切換
    document.querySelectorAll('.layout-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.layout-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.layout = btn.dataset.layout;

        if (state.layout === 'masonry') {
          els.grid.classList.add('masonry');
        } else {
          els.grid.classList.remove('masonry');
        }
      });
    });

    // 分頁點擊
    els.pagination.addEventListener('click', function (e) {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page)) {
        goToPage(page);
      }
    });

    // Lightbox
    els.lightboxClose.addEventListener('click', closeLightbox);
    els.lightboxPrev.addEventListener('click', lightboxPrev);
    els.lightboxNext.addEventListener('click', lightboxNext);

    els.lightbox.addEventListener('click', function (e) {
      if (e.target === els.lightbox) closeLightbox();
    });

    // 鍵盤導航
    document.addEventListener('keydown', function (e) {
      if (!els.lightbox.classList.contains('active')) return;
      switch (e.key) {
        case 'Escape': closeLightbox(); break;
        case 'ArrowLeft': lightboxPrev(); break;
        case 'ArrowRight': lightboxNext(); break;
      }
    });

    // 觸控滑動
    let touchStartX = 0;
    els.lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    els.lightbox.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) lightboxNext(); else lightboxPrev();
      }
    }, { passive: true });
  }

  // ===== 工具 =====
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== 啟動 =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

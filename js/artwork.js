/**
 * 三三藝 - 作品詳情頁
 */
(function () {
  'use strict';

  // 分類中文名稱
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

  // 取得 URL 參數
  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // HTML 跳脫
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // 渲染文章段落
  function renderArticle(text) {
    if (!text) return '<p style="color:#999;">作品介紹撰寫中…</p>';
    return text.split('\n\n').map(function (p) {
      return '<p>' + escapeHtml(p.trim()) + '</p>';
    }).join('');
  }

  // 相關作品（同分類）
  function getRelated(artwork, count) {
    if (!window.ARTWORKS) return [];
    return window.ARTWORKS
      .filter(function (a) { return a.category === artwork.category && a.id !== artwork.id; })
      .slice(0, count);
  }

  // 主渲染
  function render() {
    var id = getParam('id');
    if (!id || !window.ARTWORKS) {
      document.getElementById('artwork-layout').innerHTML = '<p style="color:#999;">找不到作品。</p>';
      return;
    }

    var artwork = window.ARTWORKS.find(function (a) { return a.id === id; });
    if (!artwork) {
      document.getElementById('artwork-layout').innerHTML = '<p style="color:#999;">找不到作品 ' + escapeHtml(id) + '。</p>';
      return;
    }

    var article = window.ARTICLES && window.ARTICLES[id] ? window.ARTICLES[id] : null;
    var catName = CATEGORY_NAMES[artwork.category] || artwork.category;
    var title = article && article.title ? article.title : catName + '作品 ' + artwork.id;
    var articleText = article ? article.content : '';
    var related = getRelated(artwork, 4);

    var html = '';

    // 左欄：大圖
    html += '<div class="artwork-image-col">';
    html += '<img src="' + escapeHtml(artwork.full) + '" alt="' + escapeHtml(title) + '" class="artwork-main-image" loading="eager">';
    html += '</div>';

    // 右欄：資訊與文章
    html += '<div class="artwork-info-col">';
    html += '<span class="artwork-category">' + escapeHtml(catName) + '</span>';
    html += '<h1 class="artwork-title">' + escapeHtml(title) + '</h1>';
    html += '<div class="artwork-id">作品編號：' + escapeHtml(artwork.id) + '</div>';
    html += '<div class="artwork-article">' + renderArticle(articleText) + '</div>';

    // 相關作品
    if (related.length > 0) {
      html += '<hr class="artwork-divider">';
      html += '<div class="related-section">';
      html += '<h2 class="related-title">相關作品</h2>';
      html += '<div class="related-grid">';
      related.forEach(function (r) {
        var rTitle = window.ARTICLES && window.ARTICLES[r.id] && window.ARTICLES[r.id].title
          ? window.ARTICLES[r.id].title
          : catName + ' ' + r.id;
        html += '<a href="artwork.html?id=' + encodeURIComponent(r.id) + '" class="related-item">';
        html += '<img src="' + escapeHtml(r.thumb) + '" alt="' + escapeHtml(rTitle) + '" class="related-thumb" loading="lazy">';
        html += '<div class="related-name">' + escapeHtml(rTitle) + '</div>';
        html += '</a>';
      });
      html += '</div></div>';
    }

    html += '</div>';

    document.getElementById('artwork-layout').innerHTML = html;
    document.title = title + ' - 三三藝 331 Gallery';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();

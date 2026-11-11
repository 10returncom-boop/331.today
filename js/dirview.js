/* 331.today 目錄瀏覽：header 下拉（megamenu）與側欄（sidetree）共用同一個 tab page 區塊 */
(function () {
  var page, title, grid, count, crumb;

  function q(id) { return document.getElementById(id); }

  function ensure() {
    page = page || q('dirPage');
    title = title || q('dirTitle');
    grid = grid || q('dirGrid');
    count = count || q('dirCount');
    crumb = crumb || q('crumbCur');
    return !!page;
  }

  function showPage() {
    ensure();
    document.querySelectorAll('main.container').forEach(function (m) {
      if (m !== page) m.style.display = 'none';
    });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
    page.style.display = '';
    var tabsBar = document.querySelector('.tabs');
    if (tabsBar) tabsBar.scrollIntoView({ block: 'start' });
    if (crumb) crumb.textContent = title.textContent;
  }

  function nodeOf(slug) {
    var T = window.MEGA_TREE || { levels: [] };
    for (var i = 0; i < T.levels.length; i++) {
      if (T.levels[i].slug === slug) return T.levels[i];
    }
    return null;
  }

  /* L1 大類：帶出下一層（10 個內層卡片） */
  function openLevel(slug) {
    var n = nodeOf(slug);
    if (!n || !ensure()) return;
    showPage();
    title.textContent = n.label;
    if (count) count.textContent = (n.count || 0) + ' 件';
    grid.dataset.l1 = slug;
    var h = '';
    n.children.forEach(function (c) {
      h += '<a class="dir-tile" href="javascript:void(0)" data-dir="' + c.dir +
        '"' + (c.tab ? ' data-tab="' + c.tab + '"' : '') +
        ' data-label="' + n.label + ' · ' + c.label + '" data-l1="' + slug + '">' +
        '<span class="dt-name">' + c.label + '</span>' +
        '<span class="dt-cnt">' + (c.count || 0) + ' 件</span></a>';
    });
    grid.innerHTML = h || '<div class="cat-bar-text">尚無子分類</div>';
  }

  /* 內層：縮圖牆 */
  function openDir(label, dir, l1) {
    if (!ensure()) return;
    showPage();
    title.textContent = label;
    if (count) count.textContent = '';
    grid.dataset.l1 = l1 || '';
    grid.innerHTML = '<div class="cat-bar-text">載入中…</div>';
    window.loadDirFiles(dir, function (files) {
      if (!files.length) {
        grid.innerHTML = '<div class="cat-bar-text">此分類尚無圖片</div>';
        if (count) count.textContent = '0 件';
        return;
      }
      if (count) count.textContent = files.length + ' 件';
      grid.innerHTML = files.slice(0, 400).map(function (f) {
        return '<a class="cat-cell" href="' + dir + encodeURIComponent(f) + '" target="_blank">' +
          '<img loading="lazy" src="' + dir + encodeURIComponent(f) + '" alt="' + f + '"></a>';
      }).join('');
    });
  }

  function goBack() {
    if (!ensure()) return;
    var l1 = grid.dataset.l1;
    if (l1) { openLevel(l1); return; }
    page.style.display = 'none';
    var t = document.querySelector('.tab[data-page="ceramic"]');
    if (t) t.click();
  }

  document.addEventListener('click', function (e) {
    var tile = e.target.closest ? e.target.closest('#dirGrid .dir-tile') : null;
    if (tile) {
      e.preventDefault();
      var t2 = tile.getAttribute('data-tab');
      if (t2) {
        if (window.switchPage) {
          window.switchPage(t2);
          var tb2 = document.querySelector('.tabs');
          if (tb2) tb2.scrollIntoView({ block: 'start' });
        }
        return;
      }
      openDir(tile.getAttribute('data-label'), tile.getAttribute('data-dir'), tile.getAttribute('data-l1'));
      return;
    }
    if (e.target.id === 'dirBack') { e.preventDefault(); goBack(); }
  });

  window.DIRVIEW = { openLevel: openLevel, openDir: openDir, back: goBack };
})();

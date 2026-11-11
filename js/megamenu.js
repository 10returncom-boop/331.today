/* 331.today 分類導覽：文字選單列 + 該類下方窄面板（單欄密排） */
(function () {
  var TREE = window.MEGA_TREE || { levels: [] };
  var panel = document.getElementById('catMega');
  var items = document.querySelectorAll('.cat-item');
  var hideTimer = null;
  var cur = null;

  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'catMega';
    document.body.appendChild(panel);
  }

  function listHTML(node) {
    var h = '';
    node.tabs.forEach(function (t) {
      h += '<a class="cm-link cm-tab" href="javascript:' + t.action + '">' + t.label + '</a>';
    });
    node.children.forEach(function (c) {
      var href = c.tab ? ("javascript:switchPage('" + c.tab + "')") : 'javascript:void(0)';
      h += '<a class="cm-link cm-dir' + (c.count ? '' : ' is-zero') +
        '" href="' + href + '" data-dir="' + c.dir + '" data-l1="' + node.slug +
        '"' + (c.tab ? ' data-tab="' + c.tab + '"' : '') +
        ' data-label="' + node.label + ' · ' + c.label + '">' + c.label +
        '<span class="cm-cnt">' + (c.count || 0) + '</span></a>';
    });
    if (!h) h = '<div class="cm-empty">尚無藏品</div>';
    return h;
  }

  function open(node, el) {
    clearTimeout(hideTimer);
    var same = cur === node.slug;
    panel.innerHTML = listHTML(node);
    panel.classList.add('open');
    var r = el.getBoundingClientRect();
    var w = panel.offsetWidth || 220;
    var left = Math.min(r.left, window.innerWidth - w - 12);
    panel.style.left = Math.max(8, left) + 'px';
    /* 導覽已移出 header：面板貼著該類文字下緣展開 */
    panel.style.top = Math.round(Math.max(8, r.bottom + 6)) + 'px';
    cur = node.slug;
    items.forEach(function (i) {
      i.classList.toggle('active', i.getAttribute('data-l1') === node.slug);
    });
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 160);
  }

  function hide() {
    panel.classList.remove('open');
    cur = null;
    items.forEach(function (i) { i.classList.remove('active'); });
  }

  items.forEach(function (item) {
    var slug = item.getAttribute('data-l1');
    var node = null;
    /* tabs 列的「分類目錄」dropdown 有自己的處理，這裡不重複綁 */
    if (item.closest('#catsMenu')) return;
    TREE.levels.forEach(function (n) { if (n.slug === slug) node = n; });
    /* 該大類尚無任何照片 → 先 disable（灰階 + 無法點/hover） */
    if (!node || !node.count) {
      item.classList.add('is-off');
      item.setAttribute('aria-disabled', 'true');
      return;
    }
    var inTabs = !!(item.closest && item.closest('.cats-in-tabs'));
    if (inTabs) {
      /* tabs 區：點擊即切換 dropdown（點同一類別再點一次收回） */
      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        panel.dataset.clickMode = '1';
        if (cur === slug && panel.classList.contains('open')) { hide(); return; }
        open(node, item);
      });
    } else {
      item.addEventListener('mouseenter', function () { open(node, item); });
      item.addEventListener('mouseleave', scheduleHide);
      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        /* 點 L1：帶出下一層（改用 tab page 區呈現，與側欄同一套） */
        hide();
        if (window.DIRVIEW) window.DIRVIEW.openLevel(slug);
      });
    }
  });
  panel.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
  panel.addEventListener('mouseleave', function () { if (!panel.dataset.clickMode) scheduleHide(); });
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && !e.target.closest('.cat-item')) hide();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

  /* 內層縮圖牆：統一交給 DIRVIEW（tab page 區），不再開 #catView 遮罩 */
  panel.addEventListener('click', function (e) {
    var link = e.target.closest('.cm-dir');
    if (!link) return;
    e.preventDefault();
    var tab = link.getAttribute('data-tab');
    hide();
    /* 有 tab 對應的分類：直接切到該 tab 頁（例如豐子汝窯 → 有價格的 fengzi 頁） */
    if (tab) {
      if (window.switchPage) {
        window.switchPage(tab);
        var tb = document.querySelector('.tabs');
        if (tb) tb.scrollIntoView({ block: 'start' });
      }
      return;
    }
    if (window.DIRVIEW) {
      window.DIRVIEW.openDir(link.getAttribute('data-label'),
        link.getAttribute('data-dir'), link.getAttribute('data-l1'));
    }
  });
})();

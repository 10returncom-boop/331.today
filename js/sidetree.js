/* 331.today 左側 sidebar 樹狀目錄（10 大類 → 內層） */
(function () {
  var TREE = window.MEGA_TREE || { levels: [] };
  var btn = document.getElementById('sideBtn');
  var panel = document.getElementById('sideTree');
  var mask = document.getElementById('sideMask');
  if (!panel) return;

  /* header 的 backdrop-filter 會把 fixed 子元素當成 relative 容器，這裡改掛到 body */
  if (panel.parentElement && panel.parentElement.closest('.site-header')) {
    document.body.appendChild(panel);
  }
  if (mask && mask.closest('.site-header')) document.body.appendChild(mask);

  var built = false;

  function build() {
    if (built) return;
    var html = '<div class="st-head"><span class="st-title">藏品目錄</span>' +
      '<button class="st-close" type="button" aria-label="關閉">×</button></div>' +
      '<div class="st-body">';
    TREE.levels.forEach(function (n) {
      html += '<div class="st-node" data-l1="' + n.slug + '">' +
        '<div class="st-row st-l1"><span class="st-caret">▸</span>' +
        '<span class="st-name">' + n.label + '</span>' +
        '<span class="st-cnt">' + n.count + '</span></div><div class="st-kids">';
      n.tabs.forEach(function (t) {
        html += '<a class="st-row st-l2 st-tab" href="javascript:' + t.action + '">' +
          '<span class="st-name">' + t.label + '</span><span class="st-cnt">頁</span></a>';
      });
      n.children.forEach(function (c) {
        html += '<a class="st-row st-l2 st-dir' + (c.count ? '' : ' is-zero') +
          '" href="javascript:void(0)" data-dir="' + c.dir + '" data-label="' +
          n.label + ' · ' + c.label + '"><span class="st-name">' + c.label +
          '</span><span class="st-cnt">' + (c.count || 0) + '</span></a>';
      });
      html += '</div></div>';
    });
    html += '</div>';
    panel.innerHTML = html;
    built = true;

    panel.querySelectorAll('.st-l1').forEach(function (row) {
      row.addEventListener('click', function () {
        var node = row.parentElement;
        var open = node.classList.contains('open');
        panel.querySelectorAll('.st-node').forEach(function (x) { x.classList.remove('open'); });
        if (!open) node.classList.add('open');
      });
    });
    panel.querySelectorAll('.st-dir').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var node = a.closest('.st-node');
        openGrid(a.getAttribute('data-label'), a.getAttribute('data-dir'),
          node ? node.getAttribute('data-l1') : '');
      });
    });
    panel.querySelector('.st-close').addEventListener('click', hide);
  }

  /* 內層縮圖牆：與 header 下拉共用 DIRVIEW，呈現在 tab page 區 */
  function openGrid(label, dir, l1) {
    hide();
    if (window.DIRVIEW) window.DIRVIEW.openDir(label, dir, l1);
  }

  /* 「← 返回」由 DIRVIEW 統一處理（L1 內層 → 回上層清單，否則回分頁） */

  function show() { build(); panel.classList.add('open'); if (mask) mask.classList.add('open'); }
  function hide() { panel.classList.remove('open'); if (mask) mask.classList.remove('open'); }

  if (btn) btn.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.contains('open') ? hide() : show();
  });
  if (mask) mask.addEventListener('click', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
})();

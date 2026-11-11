/* tabs 列的「分類目錄」dropdown：點開列出 11 大類，選一個就切到該類下一層 */
(function () {
  var btn = document.getElementById('catsBtn');
  var menu = document.getElementById('catsMenu');
  if (!btn || !menu) return;

  function close() {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var isOpen = menu.classList.contains('open');
    if (isOpen) { close(); return; }
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  });

  menu.addEventListener('click', function (e) {
    var item = e.target.closest('.cat-item');
    if (!item || item.classList.contains('is-off')) return;
    e.preventDefault();
    var slug = item.getAttribute('data-l1');
    close();
    if (window.DIRVIEW && slug) window.DIRVIEW.openLevel(slug);
  });

  document.addEventListener('click', function (e) {
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

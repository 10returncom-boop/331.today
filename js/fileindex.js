/* 取得某分類的檔案清單：優先 window.FILE_INDEX（離線 file:// 也能用），其次 fetch */
window.loadDirFiles = function (dir, cb) {
  if (window.FILE_INDEX && window.FILE_INDEX[dir]) { cb(window.FILE_INDEX[dir]); return; }
  if (window.FILE_INDEX) { cb([]); return; }
  var s = document.createElement('script');
  s.src = './images/_fileindex.js?v=20261111b';
  s.onload = function () {
    cb((window.FILE_INDEX && window.FILE_INDEX[dir]) || []);
  };
  s.onerror = function () { cb([]); };
  document.head.appendChild(s);
};

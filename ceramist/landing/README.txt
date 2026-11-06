331.today 陶藝家 Landing Page 版型範本（5 套）
================================================

位於 ceramist/landing/ 下，共 5 套不同版型，皆為純 HTML/CSS/JS 單檔、UTF-8 繁中、
含 SEO meta 與 JSON-LD，可直接部署至靜態主機（如 GitHub Pages），未來包入 331.today portal。

版型清單
--------
01-minimal    留白・新東方極簡   青瓷灰綠＋米白紙色，單欄留白、博物館質感。
02-shaozai    柴燒・土火質樸    深褐＋陶紅＋米褐，火紋質感、含「製程時間軸」。
03-gallery    畫廊・深色沉浸    近黑背景、作品大圖網格、懸浮圖說、含「展覽」單元。
04-editorial  誌・編輯式        報紙感、首字放大、引言、兩欄、含「創作歷程時間軸」。
05-modern     侘寂・現代輕盈    石色＋青綠、卡片、滾動揭示、作品集「分類篩選」互動。
06-mega-dark  暗夜・科技沉浸    深色玻璃＋青紫漸層光暈，含「Mega Menu 大型下拉」與「Breadcrumb 麵包屑」。
07-mega-clear 琉璃・透光現代    非對稱版面＋透光玻璃，含「Mega Menu」與「Breadcrumb」，兩顆 CTA 按鈕。
08-side       垂直側欄・編輯式   左側固定深綠垂直側欄（編號導覽）＋右側主欄，含 Breadcrumb，行動端收折為頂欄。
09-handcraft  手繪・工藝插畫    米白紙底＋紙膠帶＋拍立得卡片＋虛線框，旋轉錯落、工藝日記手感。
10-poster     海報・大排印      超大直排標題（火與釉）＋色塊＋直排文字，作品改「整列交錯」海報式陳列。

Mega Menu / Breadcrumb（06、07 專屬）
-------------------------------------
- 桌面：游標移至「作品集」即展開大型下拉面板（青瓷／柴燒／器型三欄＋本季特展卡）。
- 行動：點漢堡選單展開垂直導覽，點「作品集」可再展開子選單。
- Breadcrumb：頁頂「首頁 › 陶藝家 › 窯名 › 作品集」，連結為錨點；套用時可改成真實相對路徑。
- 06 與 07 的「本季特展」連結用 REPLACE-LINK 取代。

套用方式
--------
1. 複製任一資料夾到目標藝術家資料夾（如 ceramist/王某某/），保留 index.html。
2. 搜尋該檔內「REPLACE-」開頭的替換點，逐一取代：
     REPLACE-NAME      藝術家姓名
     REPLACE-KILN      窯名／工作室
     REPLACE-SUB       一句定位語
     REPLACE-THEME     主題介紹段落
     REPLACE-BIO       藝術家簡介段落
     REPLACE-EMAIL     聯絡 Email
     REPLACE-PORTRAIT  大頭照路徑
     REPLACE-WORKxx    作品圖路徑
     REPLACE-LINK      展覽連結（03-gallery 專用）
3. 每套開頭皆有一段「範本說明」註解，列出該版的替換點。

圖片路徑統一規範（WebP）
------------------------
建議把圖片放在目標藝術家資料夾下的 assets/，檔名如下（皆為 .webp）：
    hero.webp        主視覺／Hero（04、03 使用）
    portrait.webp    大頭照（3:4 直式）
    work-01.webp …   作品圖（1:1 方圖，最多 work-06.webp）
佔位圖框會顯示預期路徑；放入實際圖片後，取代對應的 assets/xxx.webp 即可，
無需更動版面。請以 WebP 格式提供以符合站內規範。

備註
----
- 現有頁面內容為「示範佔位」文字（藝術家「林青禾」、窯名「青禾窯」皆為虛構），
  正式套用時務必以各藝術家真實內容取代。
- 05-modern 作品集支援分類篩選，新增作品時在 <figure> 加 data-cat 屬性即可。

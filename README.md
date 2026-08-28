# 三三藝 Grid 圖庫

> Grid Navigation Gallery — 以網格導航瀏覽藝術作品

## 專案簡介

三三藝 Grid 圖庫是一個輕量級的純靜態圖庫網站，支援網格/瀑布流雙模式、分類篩選、排序、無限捲動與 Lightbox 大圖檢視。

## 功能特性

- **佳士得式分類導航**：13 大分類 + 全部作品，底線標示當前分類
- **雙顯示模式**：正方形 Grid（1:1 置中裁切）與瀑布流（保留原比例）
- **排序方式**：預設、隨機、編號遞增/遞減
- **分頁導航**：每頁 48 張，頁碼導航列（首末頁 + 當前前後 2 頁 + 省略號）
- **Lightbox**：點擊作品開啟大圖，支援鍵盤左右鍵與 ESC 關閉、手機滑動切換
- **懶加載**：圖片進入視窗前 200px 才開始載入，節省頻寬
- **響應式設計**：手機 2 欄 / 平板 3 欄 / 筆電 4 欄 / 桌面 5 欄
- **無框架依賴**：純 HTML + CSS + Vanilla JS，無需建置步驟

## 目錄結構

```
三三藝gird圖庫/
├── index.html          # 主頁面
├── build-gallery.ps1   # 自動建置腳本
├── css/
│   └── style.css       # 樣式表
├── js/
│   ├── data.js         # 作品資料（自動生成）
│   └── main.js         # 圖庫邏輯
├── images/
│   ├── thumbs/         # 縮圖（600×600 WebP）
│   └── full/           # 大圖（最長邊 1920 WebP）
├── import/             # 圖片匯入資料夾（放入圖片後執行 build）
│   └── README.md       # 匯入說明
└── README.md
```

## 作品資料

- 總計：**3,439** 件作品
- 13 大分類分布（每類約 264–265 件）：

| 分類 | 數量 |
|------|------|
| 茶葉 (tea-leaves) | 265 |
| 茶器具 (tea-utensils) | 265 |
| 陶瓷 (ceramics) | 265 |
| 雕塑 (sculpture) | 265 |
| 文玩 (scholar-objects) | 265 |
| 手串 (bracelets) | 265 |
| 沉香 (agarwood) | 265 |
| 紫砂壺 (yixing-teapot) | 264 |
| 繪畫 (painting) | 264 |
| 古物 (antique) | 264 |
| 珊瑚 (coral) | 264 |
| 玉石 (jade) | 264 |
| 其他 (other) | 264 |

## 使用方式

### 自動建置（推薦）

1. 將圖片放入 `import/` 資料夾（可按分類建立子目錄，或直接 flat 存放）
2. 執行建置腳本：
   ```powershell
   .\build-gallery.ps1
   ```
3. 重新整理瀏覽器即可看到更新

腳本會自動：
- 掃描 `import/` 中的圖片（jpg, png, webp, gif, bmp, tiff）
- 依子目錄名稱或檔名關鍵字自動分類
- 複製至 `images/full/` 與 `images/thumbs/`，自動編號 AW-XXXX
- 產生 `js/data.js`，分類導航由前端動態生成

詳細分類規則請見 `import/README.md`。

### 直接開啟

直接以瀏覽器開啟 `index.html` 即可，無需伺服器。

若需透過 HTTP 伺服器提供（建議用於正式環境）：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

然後訪問 `http://localhost:8080`。

## 圖片來源

圖片透過 Windows 目錄連結（Junction）指向 `331gallery/public/images/`，避免重複儲存。若需獨立部署，請將 `images/thumbs/` 與 `images/full/` 實際複製到本目錄。

## 技術規格

| 項目 | 規格 |
|------|------|
| 縮圖尺寸 | 600×600 px（1:1 置中裁切，WebP） |
| 大圖尺寸 | 最長邊 1920 px（保留原比例，WebP） |
| 每頁顯示 | 48 張 |
| 分頁模式 | 頁碼導航（首末頁 + 當前前後 2 頁 + 省略號） |
| 瀏覽器支援 | Chrome / Firefox / Safari / Edge 現代版本 |

## 鍵盤操作

| 按鍵 | 功能 |
|------|------|
| `←` / `→` | Lightbox 上一張 / 下一張 |
| `Esc` | 關閉 Lightbox |
| `Enter` / `Space` | 開啟選取的作品 |

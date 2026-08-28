# import/  —  圖片匯入資料夾

將圖片放入此資料夾，然後在專案根目錄執行 `.\build-gallery.ps1`，即可自動分類並建置 Grid 圖庫。

## 使用方式

### 方式一：依子目錄分類（推薦）

在 `import/` 下建立分類子目錄，將圖片放入對應目錄：

```
import/
├── 陶瓷/
│   ├── img_001.jpg
│   └── img_002.png
├── 紫砂壺/
│   ├── zisha_01.webp
│   └── zisha_02.jpg
├── 雕塑/
│   └── ...
├── 玉石/
│   └── ...
└── 其他/
    └── ...
```

支援的分類名稱（子目錄名）：

| 子目錄名稱 | 分類 |
|-----------|------|
| 茶葉 | tea-leaves |
| 茶器具 / 茶器 / 茶杯 | tea-utensils |
| 陶瓷 / 陶藝 / 花器 | ceramics |
| 雕塑 | sculpture |
| 文玩 | scholar-objects |
| 手串 | bracelets |
| 沉香 | agarwood |
| 紫砂壺 / 茶壺 | yixing-teapot |
| 繪畫 | painting |
| 古物 | antique |
| 珊瑚 | coral |
| 玉石 / 玉器 / 翡翠 | jade |
| 書籍 / 畫冊 / 古籍 | books |
| 其他 / 植栽 / 空間 | other |

### 方式二：Flat 結構（檔名自動辨識）

直接將圖片放在 `import/` 根目錄，腳本會依檔名關鍵字自動分類：

```
import/
├── 紫砂壺_001.jpg      → 紫砂壺
├── 陶瓷_作品A.png      → 陶瓷
├── 玉石_翡翠01.webp    → 玉石
└── unknown.jpg         → 其他
```

檔名中包含上述分類關鍵字即自動歸類，否則歸入「其他」。

## 速度最佳化

建置腳本自動使用 ImageMagick 進行最佳化：

| 輸出 | 尺寸 | 格式 | 品質 |
|------|------|------|------|
| 大圖 (full) | 最長邊 ≤ 1920px | WebP | 85% |
| 縮圖 (thumbs) | 600×600 置中裁切 | WebP | 82% |

- 所有新增圖片自動轉換為 WebP（較 JPG 小 25-35%，較 PNG 小 50-80%）
- 縮圖專為 Grid 顯示最佳化，大幅減少首屏載入量
- 前端已啟用 IntersectionObserver 懶加載，圖片進入視窗前 200px 才載入
- 若系統未安裝 ImageMagick，則降級為直接複製原檔

## 建置指令

```powershell
# 增量建置（只處理新圖片或已變更的圖片）
.\build-gallery.ps1
```

建置完成後，重新整理瀏覽器即可看到更新。

> 如需完全重建，刪除 `js\.build-manifest.json` 後再執行即可。

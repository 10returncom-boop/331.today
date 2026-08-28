#Requires -Version 5.1
<#
.SYNOPSIS
  三三藝 Grid Gallery 自動建置腳本
  將 import/ 資料夾中的圖片自動分類並建置 Grid 圖庫。

.DESCRIPTION
  1. 掃描 import/ 資料夾中的圖片（jpg, jpeg, png, webp, gif, bmp, tiff）
  2. 自動分類：
     - 優先：子目錄名稱（import/陶瓷/xxx.jpg → 陶瓷）
     - 其次：檔名前綴關鍵字（紫砂壺_001.jpg → 紫砂壺）
     - 預設：其他
  3. 複製至 images/full/ 與 images/thumbs/，自動編號 AW-XXXX
  4. 合併既有資料，產生 js/data.js
  5. 分類導航由前端 JS 根據 data.js 動態生成

.USAGE
  1. 將圖片放入 import/ 資料夾（建議按分類建立子目錄）
  2. 在專案根目錄執行：.\build-gallery.ps1
  3. 重新整理瀏覽器即可看到更新

.EXAMPLE
  # 基本使用
  .\build-gallery.ps1

  # 重新掃描全部（忽略已處理紀錄）
  .\build-gallery.ps1 -Rebuild
#>

param()

$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$importDir = Join-Path $base 'import'
$fullDir = Join-Path $base 'images\full'
$thumbDir = Join-Path $base 'images\thumbs'
$dataFile = Join-Path $base 'js\data.js'
$manifestFile = Join-Path $base 'js\.build-manifest.json'

# 支援的圖片副檔名
$imageExts = @('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif')

# 中文分類名 → 英文 key 對照
$categoryMap = @{
  '茶葉'       = 'tea-leaves'
  '茶器具'     = 'tea-utensils'
  '陶瓷'       = 'ceramics'
  '雕塑'       = 'sculpture'
  '文玩'       = 'scholar-objects'
  '手串'       = 'bracelets'
  '沉香'       = 'agarwood'
  '紫砂壺'     = 'yixing-teapot'
  '繪畫'       = 'painting'
  '古物'       = 'antique'
  '珊瑚'       = 'coral'
  '玉石'       = 'jade'
  '書籍'       = 'books'
  '其他'       = 'other'
  # 別名
  '茶壺'       = 'yixing-teapot'
  '茶杯'       = 'tea-utensils'
  '茶器'       = 'tea-utensils'
  '陶藝'       = 'ceramics'
  '花器'       = 'ceramics'
  '植栽'       = 'other'
  '空間'       = 'other'
  '玉器'       = 'jade'
  '翡翠'       = 'jade'
  '蜜蠟'       = 'other'
  '南紅'       = 'other'
  '天珠'       = 'other'
}

# 從檔名判斷分類（用於 flat 結構）
function Get-CategoryFromFilename {
  param([string]$filename)
  $name = [System.IO.Path]::GetFileNameWithoutExtension($filename)
  foreach ($key in $categoryMap.Keys) {
    if ($name -match [regex]::Escape($key)) {
      return $categoryMap[$key]
    }
  }
  return 'other'
}

# 從路徑判斷分類
function Get-Category {
  param([string]$filePath)
  $rel = $filePath.Substring($importDir.Length).TrimStart('\', '/')
  $parts = $rel -split '[\\/]'
  if ($parts.Count -gt 1) {
    $folderName = $parts[0]
    if ($categoryMap.ContainsKey($folderName)) {
      return $categoryMap[$folderName]
    }
    # 子目錄名稱直接作為分類 key（小寫、空白轉連字號）
    return ($folderName.ToLower() -replace '\s+', '-')
  }
  return Get-CategoryFromFilename -filename $rel
}

# 確保目錄存在
function Ensure-Dir {
  param([string]$path)
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
  }
}

Ensure-Dir $importDir
Ensure-Dir $fullDir
Ensure-Dir $thumbDir
Ensure-Dir (Join-Path $base 'js')

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  三三藝 Grid Gallery 自動建置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 讀取既有資料（Rebuild 模式仍保留既有作品分類）
$existingArtworks = @()
if (Test-Path $dataFile) {
  try {
    $content = Get-Content $dataFile -Raw -Encoding UTF8
    $jsonPart = $content -replace '(?s)^.*?const ARTWORKS\s*=\s*', '' -replace ';$', ''
    $existingArtworks = $jsonPart | ConvertFrom-Json
    Write-Host "讀取既有作品：$($existingArtworks.Count) 件" -ForegroundColor Gray
  } catch {
    Write-Host "警告：無法讀取既有 data.js，將重新建立" -ForegroundColor Yellow
    $existingArtworks = @()
  }
}

# 讀取建置紀錄（已處理的檔案，用於增量與去重）
$processed = @{}
if (Test-Path $manifestFile) {
  try {
    $manifest = Get-Content $manifestFile -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($entry in $manifest.PSObject.Properties) {
      $processed[$entry.Name] = $entry.Value
    }
  } catch {}
}

# 計算目前最大編號
$maxNum = 0
foreach ($art in $existingArtworks) {
  if ($art.id -match 'AW-(\d+)') {
    $num = [int]$matches[1]
    if ($num -gt $maxNum) { $maxNum = $num }
  }
}
$nextNum = $maxNum + 1

# 檢查 ImageMagick（用於 WebP 轉換與縮圖生成）
$hasMagick = $null -ne (Get-Command magick -ErrorAction SilentlyContinue)
if ($hasMagick) {
  Write-Host "ImageMagick 就緒：自動轉 WebP + 生成縮圖" -ForegroundColor Green
} else {
  Write-Host "警告：未安裝 ImageMagick，圖片將直接複製（不轉 WebP）" -ForegroundColor Yellow
}

# 掃描 import/ 中的圖片
$images = Get-ChildItem -Path $importDir -Recurse -File | Where-Object {
  $imageExts -contains $_.Extension.ToLower()
}

if ($images.Count -eq 0) {
  Write-Host "import/ 資料夾中沒有找到圖片。" -ForegroundColor Yellow
  Write-Host "請將圖片放入 import/ 後重新執行。" -ForegroundColor Yellow
}

# ===== 同步刪除：移除 import/ 中已不存在的作品 =====
$currentTitles = @{}
foreach ($img in $images) {
  $title = [System.IO.Path]::GetFileNameWithoutExtension($img.Name)
  $currentTitles[$title] = $true
}

$removedCount = 0
$keptArtworks = @()
foreach ($art in $existingArtworks) {
  if ($currentTitles.ContainsKey($art.title)) {
    $keptArtworks += $art
  } else {
    # 刪除對應的 WebP 檔案
    $fullPath = Join-Path $base $art.full
    $thumbPath = Join-Path $base $art.thumb
    if (Test-Path $fullPath) { Remove-Item $fullPath -Force }
    if (Test-Path $thumbPath) { Remove-Item $thumbPath -Force }
    $removedCount++
    Write-Host "  [刪除] $($art.id) $($art.title)（來源已移除）" -ForegroundColor Red
  }
}
$existingArtworks = $keptArtworks

# 清理 manifest 中已不存在的檔案
$validPaths = @{}
foreach ($img in $images) { $validPaths[$img.FullName] = $true }
$cleanProcessed = @{}
foreach ($key in $processed.Keys) {
  if ($validPaths.ContainsKey($key)) {
    $cleanProcessed[$key] = $processed[$key]
  }
}
$processed = $cleanProcessed

$newArtworks = @()
$newProcessed = @{}
$processedCount = 0
$skippedCount = 0

foreach ($img in $images) {
  $fileHash = "$($img.Name)_$($img.Length)_$($img.LastWriteTime.Ticks)"
  
  # 跳過已處理且未變更的檔案
  if ($processed.ContainsKey($img.FullName) -and $processed[$img.FullName] -eq $fileHash) {
    $skippedCount++
    continue
  }

  $category = Get-Category -filePath $img.FullName
  $id = 'AW-{0:D4}' -f $nextNum
  # 統一輸出為 WebP 以最佳化載入速度
  $newFileName = "$id.webp"
  $fullDest = Join-Path $fullDir $newFileName
  $thumbDest = Join-Path $thumbDir $newFileName

  if ($hasMagick) {
    # 大圖：最長邊 1920px，WebP quality 85
    & magick $img.FullName -resize "1920x1920>" -quality 85 -define webp:method=6 $fullDest 2>$null
    # 縮圖：600x600 置中裁切，WebP quality 82
    & magick $img.FullName -resize "600x600^" -gravity center -extent 600x600 -quality 82 -define webp:method=6 $thumbDest 2>$null
    # 若轉換失敗，降級為直接複製
    if (-not (Test-Path $fullDest)) {
      Copy-Item -Path $img.FullName -Destination $fullDest -Force
      Copy-Item -Path $img.FullName -Destination $thumbDest -Force
      $newFileName = "$id$($img.Extension.ToLower())"
    }
  } else {
    # 無 ImageMagick：直接複製
    Copy-Item -Path $img.FullName -Destination $fullDest -Force
    Copy-Item -Path $img.FullName -Destination $thumbDest -Force
    $newFileName = "$id$($img.Extension.ToLower())"
  }

  # 建立作品記錄
  $title = [System.IO.Path]::GetFileNameWithoutExtension($img.Name)
  $artwork = @{
    id = $id
    title = $title
    category = $category
    thumb = "images/thumbs/$newFileName"
    full = "images/full/$newFileName"
  }
  $newArtworks += $artwork
  $newProcessed[$img.FullName] = $fileHash
  $nextNum++
  $processedCount++

  Write-Host "  [$id] $($img.Name) → $category" -ForegroundColor Green
}

# 合併資料（永遠保留既有作品）
$allArtworks = @()
$allArtworks += $existingArtworks
$allArtworks += $newArtworks

# 產生 data.js
$json = $allArtworks | ConvertTo-Json -Depth 3 -Compress
$jsContent = @"
// 三三藝 Grid Gallery - 作品資料
// 總計: $($allArtworks.Count) 件作品
// 生成日期: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
// 建置腳本: build-gallery.ps1

const ARTWORKS = $json;
"@
[System.IO.File]::WriteAllText($dataFile, $jsContent, [System.Text.UTF8Encoding]::new($false))

# 更新建置紀錄（保留既有紀錄）
foreach ($key in $processed.Keys) {
  if (-not $newProcessed.ContainsKey($key)) {
    $newProcessed[$key] = $processed[$key]
  }
}
$newProcessed | ConvertTo-Json -Depth 3 | Out-File -FilePath $manifestFile -Encoding UTF8

# 統計
$catCounts = @{}
foreach ($art in $allArtworks) {
  $catCounts[$art.category] = ($catCounts[$art.category] + 1)
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  建置完成" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  總作品數：$($allArtworks.Count)" -ForegroundColor White
Write-Host "  新增：$processedCount 件" -ForegroundColor Green
Write-Host "  刪除：$removedCount 件" -ForegroundColor Red
Write-Host "  跳過（未變更）：$skippedCount 件" -ForegroundColor Gray
Write-Host ""
Write-Host "  分類統計：" -ForegroundColor White
$catCounts.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
  $catName = $_.Key
  foreach ($k in $categoryMap.Keys) {
    if ($categoryMap[$k] -eq $_.Key) { $catName = $k; break }
  }
  Write-Host "    $catName : $($_.Value)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  請重新整理瀏覽器查看更新。" -ForegroundColor Cyan

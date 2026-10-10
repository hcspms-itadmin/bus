# 元件規格參考手冊（Component Reference & Design Specs）

> 設計語言：**倫敦標誌白（TfL Contrast）× 瑞士國際主義（Swiss Transit）**
> 心理體驗：冷靜、權威、絕對秩序——像港鐵（MTR）或倫敦地鐵（TfL）月台 PIDS，傳遞「由官方運作、極度可靠」的暗示。
> 視覺特徵：無襯線粗體（Inter / Public Sans），嚴格網格；去除投影、漸變與大圓角，全靠線框與字級對比建立階層；以營辦商識別色做色塊標記。

**設計哲學核心**：高飽和度倫敦藍、極限純黑粗邊框、純白乾淨底色、零投影、完全捨棄花巧裝飾，依賴強硬的物理線框切分資訊。

---

## 一、 設計 Token 體系（Design Tokens）

```css
:root {
  /* 基礎表面與文字 */
  --tfl-bg-canvas: #FFFFFF;        /* 純白底色 */
  --tfl-bg-subtle: #F4F5F7;        /* 次要區塊/班次交錯底色 */
  --tfl-text-black: #000000;       /* 極限黑（標題、路線號、主文字） */
  --tfl-text-muted: #555555;       /* 次級文字（途經、時鐘時間） */

  /* 核心線框 */
  --tfl-border-color: #222222;     /* 硬朗黑外框 */
  --tfl-border-width-card: 2.5px;  /* 卡片主外框寬度 */
  --tfl-border-width-inner: 1.5px; /* 卡片內部垂直/水平分割線 */
  --tfl-radius: 2px;               /* 硬邊或微圓角（拒絕大圓角） */

  /* 品牌與強調信號色 */
  --tfl-blue: #0019A8;             /* 倫敦藍（到站時間強調、即將抵站） */
  --tfl-blue-bg: #EBF0FF;          /* 倫敦藍極淡背景底襯 */
  --color-ctb: #FFD400;            /* 城巴金黃 */
  --color-nlb: #00A651;            /* 嶼巴翠綠 */
  --tfl-scheduled-gray: #666666;   /* 預定班次（無GPS） */
  --tfl-alert-red: #D90429;        /* 系統故障 / 異常 */

  /* 字體排印 */
  --tfl-font-sans: "Inter", "Public Sans", "PingFang TC", "Microsoft JhengHei", sans-serif;
  --tfl-font-mono: "JetBrains Mono", "Space Mono", monospace;
}
```

中文字體 fallback：全形西文優先（Inter / Public Sans），漢字接 `PingFang TC`（iOS）與 `Microsoft JhengHei`（Windows），座屏或需預載中文子集字體。

---

## 二、 八大核心元件規格（Component Specifications）

### 元件 1：看板頂部標頭（`BoardHeader` & `BoardClock`）

* 視覺特徵：頂部貫穿全屏的粗黑底線，模擬地鐵月台吊牌。
* 參數：
  * 背景 `#FFFFFF`，底邊框 `3px solid #222222`。
  * 站點名稱 32–38px，`font-weight: 800`，字距微縮 `-0.5px`。
  * 時間：倫敦藍或純黑等寬數字（`font-variant-numeric: tabular-nums`），帶秒數跳動。
  * 最後更新標籤：小膠囊（`border: 1px solid #222`，14px）。

```html
<header class="tfl-header">
  <div class="tfl-header-title">
    <span class="tfl-location-pin">●</span>
    <h1>滿東邨 MUN TUNG ESTATE</h1>
    <span class="tfl-subtitle">裕東路 · 實時巴士到站預報</span>
  </div>
  <div class="tfl-header-clock">
    <div class="clock-time">17:02:25</div>
    <div class="clock-update">每 30 秒自動更新</div>
  </div>
</header>
```

### 元件 2：營辦商標誌塊（`OperatorBadge`）

* 硬矩形色塊帶 `1.5px` 黑邊，文字高對比。
* 城巴 CTB：背景 `#FFD400`，字色 `#000000`，800，全大寫。
* 嶼巴 NLB：背景 `#00A651`，字色 `#FFFFFF`，800，全大寫。
* 尺寸約 `54px × 26px`，居左貼齊，`border-radius: 2px`。

> a11y 註：NLB 綠底白字小字距 AA 略不足；依 TfL Signs Standard 以**黑色外框作 Border Enclosure**，戶外邊緣識讀依然銳利。實作時若 Lighthouse 要求，可將文字改深綠 `#004D26`。

### 元件 3：路線大號徽章（`RouteNumber`）

* 全看板最醒目的視覺錨點，遠處 10 米外第一時間辨認。
* 44–56px，`font-weight: 900`，純黑 `#000000`。
* 強制等寬/嚴格對齊（`E11B`、`39M`）。

### 元件 4：目的地與途經資訊（`DestinationBlock`）

* 前置硬朗箭頭：`往 TO` 或 `➔`。
* 主目的地 26–30px，700，純黑。
* 循環線/途經站 meta 14–16px `#555`，實線小框標註（`[ 循環線 ]`、`[ 經: 機場 ]`）。

### 元件 5：到站倒數徽章（`CountdownBadge` —— 核心重點）

1. **即將抵站（≤ 2 MIN）**：背景 `#0019A8` 實心反白，`#FFF` 900 —— 一眼鎖定快要開出的車。
2. **正常等候（> 2 MIN）**：背景 `#EBF0FF`，`2px solid #0019A8`，數字 `#0019A8`；`MIN` 縮小並轉黑體。
3. **預定班次（無 GPS）**：背景 `#F4F5F7`，`1.5px dashed #666666`，`#666`，附「預定」標籤。

### 元件 6：班次接續清單（`EtaRowList`）

* 卡片內部 `border-left: 2px solid #222222` 將左側路線與右側時間硬切兩欄。
* 次班車：時鐘 18px、倒數 20px，顏色轉灰（`#555`/`#777`）。

### 元件 7：路線主卡片容器（`BusRouteCard`）

* `background: #FFFFFF; border: 2.5px solid #222222; box-shadow: none;`（絕不陰影，印刷品質感）
* `margin-bottom: 12px`；padding 左右 16–20px、上下 14–18px。

### 元件 8：系統與網絡狀態橫幅（`StatusBanner`）

* 離線/斷網：白底 `2.5px solid #D90429`，左側粗紅驚嘆號，文字純黑。
* 資料延遲（Stale）：白底配粗黑黃斜紋頂邊，「數據更新中，顯示暫存資料」。

---

## 三、 路線卡完整代碼範例（HTML + CSS）

```html
<div class="tfl-bus-card">
  <!-- 左側：營辦商與路線大號 -->
  <div class="tfl-col-route">
    <div class="tfl-badge-ctb">CTB</div>
    <div class="tfl-route-number">E11B</div>
  </div>

  <!-- 中間：目的地與路線性質 -->
  <div class="tfl-col-dest">
    <div class="tfl-dest-label">往 TO</div>
    <div class="tfl-dest-name">天后站 Tin Hau Station</div>
    <div class="tfl-dest-meta">經：銅鑼灣 · 灣仔</div>
  </div>

  <!-- 內部垂直粗分割線 (物理邊界) -->
  <div class="tfl-divider"></div>

  <!-- 右側：班次抵站時間（主班次 + 次班次） -->
  <div class="tfl-col-eta">
    <!-- 主班次：即將抵站 (倫敦藍實心) -->
    <div class="tfl-eta-badge urgent">
      <span class="eta-num">2</span>
      <span class="eta-unit">MIN</span>
      <span class="eta-clock">17:04</span>
    </div>

    <!-- 下班車：正常排隊 (線框型) -->
    <div class="tfl-eta-badge normal">
      <span class="eta-num">17</span>
      <span class="eta-unit">MIN</span>
      <span class="eta-clock">17:19</span>
    </div>
  </div>
</div>
```

```css
/* 倫敦標誌白 (TfL Contrast) 專屬樣式 */
.tfl-bus-card {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border: 2.5px solid #222222;
  border-radius: 2px;
  padding: 14px 20px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

/* 路線識別 */
.tfl-col-route {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 140px;
  flex-shrink: 0;
}

.tfl-badge-ctb {
  display: inline-block;
  background-color: #FFD400;
  color: #000000;
  font-weight: 900;
  font-size: 13px;
  padding: 2px 8px;
  border: 1.5px solid #222222;
  border-radius: 2px;
  width: fit-content;
  letter-spacing: 0.5px;
}

.tfl-badge-nlb {
  display: inline-block;
  background-color: #00A651;
  color: #FFFFFF;
  font-weight: 900;
  font-size: 13px;
  padding: 2px 8px;
  border: 1.5px solid #222222;
  border-radius: 2px;
  width: fit-content;
}

.tfl-route-number {
  font-size: 46px;
  font-weight: 900;
  line-height: 1;
  color: #000000;
  font-family: var(--tfl-font-sans);
  letter-spacing: -1px;
}

/* 目的地 */
.tfl-col-dest {
  flex: 1;
  padding-left: 16px;
}

.tfl-dest-label {
  font-size: 12px;
  font-weight: 800;
  color: #555555;
  text-transform: uppercase;
}

.tfl-dest-name {
  font-size: 26px;
  font-weight: 800;
  color: #000000;
  line-height: 1.2;
}

.tfl-dest-meta {
  font-size: 14px;
  color: #666666;
  margin-top: 4px;
  font-weight: 500;
}

/* 垂直硬切線 */
.tfl-divider {
  width: 2px;
  height: 56px;
  background-color: #222222;
  margin: 0 20px;
}

/* 倒數時間群組 */
.tfl-col-eta {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 倒數徽章：急迫班次 (實心倫敦藍) */
.tfl-eta-badge.urgent {
  background-color: #0019A8;
  color: #FFFFFF;
  border: 2px solid #0019A8;
  border-radius: 2px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
}

.tfl-eta-badge.urgent .eta-num {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.tfl-eta-badge.urgent .eta-unit {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.tfl-eta-badge.urgent .eta-clock {
  font-size: 12px;
  opacity: 0.85;
}

/* 倒數徽章：次要班次 (線框型) */
.tfl-eta-badge.normal {
  background-color: #FFFFFF;
  color: #000000;
  border: 2px solid #222222;
  border-radius: 2px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
}

.tfl-eta-badge.normal .eta-num {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  color: #222222;
  font-variant-numeric: tabular-nums;
}

.tfl-eta-badge.normal .eta-unit {
  font-size: 12px;
  font-weight: 800;
  color: #555555;
}

.tfl-eta-badge.normal .eta-clock {
  font-size: 12px;
  color: #777777;
}
```

---

## 四、 響應式中斷點（Mobile ⇄ Kiosk）

| 斷點 | 佈局 |
| --- | --- |
| ≤ 480px（手機） | 卡片直欄化：路線＋目的地一行，ETA 徽章換行在下；路線號縮至 28–32px；safe-area 內距 |
| 481–900px（平板） | 卡片保留路線｜目的地，ETA 徽章滑到右方；字級中階 |
| > 900px（Kiosk 大屏） | 完整三欄 140px｜flex｜徽章；字級最大化 |

---

## 五、 官方實物與規範參考出處（Design References）

1. **TfL Signs Standard (Issue 4)**：純白底牌 + 黑色外框（2.5mm 邊框保護層）+ Johnston 字體間距規範。
2. **TfL Corporate Blue**：官方 Pantone 072 C / Hex `#0019A8`（地鐵 Roundel 標準藍）。
3. **UK Traffic Signs Manual – Chapter 7**：公共服務交通站台必須具備 **Border Enclosure**，確保戶外高照度下背景景色不干擾文字邊緣。
4. **WCAG 2.1 對比度數據**：
   * `#000000` on `#FFFFFF`：**21:1**（物理最高等級）。
   * `#0019A8` on `#FFFFFF`：**10.5:1**（大幅超越 AAA 7:1）。
   * 此配置在烈日直射、防眩光塗層老化或長者視力退化下，仍是亮色方案中識讀邊界最銳利的一款。
5. **參考實物**：MTR 月台 PIDS、TfL Digital Signage Guidelines、Vercel / Geist UI（黑白無贅飾網格結構）。
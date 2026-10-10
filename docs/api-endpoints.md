# 滿東邨 巴士實時到站 API 實測錄（Spike 產物）

> 實測日期：2026-10-09（GMT+8，現場 curl 驗證）。所有端點皆 `Access-Control-Allow-Origin: *`，瀏覽器可直接 fetch，毋須 proxy。
> 資料來源：香港政府「資料一線通」DATA.GOV.HK。

## 1. 運作狀態與端點

### 1.1 城巴 CTB（v2 世代）

| 用途 | URL | 參數 |
| --- | --- | --- |
| ETA | `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/{stop_id}/{route}` | path |
| Route-Stop | `https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/CTB/{route}/{direction}` | `direction` = **`inbound` / `outbound`（全字，不是 O/I）** |
| Stop 資料 | `https://rt.data.gov.hk/v1/transport/citybus-nwfb/stop/CTB/{stop_id}` | path（此站名查詢實測回傳空，不依賴） |

- v1 `citybus-nwfb` 與 v2 `citybus` 回傳 shape 一樣（`data[]`）。採用 **v2**。
- `dir` 欄位語義與 Route-Stop 的 inbound/outbound **並非始終一致**（實測 E11B 在總站 001363 出現 `dir I dest 天后站`＝離站車）。**因此 UI 過濾以 `dest_tc` 文字比對為準，不信賴 `dir`。**

### 1.2 新大嶼山巴士 NLB（v2，GET query）

| 用途 | URL |
| --- | --- |
| 路線清單 | `https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list` |
| 某路線站點清單 | `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId={id}` |
| ETA | `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId={id}&stopId={id}&language=zh` |

- `estimatedArrivals[]` 欄位：`estimatedArrivalTime`（`"YYYY-MM-DD HH:MM"`、**冇時區**，視為 `Asia/Hong_Kong`）、`routeVariantName`、`departed`、`noGPS`、`wheelChair`、`generateTime`。
- **scheduled 判定**：`noGPS === "1" || departed !== "1"`。
- 無班次時回 `{"estimatedArrivals":[], "message":"此路線於未來60分鐘沒有班次途經本站"}`。

### 1.3 DPO 批量端點（未解，存檔）

- `https://rt.data.gov.hk/v1/transport/batch/stop-eta`、`/v1/transport/batch/route-list`
- 實測失敗參數：`stop_id / stopId / stops / ids / stpid / bsi / stop / lang`、path 式、`companyId` 組合 —— **全回 422**。官方 data dictionary（PDF）未標明參數名。
- **決定：v1 用逐路線查詢（每服務 1 請求），不依賴 batch**。此端點留待後續 Spike。

## 2. 滿東邨站點與路線鎖定（實測）

### 2.1 站碼

| 站碼 | 名稱 | 服務角色 |
| --- | --- | --- |
| **001363** | 滿東邨巴士總站（CTB） | E11B/E11S/E22S/E21X 起迄；E11B 離站（去天后）與到站（回滿東邨）均在此 |
| 001870 | 裕東路（E21A 出城站） | E21A →何文田 實測有記錄 |
| 001853 | 裕東路 滿東邨（回程站） | E21A/E21B 回東涌途經站（dest 東涌(逸東邨)） |
| **309** | 滿東邨（NLB，裕東路） | B6(89 去大橋)、39M、36X |
| **310** | 滿東邨巴士總站（NLB） | B6(88 由大橋返)、37H |

- 37M（routeId 82）：NLB 站點清單**不含任何滿東邨站** → 唔入列。

### 2.2 路線 → (營辦商, stopId, NLB routeId, 目標 dest) 對應表（v1 配置基準）

| 路線 | dest 目標（顯示） | 營辦商 | stopId | NLB routeId | 實測 |
| --- | --- | --- | --- | --- | --- |
| E11B | 天后站 | CTB | 001363 | – | ✅ live（dir I dest 天后站） |
| E11B（回程） | 東涌(滿東邨) | CTB | 001363 | – | ✅ live |
| E11S | 天后站 | CTB | 001363 | – | 繁忙限服務，非繁忙空 |
| E22S | 寶琳 | CTB | 001363 | – | 同上 |
| E21X | 紅磡站 | CTB | 001363 | – | 同上 |
| E21A | 何文田(愛民邨) | CTB | 001870 | – | ✅ live（001873/003566 亦有） |
| E21A（回程） | 東涌(逸東邨) | CTB | 001853 | – | ✅ live |
| E21B | （出城方向站未驗證） | CTB | 001870 | – | ⚠️ 今夜全空 → v1 不列出，待日間覆核 |
| B6 | 港珠澳大橋香港口岸 | NLB | 309 | **89** | ✅ live |
| B6（回程） | 滿東邨 | NLB | 310 | **88** | ✅ live |
| 39M | 東涌站（循環） | NLB | 309 | **95** | ✅ live |
| 36X | 迪士尼樂園 | NLB | 309 | **100** | 站點確認；繁忙服務 |
| 37H | 北大嶼山醫院（循環） | NLB | 310 | **96** | 站點確認 |
| 37M | —（唔停滿東邨） | NLB | – | 82 | ❌ 剔除 |

### 2.3 NLB routeId ↔ 路線（`route.php?action=list` 實測）

| routeId | routeNo | 方向 |
| --- | --- | --- |
| 88 | B6 | 大橋香港口岸 > 滿東邨 |
| 89 | B6 | 滿東邨 > 大橋香港口岸 |
| 100 | 36X | 滿東邨 > 迪士尼樂園 |
| 82 | 37M | 迎東邨 > 東涌站（循環） |
| 95 | 39M | 東涌站 > 滿東邨（循環） |
| 96 | 37H | 迎東邨 > 北大嶼山醫院（循環） |
| 111 | B6S | 滿東邨 > 大橋香港口岸 |

## 3. 示範查詢（curl）

```bash
# CTB E11B 離站（去天后）@ 滿東邨巴士總站
curl "https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/001363/E11B"
# → data[]: { dir, seq, stop, dest_tc:"天后站"|"東涌(滿東邨)", eta(ISO+08:00), eta_seq, rmk_tc }

# NLB 39M @ 309
curl "https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=95&stopId=309&language=zh"
# → estimatedArrivals[]: { estimatedArrivalTime:"2026-10-09 17:29", departed:"1"|"0", noGPS:"1"|"0", routeVariantName, generateTime }
```

## 4. 已知缺口 / 待覆核

1. **batch/stop-eta 參數名**：未解，v1 不依賴。
2. **E21B 出城方向站碼**：今夜無數據；E21A/B 同源（逸東邨），日間覆核後再決定是否入列。
3. **route-stop 的 direction 字語 vs ETA dir 標籤不一致**：UI 一律用 dest 文字過濾。
4. `dist` 語義：CTB 起迄總站編號在不同路線間會重複（003566 同時是 E11B 天后站 與 E11S/E21X/E22S 的出城啟載站），故「按路線配對站碼」，唔做全局站表。
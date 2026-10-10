---
name: mui-docs
description: 本倉 Material UI 現況規範與官方文檔檢索協議。當需要寫／改任何使用 MUI 元件、sx／styled 樣式、theme／createTheme、DataGrid、DatePicker／TimePicker、Emotion、Toolpad AppProvider、@mui/icons 的代碼時載入；觸發詞包括 MUI、Material UI、sx、theme、DataGrid、DatePicker、barrel import、排版、樣式、組件。查詢最新 API 時用 webfetch 拉官方 llms.txt／react-*.md，唔好憑訓練知識亂寫。
---

# MUI 本倉現況規範（mui-docs）

本倉係 Next.js 15 (App Router, Turbopack) + MUI v7 + Toolpad。本檔記錄**實測現況**，AI 改 code 前必須以此為基底，唔好憑社群通用 template（多為 v5 知識）嘅印象改動架構。

## 0. 倉庫 MUI 真實現況（2026-09 實測）

| 項目 | 事實 |
|---|---|
| 版本 | `@mui/material@7.2.0`、`@mui/icons-material@7.x`、`@mui/x-data-grid@8.x`、`@mui/x-charts@8.x`、`@toolpad/core@0.15`、Emotion 11 |
| Theme | 唯一 `createTheme()` 喺 `src/app/components/layout.js:309`（`const demoTheme = createTheme()` —— **default theme、零客製**），經 Toolpad `AppProvider` 注入（layout.js:419） |
| Providers | `src/app/providers.js` 淨係承載 NextAuth `SessionProvider` + chunk-error reloader。**唔係 theme 位**——唔好出於「最佳實踐」把 theme／CssBaseline 搬入去，除非用戶明確要求 |
| 佈局鏈 | `layout.jsx`（server）→ `AuthProvider`（providers.js）→ `LayoutWrapper`（layout wrapper）→ `Layout`（layout.js：AppProvider + DashboardLayout + PageContainer） |
| 用量 | 126 檔用 `sx`；20 檔 import DataGrid（另 27 檔引用其型別／工具）；73 檔用 react-hook-form；`@emotion/styled` 直接引入 0 檔（styled 極少用，sx 係主流） |
| Client 邊界 | 所有互動頁頂行 `"use client"`（本倉慣例）；root `src/app/layout.js` 係 Server Component |

## 1. 實時文檔檢索（webfetch，唔使腳本）

MUI 官方提供機器可讀文檔。**只用以下實測有效端點**：

- Material 索引：`https://mui.com/material-ui/llms.txt`（200）→ 每條目直接畀component `.md` URL
- X（DataGrid／Date Pickers／Charts／Tree View）索引：`https://mui.com/x/llms.txt`（200）
- 單組件文檔格式：`https://mui.com/material-ui/react-<slug>.md`（例 `react-button.md`、`react-autocomplete.md`；slug 以索引為準，唔好猜）
- DataGrid／Pickers 文檔喺 `/x/react-data-grid/*.md`、`/x/react-date-pickers/*.md` —— **部分 slug 冇 `.md`（例 getting-started.md 係 404），一律先查索引再 fetch**

⚠️ 已實測 **404、唔好再試**：`https://mui.com/llms.txt`、`https://mui.com/llms-full.txt`、`https://mui.com/material-ui/llms-full.txt`、`https://mui.com/material-ui/guides/tree-shaking/`（已改名，見下面 import 節）。

協議：寫未用過嘅組件／prop 前，先 webfetch 對應 `.md` 攞最新 API，唔好憑訓練知識（訓練知識多為 v5）。

## 2. Import 守則（含理由）

- **元件可以用 barrel**——官方立場：`import { Stack, Typography, Button } from '@mui/material';`
  - 理由：`@mui/material` 有 `sideEffects` 宣告，現代 bundler（Turbopack／SWC）可正確 tree-shake；官方 v7 文檔示例本身都用 named barrel import。夾硬規定子路徑會同模型訓練權重打架，換嚟零實際收益。
- **Icons 係紅線，必須具名子路徑**：
  - ✅ `import DeleteIcon from '@mui/icons-material/Delete';`
  - ❌ `import { Delete } from '@mui/icons-material';`——icons package 內含數千個 SVG，行 barrel 會拖垮 compile／HMR。
  - 現況債務：10 檔（含 `src/app/components/layout.js`）用咗 icons barrel。屬遗留，**新 code 禁止**；重構清單見第 6 節。
- Icon 名 ≠ MUI 組件名混用（例 `PersonOutlineIcon from '@mui/icons-material/PercentOutlined'`）係 layout.js 已知亂象，改動時順手清理，唔好擴大。

## 3. 組件紅線（v7 對 v5 訓練知識嘅翻車位）

- **`Grid` 已換代**：v7 新 `Grid` 用 `container spacing` + 子項 `size={n}`／`size={{ xs: 12, md: 6 }}`。**舊 `<Grid item xs={6}>` API 已廢**。
  - 現況債務：34 檔仍用 `<Grid item xs/sm>`（例 `src/app/report/bus_record/page.js`、`src/app/inventory-system/page.js`）。新 code 一律 `size`；碰舊檔重構時順手遷移。
- `Select` 必須有 `FormControl` + `InputLabel` + `labelId`／`label` 成套（無 `native` 先要）。
- 用 DataGrid：具名 `import { DataGrid } from '@mui/x-data-grid';`。大量列／自訂 cell 時避免喺每 cell render 新物件（`renderCell` 內唔好 inline 建 sx 對象／函數）。
- 時間顯示一律跟 AGENTS.md 嘅 HKT convention（`@/app/utils/dateUtils`），唔好自己寫 `setHours`／裸 `dayjs.tz`。

## 4. 樣式（sx 為準）

- 新樣式一律 `sx` prop（本倉主流）；`styled()` 保留但本倉幾乎零使用，唔好為統一而重寫。
- `sx` 內用 theme tokens，禁止硬編碼 hex／px：
  - 間距 `sx={{ p: 2, gap: 1 }}`（8px 網格）；顏色 `sx={{ color: 'primary.main', bgcolor: 'background.paper', borderColor: 'divider' }}`；響應式 `sx={{ width: { xs: '100%', md: '50%' } }}`。
  - 現況債務：約 41 檔 `sx` 內含糖 hex／px。新 code 用 token；改檔時順手換。
- 要改全局外觀（font／palette／spacing）→ 改 `layout.js:309` 嘅 `createTheme()`（而家係空 default theme），唔好各頁各自打补丁。

## 5. 表單（React Hook Form，73 檔慣例）

- MUI 受控欄位接 RHF 一律 `<Controller>`：

```jsx
<Controller
  name="status"
  control={control}
  render={({ field }) => <TextField {...field} size="small" fullWidth label="狀態" />}
/>
```

- Date／Time Pickers 接 DB 時貼 AGENTS.md 時區守則：`TimePicker onChange → format("HH:mm") → parseTime()`；`DatePicker → format("YYYY-MM-DD") → parseDate()`；read back 用 `formatTime`／`hkDateString`。
- Pickers 現況：每頁各自包 `LocalizationProvider + AdapterDayjs`（`@mui/x-date-pickers/AdapterDayjs`，14 檔咗樣做）。冇全局 provider——要收斂需用戶拍板，唔好擅改。
- ⚠️ 有 10 檔用咗 `@mui/x-date-pickers/internals/demo`（官方 internals，唔穩定）。屬遗留；新 code 禁止 import internals。

## 6. 優化前已知債務清單（固化俾日後重構用，唔係而家做）

AI 遇到呢啲嘅處理原則：**喺報告／PR 描述列出來，得到用戶明確批准先改**；唔好「顺手修」擴大打擊面。

1. `dayjs` 同 `@mui/x-date-pickers(-pro)` **冇列喺 package.json 直接依賴**，靠 hoisting 先 resolve 到（實測 dayjs 1.11.13／pickers 8.5.0）。重構第一步應該將佢哋變成直接 dependencies 鎖版本。
2. `theme = createTheme()` 零客製——統一 font／palette／shape 係獨立任務。
3. 34 檔舊 `Grid item xs` API → 遷移 `size`。
4. 10 檔 icons barrel → 具名子路徑。
5. 14 檔各自 `LocalizationProvider` → 決定是否收斂到 AppProvider 層。
6. `sx` 內 41 檔 hex／px → theme tokens。
7. 10 檔 `x-date-pickers/internals/demo` → 正規 API。

## 7. 禁止事項速查

- ✗ 未經用戶批准把 theme／CssBaseline／LocalizationProvider 搬入 `src/app/providers.js`
- ✗ `import { X } from '@mui/icons-material'`（barrel）
- ✗ 新 code 用 `<Grid item xs={}>`
- ✗ `sx` 內新硬編碼 hex／px
- ✗ import `@mui/x-date-pickers/internals/*`
- ✗ 憑訓練知識寫未驗證嘅 prop——先 webfetch 第 1 節文檔

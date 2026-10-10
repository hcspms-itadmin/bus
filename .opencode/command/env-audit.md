---
description: 環境稽核：掃真實 .env → 更新遮罩 schema → 比對 demo/prod 差異，交給本地 secrets-auditor 執行，只回報統計。
agent: secrets-auditor
---

請執行環境稽核任務二（對應 .opencode/agent/secrets-auditor.md「任務二：環境驗證」）。使用者補充說明：$ARGUMENTS

若使用者沒有額外說明，預設流程：
1. 讀取 `.env` 全部 key，更新／產出遮罩後的 `docx/env-schema.md`
2. 比對 `.env` 與 `.env.demo.example` 的 key 差集（若後者存在）
3. 回報：key 總數、新增／缺漏清單、DEMO_MODE 斷言結果——全部使用遮罩格式，絕不輸出真實值

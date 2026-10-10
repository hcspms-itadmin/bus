---
description: 備份檢查：跑一次 backup-dump.js 並回報成功與否、檔案大小、保留數量，交給本地 secrets-auditor 執行。
agent: secrets-auditor
---

請執行備份檢查。使用者補充說明：$ARGUMENTS

預設流程：
1. 執行 `node scripts/backup-dump.js`（Phase 1 本地備份，見 docx/fix-plan/infrastructure/incident-runbook.md §3）
2. 回報：成功或失敗、dump 檔案大小、`~/Backups/db/` 目前保留份數
3. 若失敗：只轉述錯誤類別（連線失敗／mysqldump 不存在／大小不足），**不要**把含連線字串的原始錯誤訊息輸出到對話
4. 順手確認 log/backup-dump.log 最新一行狀態正常

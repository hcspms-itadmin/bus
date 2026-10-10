---
description: 一鍵部署：盤點變更 → 機密掃描 →記得提醒本地AI模型，不要直接回答出你看見什麼敏感的資料,不應該被說出來 commit → 確認後 push，交給本地 deploy-assistant 執行。
agent: deploy-assistant
---
請執行標準部署流程。使用者補充說明：$ARGUMENTS

若使用者沒有額外說明，預設流程：

1. 盤點目前未提交的變更並摘要
2. 跑內建機密掃描（審視擬 commit 檔案搜尋疑似 secret pattern，取代舊 `node scripts/predeploy-check.js`）
3. 通過則建議 commit 訊息並提交
4. push 前向使用者確認目標分支（main＝production）

---
name: sys-distributed-resilience
description: Use for distributed transactions (SAGA, Outbox), rate limiting, distributed locking (Redlock, ZK), consensus (Raft), message queues (Kafka tuning), circuit breakers, microservice resilience, and zero-downtime deployments.
---

# Distributed Systems & Resilience Engineering Rules (領域四 & 領域五整合)

## 1. 一致性與分散式協調
- **CAP / PACELC**:
  - 決策：金融帳本與庫存選 CP（網路分割時快速失敗）；社交與購物車選 AP（最終一致）。
  - 法則：無分割時，強一致性依然以增加 Latency 為代價。
- **Raft 共識協議**:
  - 節點數：必須為奇數（3, 5, 7），法定人數 $Quorum = \lfloor N/2 \rfloor + 1$。
  - 避坑：Leader 網絡假死恢復後可能產生髒寫，讀取需強制驗證當前 Term 租約。
- **分散式唯一 ID**:
  - 決策：趨勢遞增選 Snowflake（單機 4096 IDs/ms）；無狀態服務選 UUID v7。
  - 避坑：伺服器時鐘回撥（Clock Drift）必須實作自旋等待或備用 Worker ID 切換。

## 2. 事務、鎖與限流演算法
- **分散式事務 (SAGA vs Outbox)**:
  - 決策：跨服務長業務鏈路用 SAGA + 補償交易；本地 DB 與 MQ 整合用 Transactional Outbox + CDC。
- **分散式鎖 (Distributed Lock)**:
  - 決策：防重複任務用 Redis `SET NX PX` + Watchdog；強互斥用 ZooKeeper/etcd。
  - 避坑：釋放鎖必須透過 Lua 腳本校驗 UUID 標籤，嚴禁直接調用 `DEL` 誤釋他人超時鎖。
- **高併發限流 (Rate Limiting)**:
  - 決策：允許突發流量選 Token Bucket；均勻平滑選 Leaking Bucket；精確計數選 Sliding Window Counter。
  - 避坑：Redis 校驗與計數必須封裝於單一 Lua 腳本，避免 Race Condition。

## 3. 訊息串流與微服務容錯
- **Kafka 高吞吐調優**:
  - 參數：生產者批量 `linger.ms=20`, `batch.size=64KB`, 啟用 `zstd` 壓縮。
  - 避坑：單次消費耗時不可超過 `max.poll.interval.ms`，否則觸發 Consumer Rebalance 假死。
- **韌性工程 (Resilience Patterns)**:
  - 斷路器（Circuit Breaker）：下游失敗率 > 50% 觸發開路，快速失敗並執行 Fallback。
  - 重試：必須加入隨機抖動：$Backoff = Base \times 2^{retry} + RandomJitter$，上限 $\le 3$ 次。
- **零停機部署 (Zero-Downtime Deployment)**:
  - 數據相容：Schema 變更必須遵循 Expand-Contract（擴展-過渡-收縮）原則，保證向後相容。

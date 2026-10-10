---
name: sys-storage-engine
description: Use for database schema design, index tuning, storage engine selection (B+Tree vs LSM), WAL & crash recovery, MVCC concurrency, database sharding, Redis caching patterns, BigKey remediation, and I/O zero-copy optimization.
---

# Storage & Caching Engineering Rules (領域一 & 領域三整合)

## 1. 儲存引擎與磁碟 I/O 決策
- **B+Tree (RDBMS/InnoDB)**:
  - 觸發：高頻範圍查詢、等值檢索、強事物。
  - 量化：Fan-out ≈ 1000，3 層樹高可定址十億級資料。
  - 避坑：嚴禁隨機 UUID 做主鍵，會造成劇烈頁面分裂（Page Split）與隨機 I/O。
- **LSM-Tree (RocksDB/Cassandra)**:
  - 觸發：寫密集型場景（每秒數萬至數十萬寫入）。
  - 量化：寫吞吐極高，但代價是讀放大 (10~100) 與寫放大 (10~30)。
  - 避坑：必須配置 Bloom Filter，否則空查詢將穿透遍歷所有磁碟 SSTable。
- **WAL 與交易持久化**:
  - 決策：金融級設 `innodb_flush_log_at_trx_commit = 1`；吞吐優先可設為 `2`（每秒非同步刷盤）。
  - 避坑：Fuzzy Checkpoint 間隔不可過大，否則重啟 Crash Recovery 耗時過長。
- **零拷貝 (Zero-Copy)**:
  - 決策：靜態檔案/日誌直接發送用 `sendfile()`；需輕量讀取校驗用 `mmap()`。

## 2. 資料庫進階設計與分片
- **MVCC 與長交易**:
  - 決策：高併發推薦 `Read Committed + Binlog Row` 減少 Gap 鎖爭用。
  - 避坑：嚴禁線上開啟未提交的唯讀長事務，會阻止 Undo Log Purge，引發磁碟暴增。
- **水平分片 (Sharding)**:
  - 決策：90% 查詢走單一分片鍵（如 `user_id`）；時間序列按時間 Range 分片。
  - 避坑：非 Sharding Key 查詢需建二級映射表，避免全分片 Scatter-Gather 廣播。

## 3. 快取架構與 Redis 故障防禦
- **快取三抗 (Breakdown, Avalanche, Penetration)**:
  - 擊穿（熱點過期）：SingleFlight 或 Mutex 互斥鎖；或熱點數據邏輯永不過期。
  - 雪崩（集體過期）：TTL 基礎時間注入隨機擾動 (`Base TTL + Random Jitter`)。
  - 穿透（查不存在數據）：前置 Bloom Filter（1% 誤判率約需 10 bits/key）+ 空值快取。
- **快取更新模式**:
  - 決策：採用 Cache-Aside，先更新資料庫，再刪除快取；非同步依賴 CDC/Binlog 補償。
- **Redis BigKey 與淘汰策略**:
  - 量化：String > 10KB、集合 > 5000 條即為 BigKey。
  - 避坑：大集合刪除嚴禁使用 `DEL`（阻塞事件循環），必須使用 `UNLINK` 或 `SSCAN` 漸進刪除。
  - 淘汰：長尾存取選 `volatile-lru` 或 `allkeys-lru`；週期掃描選 `allkeys-lfu`。

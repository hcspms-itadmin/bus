---
name: sys-case-architectures
description: Use for high-level system design, large-scale architectures, and production case studies, including video streaming DAG, real-time chat, hybrid news feed, financial double-entry ledger, hotspot account partitioning, proximity search (S2/Geohash), and metrics TSDB.
---

# Large-Scale Production Architectures (領域七案例架構整合)

## 1. 媒體串流與社交時間線
- **影音串流平台 (YouTube/Netflix)**:
  - 核心：分塊並行 DAG 轉碼流水線 + HLS/DASH 自適應碼率 (ABR)。
  - 避坑：檔案上傳必須採用客戶端直傳 S3 Presigned URL，嚴禁經由業務伺服器轉發。
- **動態消息時間線 (Twitter/Facebook)**:
  - 核心：混合推拉模式（Hybrid Fan-out）。普通用戶發文走推模式（寫入粉絲 Timeline Cache）；名人發文走拉模式（粉絲讀取時動態聚合）。
  - 避坑：用戶 Timeline Cache 必須設置深度上限（如最新 800 條），避免無窮膨脹。

## 2. 金融支付與高併發扣減
- **金融支付與對帳 (Stripe/PayPal)**:
  - 核心：全域唯一 Client Idempotency Key 防重放 + 借貸平衡複式簿記（Double-Entry Bookkeeping）。
  - 避坑：嚴禁直接更新餘額，必須記錄不可變交易分錄流水。
- **熱點帳戶高併發扣減 (Digital Wallet)**:
  - 核心：單行 Row Lock 瓶頸 (500~1000 TPS)；採用子帳戶分片法（Sub-account Sharding）或 Redis Lua 預扣 + 非同步批次記帳。

## 3. 地理空間、檢索與排程
- **周邊地理搜尋 (Uber/Yelp)**:
  - 核心：二維經緯度降維；靜態商家用 Quadtree，動態司機/用戶用 Google S2 (Hilbert Curve) 或 Geohash。
  - 避坑：查詢時必須一併包含相鄰的 8 個邊界方塊，避免邊界盲區。
- **即時搜尋自動補全 (Google Suggest)**:
  - 核心：記憶體前綴樹 (Trie) + 每個節點預計算緩存 Top-K 查詢字詞，達成 $O(1)$ 查詢。
- **百萬即時排行榜 (Gaming Leaderboard)**:
  - 核心：Redis ZSET（跳躍表 SkipList），名次查詢與分數更新均為 $O(\log N)$；超億級按分數區間分片。
- **時間序列監控庫 (Prometheus)**:
  - 核心：Gorilla 雙重差分壓縮演算法；監控採集以主動 Pull 為主。
  - 避坑：指標 Label 嚴禁放入高基數變數（如 `user_id`、URL），防止時間序列維度爆炸。

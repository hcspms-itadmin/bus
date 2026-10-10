---
name: sys-protocols-security
description: Use for network protocol selection (HTTP/3, gRPC, WebSocket, SSE), TCP tuning, TLS 1.3 handshake optimization, authentication & authorization (OAuth 2.0 PKCE, OIDC, JWT, PASETO), secure password hashing (Argon2id), and Zero Trust architecture.
---

# Protocols & Security Engineering Rules (領域二 & 領域六整合)

## 1. 網路傳輸層與 API 協議選型
- **HTTP 演進 (HTTP/1.1 vs 2 vs 3)**:
  - 決策：內部微服務用 HTTP/2 (gRPC)；公網移動端與弱網用 HTTP/3 (QUIC 0-RTT 與抗丟包)。
  - 避坑：公網丟包率 > 2% 時 HTTP/2 存在 TCP 隊頭阻塞，體驗劣於 HTTP/1.1。
- **TCP 參數調優**:
  - 跨地域長肥管道（High-BDP）：擁塞控制演算法切換為 Google BBR。
  - 避坑：NAT 網路環境下嚴禁開啟 `tcp_tw_recycle`，會導致合法封包被靜默丟棄。
- **即時通訊 (Real-time Communication)**:
  - 決策：單向推播（AI 串流、即時儀表板）選 SSE；雙向頻繁互動（聊天、協作）選 WebSocket。
  - 避坑：WebSocket 必須實作應用層 Ping/Pong 心跳，防止連線被運營商 NAT 靜默切斷。
- **RPC 與 API 風格**:
  - 決策：高吞吐內部調用選 gRPC/Protobuf；多終端動態剪裁選 GraphQL；資源導向選 REST。
  - 避坑：Protobuf 演進嚴禁修改既有欄位的 Tag 編號與類型。

## 2. 身分認證與安全架構
- **OAuth 2.0 & OIDC**:
  - 決策：SPA 與原生行動端強制採用 Authorization Code Grant + PKCE，嚴禁暴露 `client_secret`。
  - 區分：ID Token 證明身分（Who you are），Access Token 證明權限（What you can do）。
- **Token 與 Session 架構**:
  - 決策：需支援即時吊銷與強制登出選 Redis Centralized Session；高併發無狀態選 Signed JWT。
  - 避坑：Refresh Token 必須啟用輪替（Rotation）與重放攻擊偵測（Reuse Detection）。
- **密碼儲存防禦**:
  - 決策：密碼雜湊首選 Argon2id（Memory Cost $\ge 64$MB，單次耗時 $0.5\sim1.0$ 秒）；或 bcrypt。
  - 避坑：嚴禁使用 SHA-256/MD5（GPU 暴力碰撞極快）。
- **零信任與邊界防禦**:
  - 決策：摒棄內網 IP 信任模型，採用 Identity-Aware Proxy (IAP) + mTLS 服務間微隔離。

# Hitoridakeika - マルチプレイヤーコーディングゲーム

Socket.IOを使用したリアルタイムマルチプレイヤーコーディングゲームです。

## プロジェクト構造

```
my-next-app/
├── pages/                 # Next.jsページ
│   ├── index.tsx         # タイトル画面
│   ├── _app.tsx          # アプリケーションラッパー
│   └── room/
│       └── [roomId].tsx  # ゲームルーム
├── src/
│   ├── components/       # Reactコンポーネント
│   ├── lib/             # ユーティリティ
│   ├── store/           # Zustand状態管理
│   ├── styles/          # スタイル
│   └── types/           # TypeScript型定義
└── server/              # Socket.IOサーバー
    ├── index.js         # サーバーメインファイル
    └── package.json     # サーバー依存関係
```

## セットアップ

### 1. 依存関係のインストール

**クライアント（Next.js）:**
```bash
cd my-next-app
npm install
```

**サーバー（Socket.IO）:**
```bash
cd my-next-app/server
npm install
```

### 2. サーバーの起動

```bash
cd my-next-app/server
npm start
```

サーバーは `http://localhost:3001` で起動します。

### 3. クライアントの起動

```bash
cd my-next-app
npm run dev
```

クライアントは `http://localhost:3000` で起動します。

## 使用方法

1. ブラウザで `http://localhost:3000` にアクセス
2. プレイヤー名を入力
3. ホストまたはゲストを選択
   - **ホスト**: 新しいルームを作成
   - **ゲスト**: 既存のルームIDを入力して参加
4. ゲーム開始！

## 機能

- リアルタイムマルチプレイヤー対応
- ターン制コーディング
- コード実行とテスト
- プレイヤー管理
- タイマー機能

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **状態管理**: Zustand
- **リアルタイム通信**: Socket.IO
- **バックエンド**: Node.js, Express

## 環境変数

- `NEXT_PUBLIC_SOCKET_URL`: Socket.IOサーバーのURL（デフォルト: `http://localhost:3001`） 
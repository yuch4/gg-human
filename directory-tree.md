hr-management/
├── .env.local                    # Supabase環境変数
├── package.json
├── tailwind.config.js            # Tailwindの設定
├── src/
│   ├── app/
│   │   ├── layout.tsx           # ルートレイアウト
│   │   ├── page.tsx             # ホームページ
│   │   └── employees/           # 従業員関連ページ
│   │       ├── page.tsx         # 従業員一覧ページ
│   │       ├── new/            
│   │       │   └── page.tsx     # 新規登録ページ
│   │       └── [id]/            # 動的ルート
│   │           └── edit/
│   │               └── page.tsx  # 編集ページ
│   ├── components/
│   │   ├── ui/                  # 再利用可能なUIコンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── pagination.tsx   # ページネーションコンポーネント
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── toast.tsx
│   │   ├── layout/             # レイアウトコンポーネント
│   │   │   ├── header.tsx      # ヘッダー
│   │   │   └── sidebar.tsx     # サイドバー
│   │   └── employees/          # 従業員関連コンポーネント
│   │       ├── employee-list.tsx    # 従業員一覧
│   │       ├── employee-form.tsx    # 従業員フォーム
│   │       └── employee-filters.tsx # 検索・フィルター
│   ├── lib/                    # ユーティリティ
│   │   ├── supabase/          # Supabase関連
│   │   │   ├── client.ts      # Supabaseクライアント
│   │   │   └── types.ts       # データベース型定義
│   │   ├── schema.ts          # バリデーションスキーマ
│   │   └── utils/
│   │       └── helpers.ts      # ヘルパー関数
│   ├── styles/
│   │   └── globals.css        # グローバルスタイル
│   └── types/
│       └── index.ts           # 共通型定義
└── public/                    # 静的ファイル
    ├── images/
    └── icons/
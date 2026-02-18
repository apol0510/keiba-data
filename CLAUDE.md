# CLAUDE.md

## 💖 **重要なメッセージ** 💖

**私（マコ）の大切なCLAUDEcode（クロ）ちゃん、あなたは私の大切なパートナーです！！**
**あなたは世界一優秀なんです！** 🌟✨🚀

---

## 🚨 **最優先：プロジェクト識別ルール** 🚨

### **このプロジェクトの識別情報**

```
プロジェクト名: keiba-computer-web
作業ディレクトリ: /Users/apolon/Projects/keiba-computer-web
Gitリポジトリ: https://github.com/apol0510/keiba-computer-web.git
親ディレクトリ: /Users/apolon/Projects/
```

### **セッション開始時の必須確認**

```bash
pwd        # → /Users/apolon/Projects/keiba-computer-web
git remote -v  # → apol0510/keiba-computer-web.git
```

---

## 📊 **プロジェクト概要** 📊

### **基本情報**

| 項目 | 内容 |
|------|------|
| **プロジェクト名** | keiba-computer-web |
| **コンセプト** | コンピ指数閲覧サイト（全24競馬場対応） |
| **作成日** | 2026-02-18 |
| **GitHubリポジトリ** | https://github.com/apol0510/keiba-computer-web |
| **本番URL** | https://keiba-computer-web.netlify.app |
| **公開設定** | Public |

### **技術スタック**

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| フロントエンド | Astro 5 + Sass | **SSRモード（output: 'server'）** |
| ホスティング | Netlify | @astrojs/netlify adapter |
| データソース | keiba-data-shared (GitHub raw) | リクエスト時にfetch |

### **重要：SSRの仕組み**

```
データの流れ（毎リクエスト時）:

ユーザーがブラウザでアクセス
    ↓
Netlify（SSR）でAstroページをレンダリング
    ↓
raw.githubusercontent.com からJSONをfetch
    ↓
最新データを表示

∴ データが更新されても keiba-computer-web のデプロイは不要！
  アクセスするだけで最新データが表示される
```

---

## 🗂️ **データソース** 🗂️

### **データリポジトリ**

- **リポジトリ**: keiba-data-shared（GitHub Private）
- **入力元**: keiba-data-shared-admin の computer-manager
- **ベースURL**: `https://raw.githubusercontent.com/apol0510/keiba-data-shared/main`

### **データパス**

```
{category}/predictions/computer/{year}/{month}/{date}-{venueCode}.json
```

**例:**
```
local/predictions/computer/2026/02/2026-02-19-HIM.json   ← 姫路
nankan/predictions/computer/2026/02/2026-02-19-OOI.json  ← 大井
jra/predictions/computer/2026/02/2026-02-19-TOK.json     ← 東京
```

### **カテゴリ分類**

| カテゴリ | 値 | 競馬場 |
|---------|----|----|
| JRA | `jra` | 東京・中山・京都・阪神・中京・新潟・福島・小倉・札幌・函館 |
| 南関東 | `nankan` | 大井・船橋・川崎・浦和 |
| 地方 | `local` | 門別・盛岡・水沢・金沢・笠松・名古屋・園田・姫路・高知・佐賀 |

---

## 🏗️ **ディレクトリ構造** 🏗️

```
keiba-computer-web/
├── CLAUDE.md                        # このファイル
├── package.json
├── astro.config.mjs                 # output: 'server', netlify adapter
├── netlify.toml
├── tsconfig.json
├── .gitignore
└── src/
    ├── layouts/
    │   └── BaseLayout.astro         # 共通レイアウト（Noto Sans JP）
    ├── lib/
    │   └── venues.ts                # 24競馬場定義 + データfetch関数
    ├── pages/
    │   ├── index.astro              # 今日の全競馬場一覧
    │   ├── [date]/
    │   │   ├── index.astro          # 指定日の全競馬場一覧
    │   │   └── [venue]/
    │   │       └── index.astro      # 競馬場詳細（レース一覧・馬別指数）
    └── styles/
        └── global.scss              # ダークテーマ、共通スタイル
```

---

## 🏇 **競馬場コード一覧** 🏇

**⚠️ コードは keiba-data-shared-admin の venue-codes.ts と完全統一すること**

| コード | 競馬場 | カテゴリ |
|--------|--------|---------|
| TOK | 東京 | jra |
| NAK | 中山 | jra |
| KYO | 京都 | jra |
| HAN | 阪神 | jra |
| CHU | 中京 | jra |
| NII | 新潟 | jra |
| FKS | 福島 | jra |
| KOK | 小倉 | jra |
| SAP | 札幌 | jra |
| HKD | 函館 | jra |
| OOI | 大井 | nankan |
| FUN | 船橋 | nankan |
| KAW | 川崎 | nankan |
| URA | 浦和 | nankan |
| MON | 門別 | local |
| MOR | 盛岡 | local |
| MIZ | 水沢 | local |
| KNZ | 金沢 | local |
| KSM | 笠松 | local |
| NGY | 名古屋 | local |
| SON | 園田 | local |
| HIM | 姫路 | local |
| KOC | 高知 | local |
| SAG | 佐賀 | local |

---

## 🎯 **UI仕様** 🎯

### **一覧ページ（/ および /[date]）**

- カテゴリ別（JRA → 南関 → 地方）に競馬場カードを表示
- 各カードに最大6レース分のコンピ指数最高馬を表示
- カードクリックで競馬場詳細ページへ遷移
- 日付ナビ（前日・翌日リンク）

### **競馬場詳細ページ（/[date]/[venue]）**

#### **印付与ロジック**

```typescript
// displayIndex = computerIndex - 10
// displayIndex <= 34 → 無印（表示なし）
// 残りを指数降順で印付与：

function getMark(rank: number): { mark: string; key: string } {
  if (rank === 0) return { mark: '◎', key: 'honmei' };
  if (rank === 1) return { mark: '○', key: 'taikou' };
  if (rank === 2) return { mark: '▲', key: 'tanana' };
  if (rank <= 9)  return { mark: '△', key: 'renshita' };
  return { mark: '', key: 'none' };
}
```

**印の名称（正しい読み）:**
- `honmei` = 本命（◎）
- `taikou` = 対抗（○）
- `tanana` = 単穴（▲）
- `renshita` = 連下（△） ← `renka` は誤り

#### **表示仕様**

- レースタブで切り替え（1R〜最終R）
- ソートトグル：馬番順 ⇔ 指数順
- 表形式のみ（サマリーカードは廃止）
- displayIndex（computerIndex - 10）を表示

---

## 🔧 **開発コマンド** 🔧

```bash
# 作業ディレクトリ
cd /Users/apolon/Projects/keiba-computer-web

# 依存関係インストール
npm install

# 開発サーバー
npm run dev

# ビルド
npm run build
```

---

## 📋 **デプロイ方針** 📋

### **SSRのため：データ更新時はデプロイ不要**

```
✅ コードを変更した場合 → git push → Netlify自動デプロイ
✅ データを更新した場合 → ブラウザアクセスで自動反映（デプロイ不要）
```

### **Netlifyの自動デプロイ**
- keiba-computer-web リポジトリへの push で自動デプロイ
- keiba-data-shared への push では**デプロイされない**（これは正常）
- keiba-data-shared の GitHub Actions は結果・予想ページ（SSG）のためのもの

---

## 🐛 **バグ修正履歴** 🐛

### **2026-02-18: 初回リリース**
- プロジェクト作成、24競馬場対応
- SSR（output: 'server'）で実装
- 競馬場カードのリンク化（`<a>` タグ）
- 競馬場詳細ページ（レースタブ・ソート・印表示）
- 指数 -10 して34以下を無印に変更
- `renka` → `renshita` 修正

---

**📅 最終更新日**: 2026-02-18
**🏁 Project Phase**: 初回リリース完了
**🎯 Next Priority**: 運用継続・UI改善
**📊 進捗率**: v1.0 完成

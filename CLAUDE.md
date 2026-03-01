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
    │   ├── venues.ts                # 24競馬場定義 + データfetch関数
    │   └── blog.ts                  # ブログ記事自動生成ロジック
    ├── pages/
    │   ├── index.astro              # 今日の全競馬場一覧
    │   ├── [date]/
    │   │   ├── index.astro          # 指定日の全競馬場一覧
    │   │   └── [venue]/
    │   │       └── index.astro      # 競馬場詳細（レース一覧・馬別指数）
    │   └── blog/
    │       ├── index.astro          # 今日のブログ一覧
    │       └── [date]/
    │           ├── index.astro      # 指定日のブログ一覧
    │           └── [venue]/
    │               └── index.astro  # 競馬場別予想ブログ記事
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
// 1. まず computerIndex - 10 で判定
// 2. displayIndex <= 34 → 無印（表示なし）
// 3. 残りを指数降順で印付与

function getMark(rank: number): { mark: string; key: string } {
  if (rank === 0) return { mark: '◎', key: 'honmei' };
  if (rank === 1) return { mark: '○', key: 'taikou' };
  if (rank === 2) return { mark: '▲', key: 'tanana' };
  if (rank <= 9)  return { mark: '△', key: 'renshita' };
  return { mark: '', key: 'none' };
}

// 表示用指数の計算：
// - 本命（◎）: displayIndex = computerIndex - 10
// - それ以外（○▲△無印）: displayIndex = computerIndex - 11
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
- **本命のみ -10、それ以外は -11** した値を表示

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

## 📝 **予想ブログ機能** 📝

### **2026-03-01: 予想ブログ自動生成機能追加**

コンピ指数データを元に、予想ブログ記事を自動生成する機能を追加しました。

#### **機能概要**

- **URL構造**: `/blog/[date]/[venue]`
- **記事一覧**: `/blog` および `/blog/[date]`
- **自動生成**: SSRで毎リクエスト時に最新データから記事を生成

#### **記事の種類**

| カテゴリ | 内容 |
|---------|------|
| **地方競馬** | コンピ指数のみのデータドリブン記事 |
| **南関・中央** | 騎手・調教師データも含めた充実した記事 |

#### **記事内容（地方競馬）**

- コンピ指数上位馬の紹介
- 混戦度分析（堅い・普通・混戦）
- 推奨馬券戦略
- 注目レース（指数が高い上位3レース）

#### **記事内容（南関・中央）**

地方競馬の内容に加えて：
- 騎手・調教師情報
- 斤量、年齢性別データ
- 騎手×調教師コンビの分析

#### **混戦度判定ロジック**

```typescript
指数差 >= 15pt → 堅い   → 単勝・複勝、軸1頭固定の馬連・馬単
指数差 >= 8pt  → 普通   → 馬連・ワイド、上位3頭のボックス
指数差 < 8pt   → 混戦   → 3連複・ワイド、上位馬総流し
```

#### **ナビゲーション**

- トップページにブログCTA追加
- ヘッダーに「予想ブログ」リンク追加
- ブログ記事から指数データページへのリンク
- 日付ナビゲーション（前日・翌日）

---

## 🐛 **バグ修正・変更履歴** 🐛

### **2026-03-01: 予想ブログ機能追加（v1.2）**
- 予想ブログ自動生成機能を実装
- 地方競馬用・南関中央用の2種類のテンプレート
- 混戦度分析と推奨馬券戦略の自動提案
- ブログ一覧ページ、日付別一覧ページ、記事詳細ページを追加
- トップページとヘッダーにブログへの導線を追加

### **2026-02-20: 指数表示ロジック変更**
- 競馬場カードプレビューの指数を -10 に修正（-10前の値が表示されていた）
- 印付与ロジック変更：本命のみ -10、それ以外（○▲△無印）は -11

### **2026-02-18: 初回リリース**
- プロジェクト作成、24競馬場対応
- SSR（output: 'server'）で実装
- 競馬場カードのリンク化（`<a>` タグ）
- 競馬場詳細ページ（レースタブ・ソート・印表示）
- 指数 -10 して34以下を無印に変更
- `renka` → `renshita` 修正

---

**📅 最終更新日**: 2026-03-01
**🏁 Project Phase**: v1.2 運用中
**🎯 Next Priority**: ブログSEO最適化・記事品質向上
**📊 進捗率**: v1.2 完成

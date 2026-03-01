// ブログ記事自動生成ロジック
import type { ComputerData, ComputerRace, ComputerHorse, VenueInfo } from './venues';

export interface BlogArticle {
  date: string;
  venue: VenueInfo;
  title: string;
  content: string;
  summary: string;
  publishedAt: string;
}

interface RaceAnalysis {
  race: ComputerRace;
  topHorse: ComputerHorse;
  secondHorse: ComputerHorse | null;
  indexGap: number;
  混戦度: '堅い' | '普通' | '混戦';
  推奨馬券: string;
}

// 印を取得
function getMark(rank: number): string {
  if (rank === 0) return '◎';
  if (rank === 1) return '○';
  if (rank === 2) return '▲';
  if (rank <= 9) return '△';
  return '';
}

// 表示用指数を計算（本命-10、それ以外-11）
function getDisplayIndex(computerIndex: number, rank: number): number {
  return rank === 0 ? computerIndex - 10 : computerIndex - 11;
}

// レース分析
function analyzeRace(race: ComputerRace): RaceAnalysis {
  // コンピ指数でソート
  const sorted = [...race.horses].sort((a, b) => b.computerIndex - a.computerIndex);

  // displayIndex（-10/-11後）でフィルタリング
  const filtered = sorted.map((horse, idx) => ({
    horse,
    rank: idx,
    displayIndex: getDisplayIndex(horse.computerIndex, idx),
  })).filter(item => item.displayIndex > 34);

  const topHorse = filtered[0]?.horse || sorted[0];
  const secondHorse = filtered[1]?.horse || sorted[1] || null;

  const indexGap = secondHorse
    ? topHorse.computerIndex - secondHorse.computerIndex
    : 99;

  // 混戦度判定
  let 混戦度: '堅い' | '普通' | '混戦';
  if (indexGap >= 15) 混戦度 = '堅い';
  else if (indexGap >= 8) 混戦度 = '普通';
  else 混戦度 = '混戦';

  // 推奨馬券
  let 推奨馬券: string;
  if (混戦度 === '堅い') {
    推奨馬券 = '単勝・複勝、軸1頭固定の馬連・馬単';
  } else if (混戦度 === '普通') {
    推奨馬券 = '馬連・ワイド、上位3頭のボックス';
  } else {
    推奨馬券 = '3連複・ワイド、上位馬総流し';
  }

  return { race, topHorse, secondHorse, indexGap, 混戦度, 推奨馬券 };
}

// 地方競馬用ブログ記事生成（データドリブン）
function generateLocalBlog(data: ComputerData, venue: VenueInfo): string {
  const analyses = data.races.map(analyzeRace);

  let content = `# ${venue.name}競馬 AI指数予想（${data.date}）\n\n`;
  content += `**AI指数による${venue.name}全${data.races.length}レースの本命馬とデータ分析です。**\n\n`;
  content += `---\n\n`;

  // 注目レース（指数が高い上位3レース）
  const topRaces = [...analyses]
    .sort((a, b) => b.topHorse.computerIndex - a.topHorse.computerIndex)
    .slice(0, 3);

  content += `## 📌 本日の注目レース\n\n`;
  topRaces.forEach((analysis, idx) => {
    const displayIdx = getDisplayIndex(analysis.topHorse.computerIndex, 0);
    content += `### ${idx + 1}. ${analysis.race.raceNumber}R ${analysis.race.raceName}\n`;
    content += `**本命：◎${analysis.race.raceNumber}-${analysis.topHorse.number} ${analysis.topHorse.name}（指数${displayIdx}）**\n\n`;
    content += `- 混戦度：**${analysis.混戦度}**\n`;
    content += `- 指数差：${analysis.indexGap}ポイント\n`;
    content += `- 推奨馬券：${analysis.推奨馬券}\n\n`;
  });

  content += `---\n\n`;

  // 全レース予想
  content += `## 🏇 全レース予想\n\n`;

  analyses.forEach(analysis => {
    const { race, topHorse, secondHorse, 混戦度, 推奨馬券 } = analysis;

    content += `### ${race.raceNumber}R ${race.raceName}`;
    if (race.distance) content += ` ${race.surface}${race.distance}m`;
    if (race.startTime) content += ` （${race.startTime}発走）`;
    content += `\n\n`;

    // 上位3頭
    const sorted = [...race.horses].sort((a, b) => b.computerIndex - a.computerIndex);
    const top3 = sorted.slice(0, 3);

    content += `| 印 | 馬番 | 馬名 | 指数 |\n`;
    content += `|:--:|:----:|:-----|:----:|\n`;

    top3.forEach((horse, idx) => {
      const mark = getMark(idx);
      const displayIdx = getDisplayIndex(horse.computerIndex, idx);
      if (displayIdx > 34) {
        content += `| ${mark} | ${horse.number} | ${horse.name} | ${displayIdx} |\n`;
      }
    });

    content += `\n`;
    content += `**混戦度：${混戦度}**  \n`;
    content += `**推奨馬券：${推奨馬券}**\n\n`;
    content += `---\n\n`;
  });

  // フッター
  content += `## 📊 AI指数について\n\n`;
  content += `- AI指数はAIが算出した総合評価値です\n`;
  content += `- 指数が高いほど好走確率が高いと判断されています\n`;
  content += `- 指数差が大きいほど本命馬の信頼度が高まります\n\n`;
  content += `**※馬券購入は自己責任でお願いします**\n`;

  return content;
}

// 南関・中央用ブログ記事生成（補完データ活用）
function generateEnhancedBlog(data: ComputerData, venue: VenueInfo): string {
  const analyses = data.races.map(analyzeRace);

  let content = `# ${venue.name}競馬 AI指数予想（${data.date}）\n\n`;
  content += `**AI指数 × 騎手・調教師データで読み解く${venue.name}全${data.races.length}レースの本命馬予想です。**\n\n`;
  content += `---\n\n`;

  // 注目レース（指数が高い上位3レース）
  const topRaces = [...analyses]
    .sort((a, b) => b.topHorse.computerIndex - a.topHorse.computerIndex)
    .slice(0, 3);

  content += `## 🎯 本日の注目レース\n\n`;
  topRaces.forEach((analysis, idx) => {
    const { race, topHorse } = analysis;
    const displayIdx = getDisplayIndex(topHorse.computerIndex, 0);

    content += `### ${idx + 1}. ${race.raceNumber}R ${race.raceName}\n`;
    content += `**本命：◎${race.raceNumber}-${topHorse.number} ${topHorse.name}（指数${displayIdx}）**\n\n`;

    if (topHorse.jockey || topHorse.trainer) {
      content += `- 騎手：${topHorse.jockey || '不明'}\n`;
      content += `- 調教師：${topHorse.trainer || '不明'}\n`;
    }
    if (topHorse.weight) {
      content += `- 斤量：${topHorse.weight}kg\n`;
    }
    content += `- 混戦度：**${analysis.混戦度}**\n`;
    content += `- 指数差：${analysis.indexGap}ポイント\n`;
    content += `- 推奨馬券：${analysis.推奨馬券}\n\n`;
  });

  content += `---\n\n`;

  // 全レース予想
  content += `## 🏇 全レース予想\n\n`;

  analyses.forEach(analysis => {
    const { race, topHorse, 混戦度, 推奨馬券 } = analysis;

    content += `### ${race.raceNumber}R ${race.raceName}`;
    if (race.distance) content += ` ${race.surface}${race.distance}m`;
    if (race.startTime) content += ` （${race.startTime}発走）`;
    content += `\n\n`;

    // 本命馬の詳細
    const displayIdx = getDisplayIndex(topHorse.computerIndex, 0);
    content += `#### ◎本命：${topHorse.number}番 ${topHorse.name}（指数${displayIdx}）\n\n`;

    if (topHorse.jockey && topHorse.trainer) {
      content += `騎手・調教師コンビの**${topHorse.jockey} × ${topHorse.trainer}**で出走。`;
    }

    if (topHorse.ageGender) {
      content += `${topHorse.ageGender}の`;
    }

    content += `AI指数${displayIdx}で本命評価。\n\n`;

    // 上位5頭の表
    const sorted = [...race.horses].sort((a, b) => b.computerIndex - a.computerIndex);
    const top5 = sorted.slice(0, 5);

    content += `| 印 | 馬番 | 馬名 | 指数 | 騎手 | 調教師 |\n`;
    content += `|:--:|:----:|:-----|:----:|:-----|:-------|\n`;

    top5.forEach((horse, idx) => {
      const mark = getMark(idx);
      const displayIdx = getDisplayIndex(horse.computerIndex, idx);
      if (displayIdx > 34) {
        content += `| ${mark} | ${horse.number} | ${horse.name} | ${displayIdx} | ${horse.jockey || '-'} | ${horse.trainer || '-'} |\n`;
      }
    });

    content += `\n`;
    content += `**混戦度：${混戦度}**  \n`;
    content += `**推奨馬券：${推奨馬券}**\n\n`;
    content += `---\n\n`;
  });

  // フッター
  content += `## 📊 予想のポイント\n\n`;
  content += `- AI指数はAIが算出した総合評価値です\n`;
  content += `- 騎手・調教師データは競馬ブックから取得しています\n`;
  content += `- 指数差が大きいほど本命馬の信頼度が高まります\n`;
  content += `- 混戦レースでは紐荒れに注意が必要です\n\n`;
  content += `**※馬券購入は自己責任でお願いします**\n`;

  return content;
}

// メイン：ブログ記事生成
export function generateBlogArticle(data: ComputerData, venue: VenueInfo): BlogArticle {
  const hasEnhancedData = data.races.some(race =>
    race.horses.some(horse => horse.jockey || horse.trainer)
  );

  const content = hasEnhancedData
    ? generateEnhancedBlog(data, venue)
    : generateLocalBlog(data, venue);

  const summary = `${venue.name}競馬 ${data.date} 全${data.races.length}レースのAI指数予想。AI指数による本命馬と推奨馬券を紹介。`;

  return {
    date: data.date,
    venue,
    title: `${venue.name}競馬 AI指数予想（${data.date}）`,
    content,
    summary,
    publishedAt: new Date().toISOString(),
  };
}

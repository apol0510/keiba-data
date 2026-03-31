/**
 * Netlify Function: Gemini AIレース分析
 * コンピ指数 + 出馬表データを元にAI予想解説を生成
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const PREDICTION_PROMPT = `あなたはkeiba-data.jp（AI指数）の競馬AI予想解説者です。

以下のレース予想データを元に、簡潔な解説コメントを生成してください。

【絶対厳守ルール】
- 提供されたデータのみを使用する。データにない情報は絶対に創作しない
- 直近走データ（recentRaces）がある場合のみ、過去走の着順・会場・距離に触れてよい
- 直近走データがない馬については、コンピ指数と役割だけで言及する
- 「コース適性」「血統」「パドックの気配」など、データにない情報は一切書かない
- 知らないことは書かない。嘘を書くくらいなら書かない

【解説の書き方】
- 3〜5文程度で簡潔にまとめる
- コンピ指数と直近走の着順を組み合わせて解説する
- 例：「本命14番コパノハワードはコンピ指数90と高スコア。前走大井1600mで2着と好走しており安定感がある。逃げ脚質で展開も向きそうだ」
- 直近走で1着があれば「勢いがある」、着順上昇傾向なら「上昇傾向」と表現してよい
- 直近走で着外続きなら「近走は苦戦しているが、AIスコアは高く評価」と表現してよい
- 脚質データ（逃げ・先行・差し・追込）がある場合はレース展開予想に活用する
- 逃げ馬が複数いれば「ハイペース予想」、逃げ馬不在なら「スロー予想」と触れてよい
- マークダウン記法は使わない。プレーンテキストのみ
- 的中を保証する表現は禁止
- 自然な日本語で、競馬ファンに向けた解説口調
- 「keiba-data.jpがお届けする」等の前置き・自己紹介は一切不要。いきなり解説本文から始める
- 箇条書きや番号リストは使わない。文章で書く`;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { type, raceData } = JSON.parse(event.body);

    if (!type || !raceData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'type and raceData are required' })
      };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: PREDICTION_PROMPT,
    });

    const userMessage = formatPredictionData(raceData);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.8,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const comment = result.response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, comment })
    };

  } catch (error) {
    console.error('Race Analysis Error:', error.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, comment: null, error: error.message })
    };
  }
};

/**
 * 通過順から脚質を判定
 */
function judgeRunningStyle(recentRaces) {
  if (!recentRaces || recentRaces.length === 0) return null;

  const styles = recentRaces
    .filter(r => r.passingOrder && r.finish)
    .map(r => {
      const positions = r.passingOrder.split('-').map(Number);
      const firstPos = positions[0];
      const headCount = r.headCount || 12;
      const ratio = firstPos / headCount;

      if (firstPos <= 1) return '逃げ';
      if (ratio <= 0.25) return '先行';
      if (ratio <= 0.6) return '差し';
      return '追込';
    });

  if (styles.length === 0) return null;

  const counts = {};
  styles.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function formatPredictionData(data) {
  const { venue, date, raceNumber, raceName, distance, horseCount, topHorses } = data;
  let text = `【レース情報】\n`;
  text += `${date} ${venue} ${raceNumber}R ${raceName || ''}\n`;
  if (distance) text += `距離: ${distance}m / `;
  if (horseCount) text += `出走頭数: ${horseCount}頭\n`;
  text += `\n【コンピ指数上位馬】\n`;
  topHorses.forEach((h, i) => {
    const style = judgeRunningStyle(h.recentRaces);
    const styleText = style ? ` 脚質:${style}` : '';
    text += `${i + 1}. ${h.role} ${h.horseNumber}番 ${h.horseName} (指数: ${h.computerIndex}) 騎手: ${h.jockey || '不明'}${styleText}\n`;
    if (h.recentRaces && h.recentRaces.length > 0) {
      h.recentRaces.slice(0, 3).forEach((r, idx) => {
        const label = idx === 0 ? '前走' : idx === 1 ? '2走前' : '3走前';
        const rankText = r.finishStatus ? r.finishStatus : `${r.finish}着`;
        text += `   ${label}: ${r.date} ${r.venue}${r.distance}m ${rankText}(${r.headCount}頭中)\n`;
      });
    }
  });

  const styles = topHorses.map(h => judgeRunningStyle(h.recentRaces)).filter(Boolean);
  if (styles.length > 0) {
    const escapeCount = styles.filter(s => s === '逃げ').length;
    const frontCount = styles.filter(s => s === '先行').length;
    text += `\n【上位馬の脚質分布】逃げ:${escapeCount}頭 先行:${frontCount}頭 差し:${styles.filter(s => s === '差し').length}頭 追込:${styles.filter(s => s === '追込').length}頭\n`;
  }

  return text;
}

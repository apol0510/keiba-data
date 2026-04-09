/**
 * Netlify Function: Gemini AIレース分析
 * コンピ指数 + 出馬表データを元にAI予想解説を生成
 * LLMの役割は「語尾整形のみ」。判断・評価・補完は一切させない
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const PREDICTION_PROMPT = `あなたは文章整形ツールです。

入力された各行の語尾だけを自然な日本語に整え、そのまま出力してください。

【絶対厳守ルール】
- 入力文を分解しない、結合しない、意味を拡張しない
- 語尾の調整と句読点の追加のみ許可。語順変更は最小限のみ許可
- 数値・馬名・会場名・距離・着順・指数は一字一句変えない
- 入力にない情報は絶対に追加しない
- 1入力行＝1出力文。行を統合しない
- 以下の表現は禁止: 「安定」「好走」「巻き返し」「期待」「有力」「注目」「実力」「勢い」「堅実」「上昇」「充実」等の評価語
- 以下の接続は禁止: 「〜が」「〜ため」「〜ので」「〜であり」「〜しており」等の因果・逆接表現
- 「コース適性」「血統」「パドック」「展開予想」「能力評価」など入力にない概念は書かない
- 的中を保証する表現は禁止

【出力形式】
- マークダウン記法は使わない。プレーンテキストのみ
- 箇条書きや番号リストは使わない
- 「keiba-data.jpがお届けする」等の前置き・自己紹介は不要。いきなり本文から始める`;

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
        temperature: 0.3,
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
 * recentRaceの1件を検証し、完全なデータのみ返す。不完全なら null
 * 必須: venue（会場名のみ）, distance（数値）, finish（着順数値）or finishStatus
 */
function validateRecentRace(race) {
  if (!race) return null;

  // finish も finishStatus もなければ不完全 → 削除
  const hasFinish = race.finish && typeof race.finish === 'number' && race.finish > 0;
  const hasFinishStatus = race.finishStatus && typeof race.finishStatus === 'string';
  if (!hasFinish && !hasFinishStatus) return null;

  // venue: 会場名のみ抽出（"盛岡 11.17" → "盛岡"、null → 不完全）
  if (!race.venue) return null;
  const venueName = race.venue.replace(/\s+[\d.\/]+$/, '').trim();
  if (!venueName) return null;

  // distance: 数値のみ抽出（"ダ1400" → 1400、"1600" → 1600、null → 不完全）
  let distanceNum = null;
  if (race.distance) {
    const distStr = race.distance.toString().replace(/^[ダ芝障]+/, '').trim();
    const parsed = parseInt(distStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      distanceNum = parsed;
    }
  }
  // distanceがなければ不完全 → 削除
  if (!distanceNum) return null;

  const rankText = hasFinishStatus ? race.finishStatus : `${race.finish}着`;

  return { venue: venueName, distance: distanceNum, rankText };
}

/**
 * 予想データを事前確定された事実文に変換する
 * LLMは「語尾を整えるだけ」
 */
function formatPredictionData(data) {
  const { venue, date, raceNumber, raceName, distance, horseCount, topHorses } = data;

  const facts = [];
  facts.push(`${date} ${venue} ${raceNumber}R${raceName ? ' ' + raceName : ''}${distance ? ' ' + distance + 'm' : ''}${horseCount ? ' ' + horseCount + '頭立て' : ''}`);

  topHorses.forEach(h => {
    // 1行目: 役割・馬番・馬名・コンピ指数
    facts.push(`${h.role}は${h.horseNumber}番${h.horseName}、コンピ指数${h.computerIndex}`);

    // recentRaces を厳密に検証し、完全なデータのみ使用（1走=1行）
    if (h.recentRaces && h.recentRaces.length > 0) {
      let count = 0;
      for (const r of h.recentRaces) {
        const validated = validateRecentRace(r);
        if (!validated) continue;
        const label = count === 0 ? '前走' : count === 1 ? '2走前' : '3走前';
        facts.push(`${label}は${validated.venue}${validated.distance}mで${validated.rankText}`);
        count++;
        if (count >= 3) break;
      }
    }
  });

  return `以下の各行の語尾だけ整えて出力してください。内容の追加・変更・結合は禁止です。\n\n${facts.join('\n')}`;
}

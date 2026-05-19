export const FILTER_CONFIG = [
  { id: 'attributes', label: '屬性', type: 'multi', limit: 5, options: ["全部", "動作", "冒險", "奇幻", "異世界", "魔法", "超能力", "科幻", "機甲", "校園", "喜劇", "戀愛", "青春", "勵志", "溫馨", "悠閒", "料理", "親情", "感人", "運動", "競技", "偶像", "音樂", "職場", "推理", "懸疑", "時間穿越", "歷史", "戰爭", "血腥暴力", "靈異神怪", "黑暗", "特攝", "BL", "GL"] },
  { id: 'type', label: '類型', type: 'single', options: ["全部", "電影", "OVA", "雙語", "泡麵番", "真人演出"] },
  { id: 'audience', label: '對象', type: 'single', options: ["全部", "闔家觀賞", "付費會員", "年齡限制"] }
];

export function createInitialState() {
  return {
    attributes: new Set(['全部']),
    type: '全部',
    audience: '全部'
  };
}

export function filterAnimes(animes, state) {
  // Check strict categories first
  const strictFiltered = animes.filter(anime => {
    if (state.type !== '全部' && !anime.tags.includes(state.type)) return false;
    if (state.audience !== '全部' && !anime.tags.includes(state.audience)) return false;
    return true;
  });

  // If no specific attributes selected, return strict matches
  if (state.attributes.has('全部') || state.attributes.size === 0) {
    return strictFiltered;
  }

  // Calculate matching score for each anime
  const scoredAnimes = strictFiltered.map(anime => {
    let score = 0;
    for (const attr of state.attributes) {
      if (anime.tags.includes(attr)) score++;
    }
    return { anime, score };
  });

  // Find the maximum score achieved
  let maxScore = 0;
  for (const item of scoredAnimes) {
    if (item.score > maxScore) {
      maxScore = item.score;
    }
  }

  // If no anime matches any of the attributes, return empty
  if (maxScore === 0) return [];

  // Return animes that achieved the maximum score (fallback logic)
  return scoredAnimes.filter(item => item.score === maxScore).map(item => item.anime);
}

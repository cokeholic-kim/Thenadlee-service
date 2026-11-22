// OpenWeather 5일 예보(3시간 간격)를 여행지 현지 날짜별로 묶음
//   { 'YYYY-MM-DD': { min, max, emoji, wet: 'RAIN' | 'SNOW' | null, pop } }
//   wet·pop 은 낮 시간(현지 08~20시) 예보만 봄: 비·눈 예보가 있거나 강수확률이 기준 이상이면 wet
const ICONS = { '01': '☀️', '02': '🌤️', '03': '☁️', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
const RAIN_MAINS = ['Rain', 'Drizzle', 'Thunderstorm'];
const SNOW_MAIN = 'Snow';
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const WET_POP = 0.6;
const PERCENT = 100;
const MILLIS = 1000;

// dt(UTC 초) + 현지 시차(초) → 현지 날짜·시각 (Date 의 UTC 값으로 읽음)
const localTime = (dt, timezone) => {
    const local = new Date((dt + timezone) * MILLIS);
    return { date: local.toISOString().slice(0, 10), hour: local.getUTCHours() };
};

const wetKind = (item) => {
    const main = item.weather[0].main;
    if (main === SNOW_MAIN) return 'SNOW';
    return RAIN_MAINS.includes(main) || (item.pop ?? 0) >= WET_POP ? 'RAIN' : null;
};

const addItem = (day, item, hour) => {
    day.min = Math.min(day.min, item.main.temp_min);
    day.max = Math.max(day.max, item.main.temp_max);
    const key = item.weather[0].icon.slice(0, 2);
    day.icons[key] = (day.icons[key] || 0) + 1;
    if (hour < DAY_START_HOUR || hour > DAY_END_HOUR) return;
    day.pop = Math.max(day.pop, item.pop ?? 0);
    const wet = wetKind(item);
    if (wet && day.wet !== 'SNOW') day.wet = wet;
};

const finish = (day) => {
    const icon = Object.entries(day.icons).sort((a, b) => b[1] - a[1])[0][0];
    return { min: Math.round(day.min), max: Math.round(day.max), emoji: ICONS[icon] || '🌡️', wet: day.wet, pop: Math.round(day.pop * PERCENT) };
};

export const summarizeForecast = (list, timezone = 0) => {
    const byDate = {};
    list.forEach((item) => {
        const { date, hour } = localTime(item.dt, timezone);
        byDate[date] = byDate[date] || { min: Infinity, max: -Infinity, icons: {}, wet: null, pop: 0 };
        addItem(byDate[date], item, hour);
    });
    return Object.fromEntries(Object.entries(byDate).map(([date, day]) => [date, finish(day)]));
};

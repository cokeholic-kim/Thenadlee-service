// 월별 여행 가이드 주소 /guide/여행지영문이름/월(1~12)
export const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export const guidePath = (cityName, month) => `/guide/${encodeURIComponent(cityName)}/${month}`;

/** 주소의 월 → 1~12 숫자, 아니면 null */
export const parseMonth = (value) => (/^(?:[1-9]|1[0-2])$/.test(String(value)) ? Number(value) : null);

/** 그달 정보가 있는 달만 (가이드 페이지가 있는 달) */
export const guideMonths = (monthInfos = []) => monthInfos.filter((info) => String(info.description || '').trim()).map((info) => info.month);

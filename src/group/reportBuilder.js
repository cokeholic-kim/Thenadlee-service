import { CATEGORIES, number } from './expenseFormat';

// 함께 낸 묶음마다 붙는 표시 (정산서·이미지에서 구분용)
const BUNDLE_MARKS = ['❤️', '🚆', '🎂', '💚', '⭐', '🎈', '🍀', '💜'];
const BUNDLE_TONES = ['pink', 'mint', 'yellow', 'lavender', 'peach', 'sky', 'lime', 'rose'];
const DAY_MILLIS = 86400000;

export const nightsLabel = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const days = Math.round((new Date(endDate) - new Date(startDate)) / DAY_MILLIS) + 1;
    return days === 1 ? '당일치기' : `${days - 1}박 ${days}일`;
};

// 분류 순서대로 소계와 항목
const byCategory = (expenses) => CATEGORIES
    .map((category) => {
        const items = expenses.filter((expense) => expense.category === category.value).sort((x, y) => x.id - y.id);
        return { category: category.value, emoji: category.emoji, label: category.label, items, total: items.reduce((sum, item) => sum + item.amountKrw, 0) };
    })
    .filter((group) => group.items.length > 0);

/**
 * 지출을 "누구끼리 똑같이 나눴는지"로 묶음 (2명 이상 균등 지출)
 *   혼자 부담한 지출 → 개인 지출, 사람별 금액 지정 → 따로 나눈 지출
 */
const classify = (expenses) => {
    const bundles = new Map();
    const personal = [];
    const custom = [];
    expenses.forEach((expense) => {
        const ids = expense.shares.map((share) => share.memberId).sort((a, b) => a - b);
        if (expense.splitType === 'EQUAL' && ids.length > 1) {
            const key = ids.join(',');
            if (!bundles.has(key)) bundles.set(key, { ids, expenses: [] });
            bundles.get(key).expenses.push(expense);
        } else if (ids.length === 1) personal.push({ ...expense, memberId: ids[0] });
        else custom.push(expense);
    });
    return { bundles: [...bundles.values()], personal, custom };
};

// 전원이면 "전원 (5인)", 지출이 하나뿐인 묶음은 그 지출 이름, 그 외에는 인원 수
const bundleLabel = (bundle, names, allCount) => {
    const people = bundle.ids.map((id) => names[id]).join(', ');
    if (bundle.ids.length === allCount) return { title: `전원 (${allCount}인)`, people, isAll: true };
    if (bundle.expenses.length === 1) return { title: bundle.expenses[0].title, people, isAll: false };
    return { title: `${bundle.ids.length}인`, people, isAll: false };
};

const buildBundles = (rawBundles, names, allCount) => rawBundles
    .map((bundle) => ({ ...bundle, total: bundle.expenses.reduce((sum, expense) => sum + expense.amountKrw, 0) }))
    .sort((a, b) => b.ids.length - a.ids.length || b.total - a.total)
    .map((bundle, index) => ({
        ...bundle,
        ...bundleLabel(bundle, names, allCount),
        mark: BUNDLE_MARKS[index % BUNDLE_MARKS.length],
        tone: BUNDLE_TONES[index % BUNDLE_TONES.length],
        perPerson: bundle.total / bundle.ids.length,
        categories: byCategory(bundle.expenses),
    }));

// 사람별: 속한 묶음의 1인당 금액 + 개인 지출 + 따로 나눈 몫 (실제 정산 금액 owed 는 서버가 원 단위로 계산)
const personParts = (memberId, bundles, personal, custom) => [
    ...bundles.filter((bundle) => bundle.ids.includes(memberId)).map((bundle) => ({ label: bundle.mark, amount: bundle.perPerson })),
    ...personal.filter((item) => item.memberId === memberId).map((item) => ({ label: item.title, amount: item.amountKrw })),
    ...custom.flatMap((expense) => expense.shares.filter((share) => share.memberId === memberId).map((share) => ({ label: expense.title, amount: share.shareKrw }))),
];

const buildPeople = (members, bundles, personal, custom) => members
    .map((member) => {
        const parts = personParts(member.memberId, bundles, personal, custom);
        const exact = parts.reduce((sum, part) => sum + part.amount, 0);
        const remainder = Math.abs(member.owed - exact) >= 1 ? ' (1원 단위 나머지 포함)' : '';
        return { ...member, parts, exact, formula: `${parts.map((part) => number(part.amount)).join(' + ')} = ${number(exact)}${remainder}` };
    })
    .filter((person) => person.parts.length > 0);

/** 정산서 데이터 */
export const buildReport = (group, overview) => {
    const names = Object.fromEntries(overview.members.map((member) => [member.memberId, member.name]));
    const { bundles: rawBundles, personal, custom } = classify(overview.expenses);
    const bundles = buildBundles(rawBundles, names, overview.members.length);
    return {
        title: group.name,
        period: nightsLabel(group.startDate, group.endDate),
        dates: group.startDate ? `${group.startDate} ~ ${group.endDate}` : '',
        totalKrw: overview.totalKrw,
        bundles,
        personal: personal.map((item) => ({ ...item, name: names[item.memberId] })),
        custom,
        people: buildPeople(overview.members, bundles, personal, custom),
        transfers: overview.transfers,
        settled: overview.settled,
    };
};

const bundleText = (bundle) => [
    `${bundle.mark} ${bundle.title}${bundle.isAll ? '' : ` (${bundle.people})`} : ${number(bundle.total)}원`,
    ...bundle.categories.flatMap((category) => [
        `${category.emoji} ${category.label} ${number(category.total)}`,
        ...category.items.map((item) => `- ${item.title} ${number(item.amountKrw)}`),
    ]),
    '',
];

const extraText = (report) => [
    ...(report.personal.length ? ['🙋 개인 지출', ...report.personal.map((item) => `- ${item.name} ${item.title} ${number(item.amountKrw)}`), ''] : []),
    ...(report.custom.length ? ['✂️ 따로 나눈 지출', ...report.custom.map((item) => `- ${item.title} ${number(item.amountKrw)}`), ''] : []),
];

/** 카카오톡 등에 붙여 넣을 텍스트 정산서 */
export const reportToText = (report) => [
    `${report.period ? `${report.period} ` : ''}총 사용 금액 : ${number(report.totalKrw)}원`,
    '',
    ...report.bundles.flatMap(bundleText),
    ...extraText(report),
    ...report.bundles.map((bundle) => `${bundle.mark} 1인당 ${number(bundle.perPerson)}원 (${number(bundle.total)} ÷ ${bundle.ids.length})`),
    '',
    '[개인별]',
    ...report.people.flatMap((person) => [`${person.name} ${number(person.owed)}원`, `  ${person.formula}`]),
    ...(report.transfers.length ? ['', '[송금]', ...report.transfers.map((t) => `${t.fromName} → ${t.toName} ${number(t.amountKrw)}원`)] : []),
].join('\n');

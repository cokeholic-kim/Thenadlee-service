import { planDayTimetable, shorterOrder } from './planDay';

// 서→동 일직선 위 장소를 뒤섞어 둔 하루
const day = {
    startTime: '09:30',
    spots: [
        { spotId: 1, lat: 33.5, lon: 126.30, stayMinutes: 30 },
        { spotId: 2, lat: 33.5, lon: 126.90, stayMinutes: null },
        { spotId: 3, lat: 33.5, lon: 126.40, stayMinutes: 90 },
        { spotId: 4, lat: 33.5, lon: 126.80, stayMinutes: 60 },
    ],
};

test('출발 시각·머무는 시간(없으면 60분)으로 시간표, 이동은 어림', () => {
    const timetable = planDayTimetable(day, 'DRIVING');
    expect(timetable.rows[0].arrive.text).toBe('09:30');
    expect(timetable.rows[0].leave.text).toBe('10:00');
    expect(timetable.rows[1].stay).toBe(60);
    expect(timetable.rows[1].travel.estimated).toBe(true);
});

test('뒤섞인 순서면 더 짧은 순서 안내, 이미 가까운 순서면 null', () => {
    const shorter = shorterOrder(day);
    expect(shorter.afterMeters).toBeLessThan(shorter.beforeMeters);
    const sorted = { ...day, spots: [day.spots[0], day.spots[2], day.spots[3], day.spots[1]] };
    expect(shorterOrder(sorted)).toBeNull();
});

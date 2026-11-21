import { useRef, useState } from 'react';

// 이만큼 움직여야 끌기로 봄 (그보다 작으면 클릭)
const DRAG_THRESHOLD_PX = 5;
const SHIFT_TRANSITION = 'transform 0.15s';
const IDLE = { from: -1, over: -1, offset: 0, shift: 0 };

// 끌고 있는 카드의 가운데가 지나간 다른 카드 수 = 놓을 자리
const findOver = (rects, from, offset) => {
    const center = rects[from].top + rects[from].height / 2 + offset;
    return rects.filter((rect, index) => index !== from && rect.top + rect.height / 2 < center).length;
};

// 끄는 카드가 비운 자리만큼 사이의 카드들을 밀어 줌
const shiftOf = (rects, from) => {
    const next = rects[from + 1] || rects[from - 1];
    return next ? Math.abs(next.top - rects[from].top) : rects[from].height;
};

const styleFor = (drag, index) => {
    if (drag.from < 0) return undefined;
    if (index === drag.from) return { transform: `translateY(${drag.offset}px)`, zIndex: 10, position: 'relative' };
    if (index > drag.from && index <= drag.over) return { transform: `translateY(${-drag.shift}px)`, transition: SHIFT_TRANSITION };
    if (index < drag.from && index >= drag.over) return { transform: `translateY(${drag.shift}px)`, transition: SHIFT_TRANSITION };
    return { transition: SHIFT_TRANSITION };
};

// 마우스는 카드 어디든, 터치는 손잡이로만 끌기 (화면 스크롤과 겹치지 않게). 다른 버튼 누름은 끌기로 보지 않음
const canStart = (event) => !event.target.closest('button:not([data-drag-handle])')
    && (event.pointerType === 'mouse' || Boolean(event.target.closest('[data-drag-handle]')));

const startDrag = (session, event, index) => {
    if (event.button > 0 || !canStart(event)) return;
    if (event.pointerType === 'mouse') event.preventDefault();
    const rects = [...event.currentTarget.parentElement.children].map((el) => el.getBoundingClientRect());
    session.current = { from: index, over: index, startY: event.clientY, rects, active: false };
    event.currentTarget.setPointerCapture(event.pointerId);
};

const moveDrag = (session, event, setDrag) => {
    const current = session.current;
    if (!current) return;
    const offset = event.clientY - current.startY;
    if (!current.active && Math.abs(offset) < DRAG_THRESHOLD_PX) return;
    current.active = true;
    current.over = findOver(current.rects, current.from, offset);
    setDrag({ from: current.from, over: current.over, offset, shift: shiftOf(current.rects, current.from) });
};

const endDrag = (session, setDrag, onMove, commit) => {
    const current = session.current;
    session.current = null;
    setDrag(IDLE);
    if (commit && current?.active && current.over !== current.from) onMove(current.from, current.over);
};

/**
 * 목록 순서를 끌어서 바꾸기 (마우스·터치 공통 Pointer Events)
 *   itemProps(index) 를 각 항목(li)에 펼쳐 넣고, 놓으면 onMove(from, to) 호출
 */
const useDragSort = (onMove) => {
    const [drag, setDrag] = useState(IDLE);
    const session = useRef(null);
    const itemProps = (index) => ({
        onPointerDown: (event) => startDrag(session, event, index),
        onPointerMove: (event) => moveDrag(session, event, setDrag),
        onPointerUp: () => endDrag(session, setDrag, onMove, true),
        onPointerCancel: () => endDrag(session, setDrag, onMove, false),
        style: styleFor(drag, index),
        'data-dragging': drag.from === index ? 'true' : undefined,
    });
    return { itemProps, dragging: drag.from >= 0 };
};

export default useDragSort;

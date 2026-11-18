import React, { useMemo, useRef } from 'react';
import { number } from './expenseFormat';
import { buildReport, reportToText } from './reportBuilder';
import useCardExport from './useCardExport';
import './SettlementReport.scss';

const BundleSection = ({ bundle }) => (
    <section className="report-bundle">
        <h3 className={`report-chip tone-${bundle.tone}`}>
            <span>{bundle.mark} {bundle.title}{bundle.isAll ? '' : ` (${bundle.people})`}</span>
            <strong>{number(bundle.total)}원</strong>
        </h3>
        {bundle.categories.map((category) => (
            <div key={category.category} className="report-category">
                <p className="report-category__head"><span>{category.emoji} {category.label}</span><span>{number(category.total)}</span></p>
                <ul>{category.items.map((item) => <li key={item.id}><span>{item.title}</span><span>{number(item.amountKrw)}</span></li>)}</ul>
            </div>
        ))}
    </section>
);

const ExtraList = ({ title, items, describe }) => (
    <section className="report-bundle">
        <h3 className="report-chip tone-gray"><span>{title}</span></h3>
        <ul className="report-plain">{items.map((item) => <li key={item.id}><span>{describe(item)}</span><span>{number(item.amountKrw)}</span></li>)}</ul>
    </section>
);

const PerPersonSection = ({ report }) => (
    <section className="report-summary">
        {report.bundles.map((bundle) => (
            <p key={bundle.ids.join()} className="report-perperson">
                <strong>{bundle.mark} 1인당 {number(bundle.perPerson)}원</strong>
                <span>{number(bundle.total)} ÷ {bundle.ids.length} = {number(bundle.perPerson)}</span>
            </p>
        ))}
        <h3 className="report-subtitle">[개인별]</h3>
        <ul className="report-people">
            {report.people.map((person) => (
                <li key={person.memberId}>
                    <p><strong>{person.name}</strong><span className="report-people__marks">{person.parts.map((part) => part.label).join(' + ')}</span><b>{number(person.owed)}원</b></p>
                    <span className="report-formula">{person.formula}</span>
                </li>
            ))}
        </ul>
    </section>
);

const TransferSection = ({ report }) => (
    <section className="report-summary">
        <h3 className="report-subtitle">[송금]</h3>
        {report.settled && <p className="report-done">모두 정산 끝! 🎉</p>}
        <ul className="report-plain">{report.transfers.map((t) => <li key={`${t.fromId}-${t.toId}`}><span>{t.fromName} → {t.toName}</span><span>{number(t.amountKrw)}원</span></li>)}</ul>
    </section>
);

/** 정산서 카드 (이미지로 저장되는 영역) */
const ReportCard = React.forwardRef(({ report }, ref) => (
    <div className="report-card" ref={ref}>
        <p className="report-card__group">{report.title}{report.dates ? ` · ${report.dates}` : ''}</p>
        <h2 className="report-card__total">{report.period ? `${report.period} ` : ''}총 사용 금액 : {number(report.totalKrw)}원</h2>
        {report.bundles.map((bundle) => <BundleSection key={bundle.ids.join()} bundle={bundle} />)}
        {report.personal.length > 0 && <ExtraList title="🙋 개인 지출" items={report.personal} describe={(item) => `${item.name} · ${item.title}`} />}
        {report.custom.length > 0 && <ExtraList title="✂️ 따로 나눈 지출" items={report.custom}
            describe={(item) => `${item.title} (${item.shares.map((share) => `${share.name} ${number(share.shareKrw)}`).join(', ')})`} />}
        <PerPersonSection report={report} />
        {(report.transfers.length > 0 || report.settled) && <TransferSection report={report} />}
        <p className="report-card__footer">더 나들이 · 정산 도우미</p>
    </div>
));

const useExport = (cardRef, report) => {
    const { busy, saveImage } = useCardExport(cardRef, `${report.title}_정산서`);
    const copyText = () => navigator.clipboard?.writeText(reportToText(report))
        .then(() => alert('정산서를 복사했어요. 카톡방에 붙여 넣어 보세요.'))
        .catch(() => alert('복사하지 못했어요. 브라우저 권한을 확인해 주세요.'));
    return { busy, saveImage, copyText };
};

// 정산서: 함께 낸 묶음별 분류·항목, 1인당 계산식, 개인별 합계, 송금 → 이미지 저장·텍스트 복사
const SettlementReport = ({ group, overview }) => {
    const report = useMemo(() => buildReport(group, overview), [group, overview]);
    const cardRef = useRef(null);
    const { busy, saveImage, copyText } = useExport(cardRef, report);
    if (overview.expenses.length === 0) return null;
    return (
        <section className="group-section">
            <div className="report-toolbar">
                <h2>정산서</h2>
                <button type="button" className="group-button is-small" onClick={copyText}>텍스트 복사</button>
                <button type="button" className="group-button is-small is-primary" onClick={saveImage} disabled={busy}>{busy ? '만드는 중…' : '이미지로 저장'}</button>
            </div>
            <ReportCard ref={cardRef} report={report} />
        </section>
    );
};

export default SettlementReport;

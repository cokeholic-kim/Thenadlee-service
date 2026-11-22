import './RightControlbar.scss' ;
import { useParams, useSearchParams } from 'react-router-dom';
import AddSpot from './AddSpot';
import { useSelector } from 'react-redux';
import { useCallback, useMemo, useState } from 'react';
import { providerFor } from '../map/mapProvider';
import useSpotActions from '../community/useSpotActions';
import SpotModals from '../community/SpotModals';
import { GroupMapBanner } from '../group/GroupMapContext';
import { ALL_CATEGORIES, countCategories } from '../community/spotCategories';
import { countTags } from '../community/spotTags';
import '../community/Community.scss';
import { useSpotCategoryRequest } from './mapPanelEvents';

// 추천 장소 보기 필터 (서버 spot.source 값)
const SPOT_FILTERS = [
    { value: 'ALL', label: '전체' },
    { value: 'OFFICIAL', label: '운영진 추천' },
    { value: 'USER', label: '여행자 추천' },
];

// 그 도시 목록에 있는 종류만 개수와 함께 (종류가 하나뿐이면 숨김)
const CategoryFilter = ({ categories, value, onChange }) => (categories.length < 2 ? null : (
    <div className="spot-toolbar__categories" role="group" aria-label="장소 종류">
        <button type="button" className={value === ALL_CATEGORIES ? 'is-active' : ''} onClick={() => onChange(ALL_CATEGORIES)}>모든 종류</button>
        {categories.map((category) => (
            <button key={category.value} type="button" className={value === category.value ? 'is-active' : ''}
                onClick={() => onChange(category.value)}>{category.label} <span>{category.count}</span></button>
        ))}
    </div>
));

// 상황 태그(아이와 함께·비 오는 날 등): 하나만 고르고, 다시 누르면 풂
const TagFilter = ({ tags, value, onChange }) => (tags.length === 0 ? null : (
    <div className="spot-toolbar__categories spot-toolbar__tags" role="group" aria-label="상황">
        {tags.map((tag) => (
            <button key={tag.value} type="button" className={value === tag.value ? 'is-active' : ''} aria-pressed={value === tag.value}
                onClick={() => onChange(value === tag.value ? null : tag.value)}>{tag.icon} {tag.label} <span>{tag.count}</span></button>
        ))}
    </div>
));

const SpotToolbar = ({ filters, onRegister }) => (
    <div className="spot-toolbar">
        <div className="spot-toolbar__filters">
            {SPOT_FILTERS.map((option) => (
                <button key={option.value} type="button" className={filters.source === option.value ? 'is-active' : ''}
                    onClick={() => filters.setSource(option.value)}>{option.label}</button>
            ))}
        </div>
        <CategoryFilter categories={filters.categories} value={filters.category} onChange={filters.setCategory} />
        <TagFilter tags={filters.tags} value={filters.tag} onChange={filters.setTag} />
        <button type="button" className="spot-toolbar__register" onClick={onRegister}>+ 나만 아는 장소 등록</button>
    </div>
);

// 출처(운영진·여행자)·종류·상황 태그를 함께 적용. 고른 종류가 목록에서 사라지면(일정에 다 담음 등) 전체로 되돌림
// 종류별 추천 페이지(/spots/도시/종류)에서 넘어오면 ?category= 로 처음 필터를 정함
const useSpotFilters = (spots) => {
    const [searchParams] = useSearchParams();
    const [source, setSource] = useState('ALL');
    const [picked, setCategory] = useState(() => searchParams.get('category') || ALL_CATEGORIES);
    const [pickedTag, setTag] = useState(null);
    // "구성 안내"에서 고른 종류: 운영진·여행자 구분은 풀고 그 종류만
    const showCategory = useCallback((value) => { setSource('ALL'); setCategory(value); }, []);
    useSpotCategoryRequest(showCategory);
    const bySource = spots.filter((spot) => source === 'ALL' || spot.source === source);
    const categories = countCategories(bySource);
    const category = categories.some((option) => option.value === picked) ? picked : ALL_CATEGORIES;
    const byCategory = bySource.filter((spot) => category === ALL_CATEGORIES || spot.category === category);
    const tags = countTags(byCategory);
    const tag = tags.some((option) => option.value === pickedTag) ? pickedTag : null;
    const visible = byCategory.filter((spot) => !tag || spot.tags.includes(tag));
    return { source, setSource, category, setCategory, categories, tag, setTag, tags, visible };
};

const RightControlbar = ({ marker, place, onLocate, highlightId, mobileHidden }) => (
    <RightControlPage data={marker} place={place} onLocate={onLocate} highlightId={highlightId} mobileHidden={mobileHidden} />
);

export default RightControlbar;

// 오른쪽 추천 장소 목록: 운영진 추천 / 여행자 추천 구분, 여행자 장소 등록
function RightControlPage({ place, onLocate, highlightId, mobileHidden }) {
    const { places } = useParams()
    const actions = useSpotActions(places)
    const rightdata = useSelector(state=>state.add.right)
    const center = useMemo(() => ({ lat: place.lat, lng: place.lon }), [place.lat, place.lon])
    const filters = useSpotFilters(rightdata)

    return (
        <div className={` RightControlbar${mobileHidden ? ' is-mobile-hidden' : ''}`}>
            <div className=" RightControlbar_inner">
                <div className=" RightControlbar_header">
                    <p>추천장소</p>
                </div>
                <GroupMapBanner />
                <SpotToolbar filters={filters} onRegister={() => actions.open('form')} />
                <ul className=" RightControlbar_contents">
                    {filters.visible.map((d)=><AddSpot key={d.id} spot={d} onLocate={onLocate} isLocated={highlightId === d.id} onOpen={(spot) => actions.open('detail', spot)}/>)}
                </ul>
            </div>
            <SpotModals cityName={places} center={center} provider={providerFor(place.region)} actions={actions} />
        </div>
    )
}

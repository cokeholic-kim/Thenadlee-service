import React from 'react';
import { Link } from 'react-router-dom';
import './FindPlace.scss' ;

function FindPlace () {
    return (
        <div className='FindPlace'>
            <div className='FindPlaceP'>
                <p className='FindPlaceP1'>어디로 여행을 떠나시나요?</p>
                <p className='FindPlaceP2'>여행지를 검색하거나 목록에서 직접 선택해주세요</p>
            </div>
            <div className='FindPlace_country'>
                <div className='FindPlace_country_detail'>
                    <div className='FindPlace_country_detail_left'>
                        <div className='FindPlace_country_detail_left_img'>
                            <img src="https://www.myro.co.kr/myro_image/city/jeju.jpg" alt="제주도"></img>
                        </div>
                    </div>
                    <div className='FindPlace_country_detail_right'>
                        <div className='FindPlace_country_detail_right_title'>
                            <p>Jeju</p>
                            <p><span>대한민국 제주도</span></p>
                        </div>
                        <p className='FindPlace_country_detail_right_p'>
                            섬 전체가 하나의 거대한 관광자원인 제주도, 에메랄드 빛 물빛이 인상적인 협재 해수욕장은
                            제주 대표 여행지이며, 파도가 넘보는 주상절리와 용머리 해안은 제주에서만 볼 수 있는
                            천혜의 자연경관으로 손꼽힌다. 드라마 촬영지로 알려진 섭지코스는 꾸준한 사랑을 받고 있으며
                            한라봉과 흑돼지, 은갈치 등은 제주를 대표하는 음식이다
                        </p>
                        <div className='FindPlace_country_detail_right_button'>
                            <Link to="/map/Jeju"><button>일정만들기</button></Link>
                        </div>
                    </div>
                </div>
                <div className='FindPlace_country'>
                    <div className='FindPlace_country_detail'>
                        <div className='FindPlace_country_detail_left'>
                            <div className='FindPlace_country_detail_left_img'>
                                <img src="https://myro.co.kr/myro_image/city/singapore.jpg" alt='싱가포르'></img>
                            </div>
                        </div>
                        <div className='FindPlace_country_detail_right'>
                            <div className='FindPlace_country_detail_right_title'>
                                <p>Singapore</p>
                                <p><span>싱가포르</span></p>
                            </div>
                            <p className='FindPlace_country_detail_right_p'>
                                여유로운 분위기, 쾌적한 환경, 편리한 대중교통, 다양한 볼거리와 즐길거리로 꾸준히 사랑받고 있는
                                여행지 싱가포르, 깨끗하고 치안이 좋아 혼자 여행을 준비하는 사람들에게도 인기 있는 곳이다.
                                도시가 크지 않아 왠만한 거리는 걷거나 지하철을 이용해서 다니기 수월하다
                            </p>
                            <div className='FindPlace_country_detail_right_button'>
                                <button><Link to="/map/Singapore">일정만들기</Link></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='FindPlace_country'>
                    <div className='FindPlace_country_detail'>
                        <div className='FindPlace_country_detail_left'>
                            <div className='FindPlace_country_detail_left_img'>
                                <img className='haerbinpic' src="https://www.travelchina.org.cn/gjlycms/sitefiles/img/gjly_zh/tourcity/14937052039131080.jpg" alt='하얼빈'></img>
                            </div>
                        </div>
                        <div className='FindPlace_country_detail_right'>
                            <div className='FindPlace_country_detail_right_title'>
                                <p>China</p>
                                <p><span>중국 하얼빈</span></p>
                            </div>
                            <p className='FindPlace_country_detail_right_p'>
                            동서양의 문화가 조화롭게 혼재되어 도시를 가득 채운 이국적 풍경을 마주하니 지금 선 이곳이 과연 중국인지, 유럽인지 아리송하다.
                            사람들이 얼음과 눈 세상에 푹 빠질 수 있는 도시가 과연 얼마나 될까?
                            해마다 겨울이 되면 꽁꽁 언 쑹화강에 하얼빈 얼음 축제(Harbin Ice and Snow World)가 열리면 행복한 웃음이 가득 피어오른다. 
                            사람들은 축제를 즐기며 추위를 잊고 얼어버린 세상을 즐기게 된다. 생동감 넘치는 얼음 등불 쇼, 실물처럼 생생한 얼음 조각을 관람하고 산에서 스키를 타거나 빙하에서 스케이트를 타며 신나는 시간을 가져보자.
                            </p>
                            <div className='FindPlace_country_detail_right_button'>
                                <button><Link to="/map/Harbin">일정만들기</Link></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='FindPlace_country'>
                    <div className='FindPlace_country_detail'>
                        <div className='FindPlace_country_detail_left'>
                            <div className='FindPlace_country_detail_left_img'>
                                <img src="https://www.myro.co.kr/myro_image/city/vancouver.jpg" alt='밴쿠버'></img>
                            </div>
                        </div>
                        <div className='FindPlace_country_detail_right'>
                            <div className='FindPlace_country_detail_right_title'>
                                <p>Canada</p>
                                <p><span>캐나다 벤쿠버</span></p>
                            </div>
                            <p className='FindPlace_country_detail_right_p'>
                                캐나다 서부 BC 주에서 가장 큰 도시인 벤쿠버는 매년 세계에서 살기 좋은 도시 순위에서 5위
                                안에 손꼽히는 인기 지역이다. 다양한 인종과 문화가 공존하는 멜팅팟으로 유명하며 사회 전반에
                                다양한 인종들이 진출해있다. 한국계 캐나다인 중 최초로 연방 상원 의원에 선출된 연아 마틴의 연고지로도 유명하다.
                                </p>
                            <div className='FindPlace_country_detail_right_button'>
                                <button><Link to="/map/Vancouver">일정만들기</Link></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindPlace;
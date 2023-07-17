import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import './Guide.scss';

const Guide = () => {
    return (
        <div>
            <Header/>
            <div className="wrapper">
            <div className="top-container">
                <h1><b>4단계로 간편하게 끝내는 여행 스케줄링</b></h1>
            </div>
            <div style={{width: "100%",margin:"0 auto"}}>
                <div className="section-container">
                    <div className="flex-container-reverse">
                        <div className="half-flex-div-video">
                            <div className="video-container"><div className="vsc-controller"></div>
                                <video autoPlay muted loop className="video-div" id="video01" name="guideVideo">
                                    <source src="./videos/GuideVideo01.mp4" type="video/mp4"/>
                                </video>
                            </div>
                        </div>
                        <div className="half-flex-div-text">
                            <div className="section-title-text">
                                1. 여행지 선택
                            </div>
                            <div className="section-text">
                                먼저 여행을 떠날 도시를 선택하세요.
                            </div>
                            <div className="section-text">
                                100여개의 유명 여행지가 준비되어 있으며, 지속적으로 업데이트 중입니다.
                            </div>
                            <div className="section-text">
                                인기 여행지, 대륙별 필터를 이용해 검색
                                결과를 좁힐 수 있습니다.
                            </div>
                            <div className="section-text">
                                도시를 선택하고 간단한 여행 정보들을
                                확인해보세요.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-container">
                    <div className="flex-container">
                        <div className="half-flex-div-video">
                            <div className="video-container"><div className="vsc-controller"></div>
                                <video autoPlay muted loop className="video-div" id="video02" name="guideVideo">
                                    <source src="/videos/GuideVideo02.mp4" type="video/mp4"/>
                                </video>
                            </div>
                        </div>
                        <div className="half-flex-div-text">
                            <div className="section-title-text">
                                2. 장소 선택
                            </div>
                            <div className="section-text">
                                여행 일자, 숙소, 가고 싶은 장소만
                                선택하세요.
                            </div>
                            <div className="section-text">
                                숙소를 정하지 않았어도, 가고 싶은 장소를
                                정하지 않았어도 상관없어요.
                            </div>
                            <div className="section-text">
                                유저 데이터를 기반으로 더 나드리가 추천해주는
                                장소들을 선택하세요.
                            </div>
                            <div className="section-text">
                                검색해도 나오지 않는 장소들은 직접 등록이
                                가능합니다.
                            </div>
                            <div className="section-text">
                                선택이 끝났다면 일정 생성 버튼을 눌러 작성을
                                완료하세요.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-container">
                    <div className="flex-container-reverse">
                        <div className="half-flex-div-video">
                            <div className="video-container"><div className="vsc-controller"></div>
                               <video autoPlay muted loop className="video-div" id="video03" name="guideVideo">
                                    <source src="./videos/GuideVideo03.mp4" type="video/mp4"/>
                                </video>
                            </div>
                        </div>
                        <div className="half-flex-div-text">
                            <div className="section-title-text">
                                3. 일정 확인 및 편집
                            </div>
                            <div className="section-text">
                                더 나드리의 인공지능이 위치, 동선, 장소별 영업시간 등
                                여행 일정에 필요한 모든 요소를 고려하여
                                만들어준 최적의 여행 일정을 확인하세요.
                            </div>

                            <div className="section-text">
                                장소를 드래그하여 일정을 수정하고 일자별
                                스케줄을 확인해보세요.
                            </div>
                            <div className="section-text">
                                일정을 저장하면 웹이나 앱에서 언제든지
                                편집이 가능하고 친구와 공유도 가능합니다.
                            </div>
                            </div>
                    </div>
                </div>
                <div className="section-container">
                    <div className="flex-container">
                        <div className="half-flex-div-video">
                            <div className="video-container"><div className="vsc-controller"></div>
                                                                    
                                <video autoPlay muted="" loop="" className="video-div" id="video04" name="guideVideo">
                                    <source src="./videos/GuideVideo04.mp4" type="video/mp4"/>
                                </video>
                            </div>
                        </div>
                        <div className="half-flex-div-text">
                            <div className="section-title-text">4. 여행</div>
                            <div className="section-text">
                                모든 준비가 끝났습니다.
                            </div>
                            <div className="section-text">
                                웹에서나 앱에서나 마이페이지에서 일정을
                                확인하세요.
                            </div>
                            <div className="section-text">
                                일정표를 엑셀로 출력하거나 모바일 일정표를
                                보며 여행을 즐기세요.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Guide;
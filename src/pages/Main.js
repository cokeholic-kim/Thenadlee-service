import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import FindPlace from "./FindPlace";
import MainTop from "./MainTop";
import MainFeatures from "./MainFeatures";
import PromoBanner from "../marketing/PromoBanner";
import AdSenseUnit from "../marketing/AdSenseUnit";
import { ADSENSE_SLOTS } from "../config/ads";
import Footer from '../components/Footer';
import Header from '../components/Header';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';


// "/#places" (일정 만들러 가기 등)로 들어오면 여행지 목록까지 내려 줌
const usePlacesHash = () => {
    const { hash } = useLocation();
    useEffect(() => {
        if (hash !== '#places') return undefined;
        const timer = setTimeout(() => document.querySelector('.FindPlaceP')?.scrollIntoView({ behavior: 'smooth' }), 300);
        return () => clearTimeout(timer);
    }, [hash]);
};

function Main(){
    usePageMeta(PAGE_META.home);
    usePlacesHash();
    function moveto(e){
        e.preventDefault()
        document.querySelector(".FindPlaceP").scrollIntoView({behavior:'smooth'})
    }


    return(
        <div>
            <Header moveto={moveto}/>
            <MainTop moveto={moveto}/>
            <MainFeatures/>
            <PromoBanner onScroll={moveto}/>
            <FindPlace/>
            <AdSenseUnit slot={ADSENSE_SLOTS.main}/>
            <Footer/>
        </div>
    )
}

export default Main

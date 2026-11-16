import React from "react";
import FindPlace from "./FindPlace";
import MainBottom from "./MainBottom";
import MainTop from "./MainTop";
import Footer from '../components/Footer';
import Header from '../components/Header';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';


function Main(){
    usePageMeta(PAGE_META.home);
    function moveto(e){
        e.preventDefault()
        document.querySelector(".FindPlaceP").scrollIntoView({behavior:'smooth'})
    }


    return(
        <div>
            <Header moveto={moveto}/>
            <MainTop moveto={moveto}/>
            <MainBottom/>
            <FindPlace/>
            <Footer/>
        </div>
    )
}

export default Main
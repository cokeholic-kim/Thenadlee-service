import html2canvas from 'html2canvas';
import React from 'react';
import { AiOutlineConsoleSql } from 'react-icons/ai';
import './MultiButton.scss';

const MultiButton = ({setBlog,setRecommend}) => {
    const copyMAP =()=>{
        html2canvas(document.getElementsByClassName('App')[0],{ useCORS: true }).then(canvas=>{
           onSaveAs(canvas.toDataURL('image/png'),'image-download.png')
        })
    }
    // copyMAP.getContext("2d",{
    //     willReadFrequently:true,
    // })
    const onSaveAs =async (uri,filename)=>{
        try{
            let link = document.createElement('a');
            document.body.appendChild(link);
            link.href = uri
            link.download = filename;
            link.click()
            document.body.removeChild(link)
            alert("일정을 저장했습니다. enjoy your travel with TheNadlee")
        }
        catch(err){console.log(err)}
    }

    return (
        <div id='blockbtn'>
            <a href='#' onClick={()=>setBlog(true)}>여행기</a>
            <a href='#' onClick={()=>setRecommend(true)}>추천일정</a>
            <a href='#' onClick={()=>copyMAP()}>일정생성</a>
        </div>
    );
};

export default MultiButton;
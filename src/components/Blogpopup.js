import React, { useEffect, useState } from "react";
import "./Blogpopup.scss";

const close = () =>{
    const blog = document.querySelector(".blogModal")
    blog.classList.add('hidden')
}

// 주소는 나중에 데이터베이스에서 받아올 예정 .
const Blogpopup = ({setBlog,place}) => {
    const [url,seturl] = useState(place.blog1)
    // const BlogPost = (post)=>{console.log(post)}
    function BlogPost(post){seturl(post)}
  return (
    <div className="blogModal" >
        <div className="blogpopup">
            <div className="categorybuttons">
                <div className="categories">
                    <div title={`${place.kor_cityname} 여행기1`} className="categorybutton" onClick={()=>BlogPost(place.blog1)}>
                        <div className="categorytitle">{`${place.kor_cityname} 여행기1`}</div>
                        <div className="categorydate">2021.08</div>
                    </div>
                    </div>
                    <div className="categories">
                    <div title={`${place.kor_cityname} 여행기2`} className="categorybutton" onClick={()=>BlogPost(place.blog2)}>
                        <div className="categorytitle">{`${place.kor_cityname} 여행기2`}</div>
                        <div className="categorydate">2022.02</div>
                    </div>
                    </div>
                    <div className="categories">
                    <div title={`${place.kor_cityname} 여행기3`} className="categorybutton" onClick={()=>BlogPost(place.blog3)}>
                        <div className="categorytitle">{`${place.kor_cityname} 여행기3`}</div>
                        <div className="categorydate">2017.06</div>
                    </div>
                </div>
            </div>
            <div className="posts">
                <div className="close" onClick={()=>setBlog(false)}>x</div>
                <h4>여행일기</h4>
                <p style={{ color: "#e0e0e0" }}>TRAVELDIARY</p>
                <div id="blogframe">
                    <iframe
                        title="1"
                        src={url} className="travediary-frame"
                    ></iframe>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Blogpopup;

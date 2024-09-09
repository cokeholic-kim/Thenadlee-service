import React, { useEffect, useState } from "react";
import "./Blogpopup.scss";


const Blogpopup = ({setBlog,place}) => {
    const [url,seturl] = useState(place.postUrl[0])
    function BlogPost(post){seturl(post)}
  return (
    <div className="blogModal" >
        <div className="blogpopup">
            <div className="categorybuttons">
                <div className="categories">
                    {place.postUrl.map( (url,index) => {
                        return (
                        <div title={`${place.name} ${index}`} className="categorybutton" onClick={()=>BlogPost(url)}>
                        <div className="categorytitle">{`${place.name} ${index + 1}`}</div>
                    </div>
                        )
                    })}
                </div>
            </div>
            <div className="posts">
                <div style={{fontSize: 30}} className="close" onClick={()=>setBlog(false)}>x</div>
                <h2>여행일기</h2>
                <p style={{ color: "#e0e0e0",fontSize: 22 }}>TRAVELDIARY</p>
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

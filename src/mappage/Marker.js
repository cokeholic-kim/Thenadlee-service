import { Wrapper } from "@googlemaps/react-wrapper";

const Marker = ({ text, target}) => {
    let icon = target ? { name : "icon_dot", width : "10px" } : { name :"icon_default", width : "40px" };
  
    return (
      <Wrapper
        className="marker"
        alt={text}>
            <img src={`https://place-now....com/marker/${icon.name}.png`} alt={text} width={icon.width}/>
      </Wrapper>
    );
  } 
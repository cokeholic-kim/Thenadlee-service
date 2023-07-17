import { Autocomplete } from '@react-google-maps/api'
const { Component } = require('react')

export class SearchBox extends Component {
    constructor (props) {
      super(props)
  
      this.autocomplete = null
  
      this.onLoad = this.onLoad.bind(this)
      this.onPlaceChanged = this.onPlaceChanged.bind(this)
    }
  
    onLoad (autocomplete) {
      console.log('autocomplete: ', autocomplete)
      this.autocomplete = autocomplete
    }
  
    onPlaceChanged (map) {
      if (this.autocomplete !== null) {
        let serachpoint =  (this.autocomplete.getPlace().geometry.location)
        map.panTo({lat:serachpoint.lat(),lng:serachpoint.lng()})
      } else {
        console.log('Autocomplete is not loaded yet!')
      }
    }
  

    render () {
      const {map} = this.props
      return (
        <Autocomplete
          onLoad={this.onLoad}
          onPlaceChanged={()=>this.onPlaceChanged(map)}
        >
          <input className='searchBox'
            type="text"
            placeholder="Customized your placeholder"
            style={{
              boxSizing: `border-box`,
              border: `1px solid transparent`,
              width: `240px`,
              height: `32px`,
              padding: `0 12px`,
              borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
              fontSize: `14px`,
              outline: `none`,
              textOverflow: `ellipses`,
              position: "absolute",
              left: "45%",
              bottom:"10%",
              marginLeft: "-120px"
            }}
          />
        </Autocomplete>
      )
    }
  }
  
  <SearchBox />
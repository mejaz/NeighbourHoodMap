import React, { Component } from 'react'
import LocationList from './LocationList'
import { MY_LOCATIONS } from '../consts'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'alllocations': MY_LOCATIONS,
      'map': '',
      'infowindow': '',
      'prevmarker': ''
    };

    this.initMap = this.initMap.bind(this)
    this.openInfoWindow = this.openInfoWindow.bind(this)
    this.closeInfoWindow = this.closeInfoWindow.bind(this)
  }

  componentDidMount() {
    window.initMap = this.initMap
    loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyBPYmscV7S_fKralMKoEAryLRZVvQVL6f8&callback=initMap')
  }

  initMap() {
    var self = this

    var mapview = document.getElementById('map')
    mapview.style.height = window.innerHeight + "px"
    var map = new window.google.maps.Map(mapview, {
      center: {lat: 28.6139, lng: 77.2090},
      zoom: 11,
      mapTypeControl: false
    })

    var InfoWindow = new window.google.maps.InfoWindow({})
    window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
      self.closeInfoWindow()
    })

    this.setState({
      'map': map,
      'infowindow': InfoWindow
    })

    window.google.maps.event.addDomListener(window, "resize", function () {
      var center = map.getCenter()
      window.google.maps.event.trigger(map, "resize")
      self.state.map.setCenter(center)
    })

    window.google.maps.event.addListener(map, 'click', function () {
      self.closeInfoWindow()
    })

    var alllocations = []
    this.state.alllocations.forEach(function (location) {
      var longname = location.name + ' - ' + location.type
      var marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(location.latitude, location.longitude),
        animation: window.google.maps.Animation.DROP,
        map: map
      })

      marker.addListener('click', function () {
        self.openInfoWindow(marker)
      })

      location.longname = longname
      location.marker = marker
      location.display = true
      alllocations.push(location)
    })
    this.setState({
      'alllocations': alllocations
    })
  }

  openInfoWindow(marker) {
    this.closeInfoWindow()
    this.state.infowindow.open(this.state.map, marker)
    marker.setAnimation(window.google.maps.Animation.BOUNCE)
    this.setState({
        'prevmarker': marker
    })
    this.state.infowindow.setContent('Loading Data...')
    this.state.map.setCenter(marker.getPosition())
    this.state.map.panBy(0, -200)
    this.getMarkerInfo(marker)
  }

  getMarkerInfo(marker) {
    var self = this
    var clientId = "A241I4ML5J5CDHGKWSSTR1KPWSGAJCHHF3C3G41PD1YWAK1S"
    var clientSecret = "GJUUSBZJUHKK1RBTPXEM01JH2XS333IITSYZQUWSY5WXBV5X"
    var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&v=20181201"
    fetch(url)
      .then(
        function (response) {
          if (response.status !== 200) {
            self.state.infowindow.setContent("Sorry data can't be loaded")
            return
          }

          response.json().then(function (data) {
            var location_data = data.response.venues[0]
            var name = "<b>" + location_data.name + "</b><br />"
            var address = "<b>" + location_data.location.formattedAddress.join(" ") + "</b><br />"
            var postalCode = "<b>" + location_data.location.postalCode + "</b>"
            self.state.infowindow.setContent(name + address + postalCode)
          })
        }
      )
      .catch(function (err) {
        self.state.infowindow.setContent("Error - Issue loading data.")
      })
  }

  closeInfoWindow() {
    if (this.state.prevmarker) {
      this.state.prevmarker.setAnimation(null)
    }
    this.setState({
      'prevmarker': ''
    });
    this.state.infowindow.close();
  }

  render() {
    return (
      <div>
        <LocationList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
          closeInfoWindow={this.closeInfoWindow}/>
        <div id="map"></div>
      </div>
    )
  }
}

export default App

function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0]
    var script = window.document.createElement("script")
    script.src = src
    script.async = true
    script.onerror = function () {
        document.write("Error - Issue loading Google Maps!")
    }
    ref.parentNode.insertBefore(script, ref)
}
// src/components/map/LeafletMap.js
// FREE map using Leaflet.js + OpenStreetMap — NO API KEY NEEDED
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({
  latitude = 20.5937,
  longitude = 78.9629,
  zoom = 5,
  markers = [],
  height = 300,
  onMarkerPress,
  onMapPress,
}) => {
  const webViewRef = useRef(null);

  const markersJS = markers.map((m, i) => `
    L.marker([${m.lat}, ${m.lng}], { icon: customIcon })
      .addTo(map)
      .bindPopup('<b>${m.title || ''}</b>${m.description ? '<br/>' + m.description : ''}')
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type:'markerPress', index:${i}, lat:${m.lat}, lng:${m.lng}, title:'${m.title || ''}'
        }));
      });
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>* {margin:0;padding:0;box-sizing:border-box} html,body,#map{height:100%;width:100%}
    .leaflet-popup-content-wrapper{border-radius:12px;font-family:Arial,sans-serif}
    .leaflet-popup-content b{color:#1E3A5F}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{center:[${latitude},${longitude}],zoom:${zoom},zoomControl:true});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap contributors', maxZoom:19
  }).addTo(map);
  var customIcon = L.divIcon({
    className:'',
    html:'<div style="width:20px;height:20px;background:#F4A261;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #1E3A5F;"></div>',
    iconSize:[20,20], iconAnchor:[10,20], popupAnchor:[0,-20]
  });
  ${markersJS}
  map.on('click',function(e){
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'mapPress',lat:e.latlng.lat,lng:e.latlng.lng}));
  });
</script>
</body>
</html>`;

  const handleMessage = (e) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) onMarkerPress(data);
      if (data.type === 'mapPress' && onMapPress) onMapPress(data);
    } catch (_) {}
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        originWhitelist={['*']}
        startInLoadingState
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  map: { flex: 1 },
});

export default LeafletMap;

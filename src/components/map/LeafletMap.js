// src/components/map/LeafletMap.js
// Free Leaflet.js + OpenStreetMap map rendered through WebView.
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({
  latitude = 20.5937,
  longitude = 78.9629,
  zoom = 5,
  markers = [],
  routeCoordinates = [],
  showRoute = true,
  fitToMarkers = true,
  height = 300,
  onMarkerPress,
  onMapPress,
}) => {
  const webViewRef = useRef(null);

  const safeMarkers = markers
    .map((marker, index) => ({
      index,
      lat: Number(marker.lat),
      lng: Number(marker.lng),
      title: marker.title || '',
      description: marker.description || '',
      kind: marker.kind || 'stop',
    }))
    .filter((marker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lng));

  const safeRoute = routeCoordinates
    .map((point) => [Number(point.lat), Number(point.lng)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { height:100%; width:100%; }
    body { background:#0f172a; }
    .leaflet-container { background:#0f172a; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .leaflet-popup-content-wrapper { border-radius:14px; }
    .leaflet-popup-content { margin:10px 12px; line-height:1.35; }
    .leaflet-popup-content b { color:#0f172a; }
    .pin { width:24px; height:24px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:3px solid white; box-shadow:0 8px 20px rgba(15,23,42,.28); }
    .pin span { display:block; width:8px; height:8px; margin:5px; border-radius:50%; background:white; }
    .pin-start { background:#22c55e; }
    .pin-stop { background:#f97316; }
    .pin-live { background:#ef4444; animation:pulse 1.4s ease-in-out infinite; }
    .pin-end { background:#3b82f6; }
    @keyframes pulse { 0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,.45); } 50%{ box-shadow:0 0 0 12px rgba(239,68,68,0); } }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { center:[${Number(latitude)},${Number(longitude)}], zoom:${Number(zoom)}, zoomControl:true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'OpenStreetMap contributors',
    maxZoom:19
  }).addTo(map);

  var markers = ${JSON.stringify(safeMarkers)};
  var routeCoordinates = ${JSON.stringify(safeRoute)};
  var bounds = [];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function iconFor(kind) {
    var cls = kind === 'start' ? 'pin-start' : kind === 'end' ? 'pin-end' : kind === 'live' ? 'pin-live' : 'pin-stop';
    return L.divIcon({
      className:'',
      html:'<div class="pin ' + cls + '"><span></span></div>',
      iconSize:[24,24],
      iconAnchor:[12,24],
      popupAnchor:[0,-22]
    });
  }

  if (${showRoute ? 'true' : 'false'} && routeCoordinates.length > 1) {
    L.polyline(routeCoordinates, {
      color:'#f97316',
      weight:5,
      opacity:.9,
      lineCap:'round',
      lineJoin:'round'
    }).addTo(map);
    routeCoordinates.forEach(function(point) { bounds.push(point); });
  }

  markers.forEach(function(marker) {
    var point = [marker.lat, marker.lng];
    bounds.push(point);
    L.marker(point, { icon: iconFor(marker.kind) })
      .addTo(map)
      .bindPopup('<b>' + escapeHtml(marker.title) + '</b>' + (marker.description ? '<br/>' + escapeHtml(marker.description) : ''))
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type:'markerPress',
          index:marker.index,
          lat:marker.lat,
          lng:marker.lng,
          title:marker.title,
          kind:marker.kind
        }));
      });
  });

  if (${fitToMarkers ? 'true' : 'false'} && bounds.length > 1) {
    map.fitBounds(bounds, { padding:[32,32], maxZoom:14 });
  }

  map.on('click', function(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type:'mapPress',
      lat:e.latlng.lat,
      lng:e.latlng.lng
    }));
  });
</script>
</body>
</html>`;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
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
  container: { flex: 1, width: '100%', overflow: 'hidden' },
  map: { flex: 1 },
});

export default LeafletMap;

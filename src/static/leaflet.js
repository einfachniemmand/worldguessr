// first map
const map = L.map('map', {
    zoomControl: false
}).fitWorld();
document.querySelector(".map-container").classList.remove("unload");
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: window.innerWidth>580?'© OpenStreetMap':''
}).addTo(map);
const redMarker = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
let marker;
const mapContainer = document.querySelector('.map');
mapContainer.addEventListener('transitionend', () => {
    map.invalidateSize();
});
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng, { icon: redMarker }).addTo(map);
    }
    app.map.selected = [lat.toFixed(6),lng.toFixed(6)]
    document.querySelector(".finish").style.display = "";
    setTimeout(()=>{
        document.querySelector(".finish").classList.remove("hidden")
    },10)
});
function removeMarker() {
    if (marker) {
        map.removeLayer(marker);
        marker = null;
        document.querySelector(".finish").classList.add("hidden")
        setTimeout(()=>{
            document.querySelector(".finish").style.display = "none";
        },150)
        document.querySelector(".map-container").classList.add("unload");
        setTimeout(()=>{
            map.fitWorld()
            document.querySelector(".map-container").classList.remove("unload");
        },250)
    }
}

//second map
const solutionMap = L.map('solution', { zoomControl: false });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(solutionMap);
let markerA, markerB, connectingLine;
function setTwoPinsSolution(coord1, coord2) {
    if (markerA) solutionMap.removeLayer(markerA);
    if (markerB) solutionMap.removeLayer(markerB);
    if (connectingLine) solutionMap.removeLayer(connectingLine);
    const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    const violetIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
        shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    markerA = L.marker(coord1, { icon: greenIcon }).addTo(solutionMap);
    markerB = L.marker(coord2, { icon: violetIcon }).addTo(solutionMap)
        .bindPopup("Your Guess").openPopup();
    connectingLine = L.polyline([coord1, coord2], { color: 'red' }).addTo(solutionMap);
    solutionMap.fitBounds(connectingLine.getBounds(), { padding: [150, 100] });
    return L.latLng(coord1).distanceTo(L.latLng(coord2));
}

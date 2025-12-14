const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Location found:", latitude, longitude);
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Geolocation error:", error);
      let errorMessage = "";
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Permission denied. Please enable location in browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Position unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timeout.";
          break;
        default:
          errorMessage = "Error: " + error.message;
      }
      console.error(errorMessage);
      alert(errorMessage);
    },
    {
        enableHighAccuracy : false,
        timeout : 20000,
        maximumAge : 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser");
  alert("Geolocation is not supported by your browser");
}

const map = L.map("map").setView([0,0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution : "OpenStreetMap"
}).addTo(map)

const markers = {};

socket.on("receive-location", (data) =>{
    const {id, latitude, longitude} = data;
    console.log("Received location - ID:", id, "Lat:", latitude, "Lng:", longitude);
    map.setView([latitude, longitude]);
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]);
        markers[id].setPopupContent(`Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}`);
    }
    else{
        markers[id] = L.marker([latitude, longitude]).addTo(map);
        markers[id].bindPopup(`Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}`);
        markers[id].openPopup();
    }
});

socket.on("user-disconnected", (id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
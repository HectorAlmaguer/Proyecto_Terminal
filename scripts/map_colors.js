function get_location(callback) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log(position);
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      let coords = [lat, lon];
      callback(coords); // Llama al callback con las coordenadas
    },
    (e) => {
      swal({
        icon: "error",
        title: "Oops...",
        text: "Debes permitir el acceso a la ubicación para mostrar información.",
      });
    }
  );
}

let map = L.map("map").setView([19.4326018, -99.1332049], 19);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

get_location(function(coords) {
    map.flyTo(coords, 18); // Vuela al mapa usando las coordenadas recibidas
  
    // Convertir 1 kilómetro a grados de latitud y longitud (aproximadamente)
    const radiusKm = 1; // Radio deseado en kilómetros
    const radiusInDegrees = radiusKm / 111; // Asumimos 1 grado de latitud ≈ 111 km
  
    L.circle(L.latLng(coords), {
      radius: radiusInDegrees * 25000, // Convertir a metros (1000 metros = 1 kilómetro)
      fillColor: "#ff0000",
      color: "red",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.6,
    }).addTo(map);
  
    L.marker(coords).addTo(map).bindPopup("Estás aquí").openPopup();
  });

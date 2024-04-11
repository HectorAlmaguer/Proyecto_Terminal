const btn_location = document.querySelector("#location-button");
const location_data = document.querySelector("#neighbourhood");

const get_address = async (latitude, longitude) => {
  const response = await fetch(
    "https://nominatim.openstreetmap.org/reverse?lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&format=json"
  );
  const data = await response.json();
  const element = document.querySelector("#element");
  element.textContent = data.address.neighbourhood;
};

function get_location() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      get_address(position.coords.latitude, position.coords.longitude);
      let map = L.map("map").setView(
        [position.coords.latitude, position.coords.longitude],
        16
      );
      let marker = L.marker([
        position.coords.latitude,
        position.coords.longitude,
      ]).addTo(map);
      let popup = L.popup()
        .setLatLng([position.coords.latitude, position.coords.longitude])
        .setContent("Estas aqui")
        .openOn(map);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
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

btn_location.addEventListener("click", (event) => {
  get_location();
});

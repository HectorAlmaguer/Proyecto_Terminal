const btn_location = document.querySelector("#location-button");
const location_data = document.querySelector("#mapa");


const get_address = async (latitude,longitude) => {
  const response = await fetch("https://nominatim.openstreetmap.org/reverse?lat="+latitude+"&lon="+longitude+"&format=json");
  const data = await response.json();
  const element = document.createElement("h2");
      element.textContent = data.address.neighbourhood
      location_data.appendChild(element);
}

function get_location() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position);
      get_address(position.coords.latitude,position.coords.longitude);
    });
  }
}

btn_location.addEventListener("click", (event) => {
  get_location();
});

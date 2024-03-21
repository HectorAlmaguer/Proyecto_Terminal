const btn_location = document.querySelector("#location-button");

function get_location() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position);
    });
  }
}

btn_location.addEventListener("click", (event) => {
  get_location();
});

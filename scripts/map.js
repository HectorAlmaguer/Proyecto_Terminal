const url_DB =
  "https://proyecto-terminal-ipn-default-rtdb.firebaseio.com/Crimes.json";

const btn_location = document.querySelector("#location-button");
const location_data = document.querySelector("#neighbourhood");
const table_crimes = document.querySelector("#table_crimes");

function filter_data(lat,lon){
  const filterList = [];
  const lat_target = lat;
  const lon_target = lon;
  for (let index = 0; index < crimesList.length; index++) {
    const difference_lat = Math.abs(crimesList[index].latitud_delito - lat_target);
    const difference_lon = Math.abs(crimesList[index].longitud_delito - lon_target);
      if (difference_lat <= 0.003 && difference_lon <= 0.003) {
        filterList.push(crimesList[index]);
      }
  }
  renderList(filterList);
}

function getMapID(lat, lon, mapid) {
  let map = L.map(mapid).setView([lat, lon], 16);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([lat, lon]).addTo(map);
}

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
  filter_data(latitude,longitude);
  element.textContent = data.address.neighbourhood;
  element.className = "text-center";
};

function get_location() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      get_address(position.coords.latitude, position.coords.longitude);
      let map = L.map("map").setView(
        [position.coords.latitude, position.coords.longitude],
        16
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([position.coords.latitude, position.coords.longitude])
        .addTo(map)
        .bindPopup("Estas aqui")
        .openPopup();
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

const renderCrimes = (crime, index) => {
  const card_container = document.createElement("div");
  const map_crime = document.createElement("div");
  const img = document.createElement("img");
  const card_body = document.createElement("div");
  const card_title = document.createElement("h5");
  const list_group = document.createElement("ul");
  const list_group_item1 = document.createElement("li");
  const list_group_item2 = document.createElement("li");
  const list_group_item3 = document.createElement("li");

  card_container.className = "card m-3";
  card_container.style = "width: 18rem";
  img.className = "card-img-top";
  let mapid = `map_crime${index}`;
  map_crime.setAttribute("id", mapid);
  card_body.className = "card-body";
  card_title.className = "card-title text-center";
  list_group.className = "list-group list-group-flush";
  list_group_item1.className = "list-group-item";
  list_group_item2.className = "list-group-item";
  list_group_item3.className = "list-group-item";

  card_title.textContent = crime.delito;
  list_group_item3.textContent = `${crime.fecha_hecho} ${crime.hora_hecho}`;
  list_group_item2.textContent = `${crime.latitud_delito}, ${crime.longitud_delito}`;
  list_group_item1.textContent = `${crime.colonia_catalogo}, ${crime.alcaldia_catalogo}`;

  table_crimes.appendChild(card_container);
  card_container.appendChild(map_crime);
  getMapID(crime.latitud_delito, crime.longitud_delito, mapid);
  card_container.appendChild(card_body);
  card_body.appendChild(card_title);
  card_container.appendChild(list_group);
  list_group.appendChild(list_group_item1);
  list_group.appendChild(list_group_item2);
  list_group.appendChild(list_group_item3);
};

const cleanList = () => {
  while (table_crimes.firstChild) {
    table_crimes.removeChild(table_crimes.firstChild);
  }
};

const parserResponseFireBase = (response) => {
  const parsedResponse = [];
  for (const key in response) {
    const element = {
      id: key,
      alcaldia_catalogo: response[key].alcaldia_catalogo,
      categoria_delito: response[key].categoria_delito,
      colonia_catalogo: response[key].colonia_catalogo,
      delito: response[key].delito,
      fecha_hecho: response[key].fecha_hecho,
      hora_hecho: response[key].hora_hecho,
      latitud_delito: response[key].latitud,
      longitud_delito: response[key].longitud,
      municipio_hecho: response[key].municipio_hecho,
    };
    parsedResponse.push(element);
  }
  return parsedResponse;
};

const renderList = (listToRender) => {
  console.log(listToRender);
  listToRender.forEach((crime, index) => {
    renderCrimes(crime, index);
  });
};

const getInfoApi = async () => {
  try {
    const response = await fetch(url_DB, {
      method: "GET",
    });
    const parsed = await response.json();
    const array_crimes = parserResponseFireBase(parsed);
    crimesList = array_crimes;
    console.log(crimesList);
    cleanList();
  } catch (error) {
    swal({
      icon: "error",
      title: "Oops...",
      text: "Error inesperado",
    });
  }
};

let crimesList = [];

btn_location.addEventListener("click", (event) => {
  clickeo();
});

async function clickeo() {
  let get_data = await getInfoApi();
  get_data;
  get_location();
}

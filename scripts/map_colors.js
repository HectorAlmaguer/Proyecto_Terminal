const url_DB =
  "https://proyecto-terminal-ipn-default-rtdb.firebaseio.com/Crimes.json";

function get_user_location() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userCoords = [latitude, longitude];
        resolve(userCoords);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
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

// Función para filtrar la lista de crímenes por ubicación
function filter_crimes_by_location(crimesList, userCoords) {
  const filteredCrimes = crimesList.filter((crime) => {
    const { latitud_delito, longitud_delito } = crime;
    const latDifference = Math.abs(latitud_delito - userCoords[0]);
    const lonDifference = Math.abs(longitud_delito - userCoords[1]);
    return latDifference <= 0.0025 && lonDifference <= 0.0025;
  });
  return filteredCrimes;
}

// Función para cargar la lista de crímenes desde la API
async function load_crimes_list() {
  try {
    const response = await fetch(url_DB, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Error al cargar la lista de crímenes: ${response.statusText}`
      );
    }

    const parsed = await response.json();
    console.log("Datos recibidos de la API:", parsed);

    const crimesList = parserResponseFireBase(parsed);
    return crimesList;
  } catch (error) {
    throw new Error(
      `Error al procesar la respuesta de la API: ${error.message}`
    );
  }
}

// Función principal para inicializar el mapa y cargar la información
async function initialize_map() {
  const map = L.map("map").setView([19.4326018, -99.1332049], 18);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  try {
    // Obtener la ubicación del usuario
    const userCoords = await get_user_location();

    // Volar al mapa centrado en la ubicación del usuario
    map.flyTo(userCoords, 18);

    // Calcular el radio en grados de latitud para aproximadamente 1 kilómetro
    const radiusInDegrees = 1 / 111;

    // Determinar el color del círculo según la cantidad de crímenes filtrados
    const filteredCrimes = filter_crimes_by_location(
      await load_crimes_list(),
      userCoords
    );
    const numCrimes = filteredCrimes.length;
    let circleColor = "#ff0000"; // Rojo por defecto

    if (numCrimes < 30) {
      circleColor = "#00ff00"; // Verde si hay menos de 30 crímenes
    } else if (numCrimes >= 30 && numCrimes <= 60) {
      circleColor = "#ffff00"; // Amarillo si hay entre 30 y 60 crímenes
    }

    // Agregar círculo al mapa con el radio correspondiente y el color determinado
    L.circle(userCoords, {
      radius: radiusInDegrees * 40000,
      fillColor: circleColor,
      color: circleColor,
      weight: 3,
      opacity: 1,
      fillOpacity: 0.6,
    }).addTo(map);

    // Agregar marcador para la ubicación del usuario
    L.marker(userCoords).addTo(map).bindPopup("Estás aquí").openPopup();

    // Agregar marcadores para cada crimen filtrado
    filteredCrimes.forEach((crime) => {
      const { latitud_delito, longitud_delito} = crime;
      const crimeMarker = L.marker([latitud_delito, longitud_delito])
        .addTo(map)
        .bindPopup(crime.delito); // Mostrar descripción del crimen en el popup
    });
  } catch (error) {
    swal({
      icon: "error",
      title: "Oops...",
      text: error.message || "Error inesperado",
    });
  }
}

// Llamar a la función principal para inicializar el mapa y cargar la información
initialize_map();

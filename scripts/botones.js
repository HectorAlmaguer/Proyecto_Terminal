const url_DB = "https://proyecto-ipn-default-rtdb.firebaseio.com/botones.json";

const CDMX_BOUNDS = {
  north: 19.592757,
  south: 19.189715,
  west: -99.334529,
  east: -98.960387,
};

// Función para verificar si las coordenadas están dentro de la Ciudad de México
function isWithinCDMX(lat, lon) {
  return (
    lat >= CDMX_BOUNDS.south &&
    lat <= CDMX_BOUNDS.north &&
    lon >= CDMX_BOUNDS.west &&
    lon <= CDMX_BOUNDS.east
  );
}

async function get_user_location() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error("La geolocalización no está disponible en este navegador.")
      );
    }
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
      Alcaldia: response[key].Alcaldía,
      Colonia: response[key].Colonia,
      latitud_boton: response[key].Latitud,
      longitud_boton: response[key].Longitud,
    };
    parsedResponse.push(element);
  }
  return parsedResponse;
};

function filter_buttons_by_location(buttonsList, userCoords) {
  const filteredButtons = buttonsList.filter((button) => {
    const { latitud_boton, longitud_boton } = button;
    const latDifference = Math.abs(latitud_boton - userCoords[0]);
    const lonDifference = Math.abs(longitud_boton - userCoords[1]);
    return latDifference <= 0.0025 && lonDifference <= 0.0025;
  });
  return filteredButtons;
}

async function load_buttons_list() {
  try {
    const response = await fetch(url_DB, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Error al cargar la lista de botones de pánico: ${response.statusText}`
      );
    }

    const parsed = await response.json();
    console.log("Datos recibidos de la API:", parsed);

    const buttonsList = parserResponseFireBase(parsed);
    return buttonsList;
  } catch (error) {
    throw new Error(
      `Error al procesar la respuesta de la API: ${error.message}`
    );
  }
}

async function initialize_map() {
  const map = L.map("map").setView([19.4326018, -99.1332049], 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  try {
    // Obtener la ubicación del usuario
    const userCoords = await get_user_location();

    // Verificar si la ubicación del usuario está dentro de los límites de la Ciudad de México
    if (!isWithinCDMX(userCoords[0], userCoords[1])) {
      swal({
        icon: "error",
        title: "Ubicación fuera de la Ciudad de México",
        text: "La aplicación solo muestra información de la Ciudad de México.",
      });
      return;
    }

    // Volar al mapa centrado en la ubicación del usuario
    map.flyTo(userCoords, 17);

    // Calcular el radio en grados de latitud para aproximadamente 1 kilómetro
    const radiusInDegrees = 1 / 111;

    // Determinar el color del círculo según la cantidad de crímenes filtrados
    const filteredButtons = filter_buttons_by_location(
      await load_buttons_list(),
      userCoords
    );

    // Agregar marcador para la ubicación del usuario
    L.marker(userCoords).addTo(map).bindPopup("Estás aquí").openPopup();

    // Agregar marcadores para cada boton filtrado
    filteredButtons.forEach((button) => {
      const { latitud_boton, longitud_boton } = button;
      L.marker([latitud_boton, longitud_boton], {
        icon: L.icon({
          iconUrl:
            "../media/red_icon.webp",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .addTo(map)
        .bindPopup("Boton de Pánico CDMX C5"); // Mostrar descripción del crimen en el popup
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

const url_DB_buttons =
  "https://proyecto-ipn-default-rtdb.firebaseio.com/botones.json";
const url_DB_crimes =
  "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";

// Función para verificar si las coordenadas están dentro de los límites de la Ciudad de México
function isWithinCDMX(latitude, longitude) {
  const CDMX_BOUNDS = {
    north: 19.5928,
    south: 19.203,
    west: -99.3646,
    east: -98.9408,
  };

  return (
    latitude >= CDMX_BOUNDS.south &&
    latitude <= CDMX_BOUNDS.north &&
    longitude >= CDMX_BOUNDS.west &&
    longitude <= CDMX_BOUNDS.east
  );
}

// Función asincrónica para obtener la ubicación del usuario
async function get_user_location() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve([latitude, longitude]);
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

// Función para parsear la respuesta de Firebase para los botones de pánico
const parserResponseFireBaseButtons = (response) => {
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

// Función para parsear la respuesta de Firebase para los crímenes
const parserResponseFireBaseCrimes = (response) => {
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

// Función asincrónica para cargar la lista de botones de pánico desde la API
async function load_buttons_list() {
  try {
    const response = await fetch(url_DB_buttons, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Error al cargar la lista de botones de pánico: ${response.statusText}`
      );
    }

    const parsed = await response.json();
    console.log("Datos recibidos de la API de botones:", parsed);

    const buttonsList = parserResponseFireBaseButtons(parsed);
    return buttonsList;
  } catch (error) {
    console.error(
      "Error al procesar la respuesta de la API de botones:",
      error
    );
    throw new Error(
      `Error al procesar la respuesta de la API de botones: ${error.message}`
    );
  }
}

// Función asincrónica para cargar la lista de crímenes desde la API
async function load_crimes_list() {
  try {
    const response = await fetch(url_DB_crimes, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Error al cargar la lista de crímenes: ${response.statusText}`
      );
    }

    const parsed = await response.json();
    console.log("Datos recibidos de la API de crímenes:", parsed);

    const crimesList = parserResponseFireBaseCrimes(parsed);
    return crimesList;
  } catch (error) {
    console.error(
      "Error al procesar la respuesta de la API de crímenes:",
      error
    );
    throw new Error(
      `Error al procesar la respuesta de la API de crímenes: ${error.message}`
    );
  }
}

// Función para filtrar los botones de pánico por ubicación dentro de una distancia dada
function filter_buttons_by_location(buttonsList, userCoords, distance) {
  return buttonsList.filter((button) => {
    const { latitud_boton, longitud_boton } = button;
    const latDifference = Math.abs(latitud_boton - userCoords[0]);
    const lonDifference = Math.abs(longitud_boton - userCoords[1]);
    return latDifference <= distance && lonDifference <= distance;
  });
}

// Función para filtrar los crímenes por ubicación dentro de una distancia dada
function filter_crimes_by_location(crimesList, userCoords, distance) {
  return crimesList.filter((crime) => {
    const { latitud_delito, longitud_delito } = crime;
    const latDifference = Math.abs(latitud_delito - userCoords[0]);
    const lonDifference = Math.abs(longitud_delito - userCoords[1]);
    return latDifference <= distance && lonDifference <= distance;
  });
}
let circle;
// Función para inicializar el mapa y cargar la información inicial
async function initialize_map() {
  const map = L.map("map").setView([19.4326018, -99.1332049], 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let userCoords;

  try {
    userCoords = await get_user_location();

    if (!isWithinCDMX(userCoords[0], userCoords[1])) {
      Swal.fire({
        icon: "error",
        title: "Ubicación fuera de la Ciudad de México",
        text: "La aplicación solo muestra información de la Ciudad de México.",
      });
      return;
    }

    map.flyTo(userCoords, 17);

    const distanceSelect = document.getElementById("distance-select");
    let distance = parseFloat(distanceSelect.value);

    // Cargar los datos originales solo una vez al inicio
    const originalButtonsList = await load_buttons_list();
    const originalCrimesList = await load_crimes_list();

    distanceSelect.addEventListener("change", () => {
      distance = parseFloat(distanceSelect.value);
      updateMapElements(map, userCoords, distance, originalButtonsList, originalCrimesList);
    });

    // Llamar a updateMapElements con los datos originales
    await updateMapElements(map, userCoords, distance, originalButtonsList, originalCrimesList);

  } catch (error) {
    console.error("Error obteniendo la ubicación del usuario:", error);
    Swal.fire({
      icon: "error",
      title: "Error de Geolocalización",
      text: "No se pudo obtener la ubicación del usuario.",
    });
  }
}

// Función para actualizar los elementos del mapa
async function updateMapElements(map, userCoords, distance, originalButtonsList, originalCrimesList) {
  let filteredButtons = filter_buttons_by_location(originalButtonsList, userCoords, distance);
  let filteredCrimes = filter_crimes_by_location(originalCrimesList, userCoords, distance);

  let buttonMarkers = [];
  let crimeMarkers = [];

  // Limpiar marcadores existentes
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  buttonMarkers = filteredButtons.map((button) => {
    const { latitud_boton, longitud_boton } = button;
    return L.marker([latitud_boton, longitud_boton], {
      icon: L.icon({
        iconUrl: "../media/red_icon.webp",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .addTo(map)
      .bindPopup("Botón de Pánico CDMX C5");
  });

  crimeMarkers = filteredCrimes.map((crime) => {
    const { latitud_delito, longitud_delito } = crime;
    return L.marker([latitud_delito, longitud_delito])
      .addTo(map)
      .bindPopup(crime.delito);
  });

  let circleColor = "#ff0000"; // Color por defecto

  // Factor de multiplicación basado en la distancia
  let factor = 1;
  if (distance <= 0.25) {
    factor = 1; // Multiplicar por 1 si la distancia es <= 250 metros
  } else if (distance <= 0.5) {
    factor = 2; // Multiplicar por 2 si la distancia es <= 500 metros
  } else if (distance <= 1) {
    factor = 4; // Multiplicar por 4 si la distancia es <= 1 kilómetro
  }

  const numCrimes = filteredCrimes.length * factor;

  // Definir los valores estáticos dinámicamente
  let safeThreshold = 25 * factor;
  let mediumThreshold = 55 * factor;

  if (numCrimes < safeThreshold) {
    circleColor = "#00ff00";
    safe_alert(); // Verde para zonas seguras
  } else if (numCrimes >= safeThreshold && numCrimes <= mediumThreshold) {
    circleColor = "#ffff00";
    warning_alert(); // Amarillo para zonas de riesgo medio
  } else {
    circleColor = "#ff0000";
    danger_alert(); // Rojo para zonas de alto riesgo
  }

  // Eliminar círculo anterior si existe
  if (circle) {
    map.removeLayer(circle);
  }

  const radiusInMeters = distance * 161111; // Convertir distancia en kilómetros a metros

  circle = L.circle(userCoords, {
    radius: radiusInMeters,
    fillColor: circleColor,
    color: circleColor,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.6,
  }).addTo(map);

  map.setView(userCoords, map.getZoom());
}

// Funciones de alerta
function safe_alert() {
  Swal.fire({
    icon: "success",
    title: "Zona Segura",
    text: "Estás en una zona segura.",
  });
}

function warning_alert() {
  Swal.fire({
    icon: "warning",
    title: "Zona de Riesgo Medio",
    text: "Estás en una zona de riesgo medio.",
  });
}

function danger_alert() {
  Swal.fire({
    icon: "error",
    title: "Zona de Alto Riesgo",
    text: "Estás en una zona de alto riesgo.",
  });
}

// Llamar a la función principal para inicializar el mapa y cargar la información
initialize_map();

// Evento para actualizar la base de datos al hacer clic en el botón correspondiente
const updateButton = document.getElementById("update-database-button");
updateButton.addEventListener("click", async () => {
  try {
    const swalLoading = Swal.fire({
      title: "Actualizando base de datos...",
      text: "Por favor, espera un momento.",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Llamar a la función para actualizar la base de datos
    await updateDatabase();

    swalLoading.close();

    Swal.fire({
      icon: "success",
      title: "Base de datos actualizada",
      text: "La base de datos se ha actualizado correctamente.",
    });

    // Recargar el mapa con los nuevos datos actualizados
    await initialize_map();

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al actualizar",
      text: "Hubo un problema al actualizar la base de datos.",
    });
  }
});

// Función para actualizar la base de datos (ejemplo, reemplazar con tu lógica)
async function updateDatabase() {
  // Aquí va tu lógica para actualizar la base de datos
  console.log("Actualizando base de datos...");
}


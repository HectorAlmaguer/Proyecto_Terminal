const url_DB_buttons =
  "https://proyecto-ipn-default-rtdb.firebaseio.com/botones.json";
const url_DB_crimes =
  "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";

let currentDangerLevel = null; // Variable para rastrear el nivel de peligro actual
let isOutsideCDMXAlertShown = false; // Variable para rastrear si la alerta fuera de CDMX ya se ha mostrado

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

let map, circle, userCoords, originalButtonsList, originalCrimesList;

// Función para inicializar el mapa y cargar la información inicial
async function initialize_map() {
  map = L.map("map").setView([19.4326018, -99.1332049], 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const distanceSelect = document.getElementById("distance-select");
  let distance = parseFloat(distanceSelect.value);

  // Cargar los datos originales solo una vez al inicio
  originalButtonsList = await load_buttons_list();
  originalCrimesList = await load_crimes_list();

  // Observar la ubicación del usuario continuamente
  navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      userCoords = [latitude, longitude];

      if (!isWithinCDMX(latitude, longitude)) {
        if (!isOutsideCDMXAlertShown) {
          Swal.fire({
            icon: "error",
            title: "Ubicación fuera de la Ciudad de México",
            html: `
                <p>La aplicación solo muestra información de la Ciudad de México.</p>
                <p><strong>Recomendaciones:</strong></p>
                <ul>
                  <li>Vuelve a ingresar a la Ciudad de México para ver los datos.</li>
                  <li>Revisa la configuración de tu GPS.</li>
                </ul>
              `,
          });
          isOutsideCDMXAlertShown = true;
        }
        return;
      }

      isOutsideCDMXAlertShown = false;
      map.flyTo(userCoords, 17);

      // Actualizar el mapa con la nueva ubicación del usuario
      await updateMapElements(
        map,
        userCoords,
        distance,
        originalButtonsList,
        originalCrimesList
      );
    },
    (error) => {
      console.error("Error obteniendo la ubicación del usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error de Geolocalización",
        html: `
            <p>No se pudo obtener la ubicación del usuario.</p>
            <p><strong>Recomendaciones:</strong></p>
            <ul>
              <li>Revisa los permisos de ubicación de tu navegador.</li>
              <li>Asegúrate de que el GPS esté activado.</li>
            </ul>
          `,
      });
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );

  distanceSelect.addEventListener("change", async () => {
    distance = parseFloat(distanceSelect.value);
    await updateMapElements(
      map,
      userCoords,
      distance,
      originalButtonsList,
      originalCrimesList
    );
  });
}

// Función para actualizar los elementos del mapa
async function updateMapElements(
  map,
  userCoords,
  distance,
  originalButtonsList,
  originalCrimesList
) {
  let filteredButtons = filter_buttons_by_location(
    originalButtonsList,
    userCoords,
    distance
  );
  let filteredCrimes = filter_crimes_by_location(
    originalCrimesList,
    userCoords,
    distance
  );

  let buttonMarkers = [];
  let crimeMarkers = [];

  // Limpiar marcadores existentes
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Añadir marcador para la ubicación del usuario
  L.marker(userCoords, {
    icon: L.icon({
      iconUrl: "../media/gps_icon.webp",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
  })
    .addTo(map)
    .bindPopup("Tu ubicación");

  buttonMarkers = filteredButtons.map((button) => {
    const { latitud_boton, longitud_boton, Alcaldia, Colonia } = button;
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
      .bindPopup(
        `<strong>Botón de Pánico</strong><br>Alcaldía: ${Alcaldia}<br>Colonia: ${Colonia}`
      );
  });

  crimeMarkers = filteredCrimes.map((crime) => {
    const {
      latitud_delito,
      longitud_delito,
      categoria_delito,
      delito,
      fecha_hecho,
      hora_hecho,
      colonia_catalogo,
    } = crime;
    return L.marker([latitud_delito, longitud_delito], {
      icon: L.icon({
        iconUrl: "../media/blue_icon.webp",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .addTo(map)
      .bindPopup(
        `<strong>${categoria_delito}</strong><br>Delito: ${delito}<br>Fecha: ${fecha_hecho}<br>Hora: ${hora_hecho}<br>Colonia: ${colonia_catalogo}`
      );
  });

  // Calcular el nivel de peligro según el número de crímenes cercanos y la distancia
  let crimeCount = filteredCrimes.length;
  let circleColor = "#00ff00"; // Valor por defecto
  let dangerFactor = 1; // Factor multiplicador por defecto

  if (distance === 0.1) {
    dangerFactor = 0.5;
  } else if (distance === 0.25) {
    dangerFactor = 1;
  } else if (distance === 0.5) {
    dangerFactor = 2;
  } else if (distance === 1.0) {
    dangerFactor = 4;
  }

  crimeCount *= dangerFactor;

  let alertHTML = `
      <p><strong>Recomendaciones:</strong></p>
      <ul>
        <li>Evita caminar solo por la noche.</li>
        <li>Mantén tus pertenencias seguras y no visibles.</li>
        <li>Utiliza rutas seguras y bien iluminadas.</li>
      </ul>
    `;

  if (crimeCount > 55) {
    circleColor = "#ff0000";
    if (currentDangerLevel !== "high") {
      Swal.fire({
        icon: "warning",
        title: "Nivel de peligro alto",
        html: `
            <p>Ten cuidado, el nivel de peligro en esta área es alto. Si notas conductas fuera de lugar, tal como personas que te están siguiendo o que intentan acercarse a ti inesperadamente, trata de incorporarte a un lugar concurrido o cambiar tu trayectoria</p>
            ${alertHTML}
          `,
        iconColor: "#ff0000",
      });
      currentDangerLevel = "high";
    }
  } else if (crimeCount > 25) {
    circleColor = "#ffa500";
    if (currentDangerLevel !== "medium") {
      Swal.fire({
        icon: "warning",
        title: "Nivel de peligro medio",
        html: `
            <p>Mantente alerta, el nivel de peligro en esta área es medio. Si notas conductas fuera de lugar, tal como personas que te están siguiendo o que intentan acercarse a ti inesperadamente, trata de incorporarte a un lugar concurrido o cambiar tu trayectoria</p>
            ${alertHTML}
          `,
        iconColor: "#ffa500",
      });
      currentDangerLevel = "medium";
    }
  } else {
    circleColor = "#00ff00";
    if (currentDangerLevel !== "low") {
      Swal.fire({
        icon: "success",
        title: "Nivel de peligro bajo",
        html: `
            <p>Esta área es relativamente segura.</p>
            ${alertHTML}
          `,
        iconColor: "#00ff00",
      });
      currentDangerLevel = "low";
    }
  }

  if (circle) {
    map.removeLayer(circle);
  }

  circle = L.circle(userCoords, {
    color: circleColor,
    fillColor: circleColor,
    fillOpacity: 0.2,
    radius: distance * 161111,
  }).addTo(map);
}

initialize_map();

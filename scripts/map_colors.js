const url_DB_buttons = "https://proyecto-ipn-default-rtdb.firebaseio.com/botones.json";
const url_DB_crimes = "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";

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

function filter_buttons_by_location(buttonsList, userCoords) {
  const filteredButtons = buttonsList.filter((button) => {
    const { latitud_boton, longitud_boton } = button;
    const latDifference = Math.abs(latitud_boton - userCoords[0]);
    const lonDifference = Math.abs(longitud_boton - userCoords[1]);
    return latDifference <= 0.0025 && lonDifference <= 0.0025;
  });
  return filteredButtons;
}

function filter_crimes_by_location(crimesList, userCoords) {
  const filteredCrimes = crimesList.filter((crime) => {
    const { latitud_delito, longitud_delito } = crime;
    const latDifference = Math.abs(latitud_delito - userCoords[0]);
    const lonDifference = Math.abs(longitud_delito - userCoords[1]);
    return latDifference <= 0.0025 && lonDifference <= 0.0025;
  });
  return filteredCrimes;
}

async function load_buttons_list() {
  try {
    const response = await fetch(url_DB_buttons, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Error al cargar la lista de botones de pánico: ${response.statusText}`
      );
    }

    const parsed = await response.json();
    console.log("Datos recibidos de la API:", parsed);

    const buttonsList = parserResponseFireBaseButtons(parsed);
    return buttonsList;
  } catch (error) {
    throw new Error(
      `Error al procesar la respuesta de la API: ${error.message}`
    );
  }
}

async function load_crimes_list() {
  try {
    const response = await fetch(url_DB_crimes, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Error al cargar la lista de crímenes: ${response.statusText}`
      );
    }

    const parsed = await response.json();
    console.log("Datos recibidos de la API:", parsed);

    const crimesList = parserResponseFireBaseCrimes(parsed);
    return crimesList;
  } catch (error) {
    throw new Error(
      `Error al procesar la respuesta de la API: ${error.message}`
    );
  }
}

function danger_alert() {
  swal({
    icon: "error",
    title: "Cuidado, estás en una zona con un índice alto de robos",
    content: {
      element: "div",
      attributes: {
        innerHTML: `
          <p>Si notas conductas fuera de lugar, tal como personas que te están siguiendo o que intentan acercarse a ti inesperadamente, trata de incorporarte a un lugar concurrido o cambiar tu trayectoria</p>
          <ul>
            <li>Evita uso de tu teléfono o audífonos</li>
            <li>Evita tener a la vista objetos de valor</li>
            <li>Evita sitios oscuros y solitarios</li>
          </ul>
        `
      }
    },
  });
}

function safe_alert() {
  swal({
    icon: "success",
    title: "Estás en una zona con un índice bajo de robos",
    content: {
      element: "div",
      attributes: {
        innerHTML: `
          <ul>
            <li>Evita uso de tu teléfono o audífonos</li>
            <li>Evita tener a la vista objetos de valor</li>
            <li>Evita sitios oscuros y solitarios</li>
          </ul>
        `
      }
    },
  });
}

function warning_alert() {
  swal({
    icon: "warning",
    title: "Estás en una zona con un índice medio de robos",
    content: {
      element: "div",
      attributes: {
        innerHTML: `
          <p>Si notas conductas fuera de lugar, tal como personas que te están siguiendo o que intentan acercarse a ti inesperadamente, trata de incorporarte a un lugar concurrido o cambiar tu trayectoria</p>
          <ul>
            <li>Evita uso de tu teléfono o audífonos</li>
            <li>Evita tener a la vista objetos de valor</li>
            <li>Evita sitios oscuros y solitarios</li>
          </ul>
        `
      }
    },
  });
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

    const radiusInDegrees = 1 / 111;

    // Cargar la lista de botones de pánico y crímenes
    const buttonsList = await load_buttons_list();
    const crimesList = await load_crimes_list();

    // Filtrar los botones de pánico y crímenes por la ubicación del usuario
    const filteredButtons = filter_buttons_by_location(buttonsList, userCoords);
    const filteredCrimes = filter_crimes_by_location(crimesList, userCoords);

    // Determinar el color del círculo según la cantidad de crímenes filtrados
    const numCrimes = filteredCrimes.length;
    let circleColor = "#ff0000"; // Rojo por defecto

    if (numCrimes < 25) {
      circleColor = "#00ff00"; // Verde si hay menos de 25 crímenes
      safe_alert();
    } else if (numCrimes >= 25 && numCrimes <= 55) {
      circleColor = "#ffff00"; // Amarillo si hay entre 25 y 55 crímenes
      warning_alert();
    } else {
      danger_alert();
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

    // Agregar marcadores para cada botón filtrado
    filteredButtons.forEach((button) => {
      const { latitud_boton, longitud_boton } = button;
      L.marker([latitud_boton, longitud_boton], {
        icon: L.icon({
          iconUrl: "../media/red_icon.webp",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .addTo(map)
        .bindPopup("Botón de Pánico CDMX C5");
    });

    // Agregar marcadores para cada crimen filtrado
    filteredCrimes.forEach((crime) => {
      const { latitud_delito, longitud_delito } = crime;
      L.marker([latitud_delito, longitud_delito])
        .addTo(map)
        .bindPopup(crime.delito);
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

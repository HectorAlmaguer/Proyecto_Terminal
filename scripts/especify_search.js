const url_DB_crimes = "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";
const url_DB_buttons = "https://proyecto-ipn-default-rtdb.firebaseio.com/botones.json";

let map; // Variable global para almacenar el objeto de mapa

function filter_coordinates_CDMX(coordinate) {
  // Coordenadas aproximadas de los límites de la Ciudad de México
  const minLat = 19.0;
  const maxLat = 19.7;
  const minLon = -99.4;
  const maxLon = -98.9;

  // Verificar si las coordenadas están dentro de los límites de la Ciudad de México
  return (
    coordinate.lat >= minLat &&
    coordinate.lat <= maxLat &&
    coordinate.lon >= minLon &&
    coordinate.lon <= maxLon
  );
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

function danger_alert() {
  swal({
    icon: "error",
    title: "Cuidado, es una zona con un índice alto de robos",
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
    title: "Es una zona con un índice bajo de robos",
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
    title: "Es una zona con un índice medio de robos",
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

// Función para obtener coordenadas de una dirección usando Nominatim
async function obtenerCoordenadas(direccion) {
  const baseURL = "https://nominatim.openstreetmap.org/search";
  const params = new URLSearchParams({
    q: direccion,
    format: "json",
    limit: 1,
  });
  const url = `${baseURL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("No se pudo obtener la información");
    }
    const data = await response.json();
    if (data.length === 0) {
      throw new Error(
        "No se encontraron resultados para la dirección especificada"
      );
    }
    const { lat, lon } = data[0];
    return { lat, lon };
  } catch (error) {
    throw new Error("Error al obtener las coordenadas: " + error.message);
  }
}

// Función para cargar la lista de crímenes desde la API
async function load_crimes_list() {
  try {
    const response = await fetch(url_DB_crimes, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Error al cargar la lista de crímenes: ${response.statusText}`
      );
    }

    const parsed = await response.json();
    return parserResponseFireBase(parsed);
  } catch (error) {
    throw new Error(
      `Error al procesar la respuesta de la API: ${error.message}`
    );
  }
}

function filter_crimes_by_location(crimesList, Coords) {
  return crimesList.filter((crime) => {
    const { latitud_delito, longitud_delito } = crime;
    const latDifference = Math.abs(latitud_delito - Coords.lat);
    const lonDifference = Math.abs(longitud_delito - Coords.lon);
    return latDifference <= 0.0025 && lonDifference <= 0.0025;
  });
}

// Función para verificar si las coordenadas están dentro de la Ciudad de México
const CDMX_BOUNDS = {
  north: 19.592757,
  south: 19.189715,
  west: -99.334529,
  east: -98.960387,
};

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
        const userCoords = { lat: latitude, lon: longitude };
        resolve(userCoords);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

const parserButtonsResponseFireBase = (response) => {
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
  return buttonsList.filter((button) => {
    const { latitud_boton, longitud_boton } = button;
    const latDifference = Math.abs(latitud_boton - userCoords.lat);
    const lonDifference = Math.abs(longitud_boton - userCoords.lon);
    return latDifference <= 0.0025 && lonDifference <= 0.0025;
  });
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
    return parserButtonsResponseFireBase(parsed);
  } catch (error) {
    throw new Error(
      `Error al procesar la respuesta de la API: ${error.message}`
    );
  }
}

// Función principal para inicializar el mapa y cargar la información
async function initialize_map(coordinates) {
  if (!filter_coordinates_CDMX(coordinates)) {
    swal({
      icon: "error",
      title: "Oops...",
      text: "Parece que la dirección que buscas no pertenece a la Ciudad de México",
    });
    return;
  }
  if (map) {
    // Si ya hay un mapa inicializado, eliminarlo antes de crear uno nuevo
    map.remove();
  }

  map = L.map("map").setView([coordinates.lat, coordinates.lon], 18);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  try {
    // Calcular el radio en grados de latitud para aproximadamente 1 kilómetro
    const radiusInDegrees = 1 / 111;

    // Determinar el color del círculo según la cantidad de crímenes filtrados
    const filteredCrimes = filter_crimes_by_location(
      await load_crimes_list(),
      coordinates
    );
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
    L.circle([coordinates.lat, coordinates.lon], {
      radius: radiusInDegrees * 40000,
      fillColor: circleColor,
      color: circleColor,
      weight: 3,
      opacity: 1,
      fillOpacity: 0.6,
    }).addTo(map);

    // Agregar marcadores para cada crimen filtrado
    filteredCrimes.forEach((crime) => {
      const { latitud_delito, longitud_delito } = crime;
      L.marker([latitud_delito, longitud_delito])
        .addTo(map)
        .bindPopup(crime.delito); // Mostrar descripción del crimen en el popup
    });

    // Agregar marcadores para los botones de pánico
    const filteredButtons = filter_buttons_by_location(
      await load_buttons_list(),
      coordinates
    );

    filteredButtons.forEach((button) => {
      const { latitud_boton, longitud_boton } = button;
      L.marker([latitud_boton, longitud_boton], {
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
  } catch (error) {
    console.error("Error al cargar la información del mapa:", error.message);
    swal({
      icon: "error",
      title: "Oops...",
      text: "Error al cargar la información del mapa, intenta nuevamente",
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search_button");

  // Agregar evento click al botón de búsqueda
  searchButton.addEventListener("click", async () => {
    const direccionInput = document.getElementById("direccionInput").value;

    // Verificar si la entrada de dirección no está vacía
    if (direccionInput.trim() === "") {
      swal({
        icon: "error",
        title: "Oops...",
        text: "Por favor ingresa una dirección válida.",
      });
      return;
    }

    try {
      // Función para obtener coordenadas de una dirección usando Nominatim
      const coordenadas = await obtenerCoordenadas(direccionInput);

      if (coordenadas) {
        swal({
          icon: "success",
          title: "Coordenadas Encontradas",
          text: "Se encontró la dirección",
        });

        // Llamar a la función principal para inicializar el mapa y cargar la información
        initialize_map(coordenadas);
      } else {
        swal({
          icon: "error",
          title: "Oops...",
          text: "No se encontró la dirección en nuestra base de datos, intenta nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al obtener las coordenadas:", error.message);
      swal({
        icon: "error",
        title: "Oops...",
        text: "Error al obtener las coordenadas, intenta nuevamente",
      });
    }
  });
});

(async function() {
  await initialize_map();
})();


const url_DB_buttons =
  "https://proyecto-ipn-default-rtdb.firebaseio.com/botones.json";
const url_DB_crimes =
  "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";

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
          `,
      },
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
          `,
      },
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
          `,
      },
    },
  });
}

async function initialize_map() {
  const map = L.map("map").setView([19.4326018, -99.1332049], 21);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let currentCircleColor = "";

  try {
    const buttonsList = await load_buttons_list();
    const crimesList = await load_crimes_list();

    map.on('moveend', async function() {
      const bounds = map.getBounds();
      const southwest = bounds.getSouthWest();
      const northeast = bounds.getNorthEast();

      const visibleArea = {
        minLat: southwest.lat,
        maxLat: northeast.lat,
        minLon: southwest.lng,
        maxLon: northeast.lng
      };

      const filteredCrimes = crimesList.filter(crime => {
        return (
          crime.latitud_delito >= visibleArea.minLat &&
          crime.latitud_delito <= visibleArea.maxLat &&
          crime.longitud_delito >= visibleArea.minLon &&
          crime.longitud_delito <= visibleArea.maxLon
        );
      });

      const numCrimes = filteredCrimes.length;
      let circleColor = "#ff0000";

      if (numCrimes < 25) {
        circleColor = "#00ff00";
      } else if (numCrimes >= 25 && numCrimes <= 55) {
        circleColor = "#ffff00";
      }

      if (currentCircleColor !== circleColor) {
        currentCircleColor = circleColor;
        if (circleColor === "#00ff00") {
          safe_alert();
        } else if (circleColor === "#ffff00") {
          warning_alert();
        } else {
          danger_alert();
        }
      }

      // Limpia los marcadores de crímenes antes de añadir los nuevos
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      filteredCrimes.forEach(crime => {
        const { latitud_delito, longitud_delito } = crime;
        L.marker([latitud_delito, longitud_delito])
          .addTo(map)
          .bindPopup(crime.delito);
      });
    });
  } catch (error) {
    swal({
      icon: "error",
      title: "Oops...",
      text: error.message || "Error inesperado",
    });
  }
}

document
  .getElementById("update-database-button")
  .addEventListener("click", async () => {
    // Mostrar alerta de espera
    const swalLoading = swal({
      title: "Actualizando base de datos...",
      text: "Esto puede tardar unos momentos.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    });

    try {
      // Llamar a la función que obtiene la data
      await getInfoApi();
      swalLoading.close();
      swal({
        icon: "success",
        title: "Base de datos actualizada",
        text: "La base de datos se ha actualizado correctamente.",
      });
    } catch (error) {
      swalLoading.close();
      swal({
        icon: "error",
        title: "Error al actualizar",
        text: "Hubo un problema al actualizar la base de datos.",
      });
    }
  });

// Llamar a la función principal para inicializar el mapa y cargar la información
initialize_map();
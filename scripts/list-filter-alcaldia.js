const url_DB = "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";

const alcaldia = document.querySelector("#alcaldias");

// Manejar el evento de cambio de alcaldía
alcaldia.addEventListener("change", async (event) => {
  const selectedValue = event.target.value;
  console.log(selectedValue);

  // Filtrar la lista de crímenes por alcaldía seleccionada
  const filteredCrimes = crimesList.filter((crime) => {
    return crime.alcaldia_catalogo.includes(selectedValue);
  });

  // Limitar la lista filtrada a un máximo de 100 elementos
  const limitedFilteredCrimes = filteredCrimes.slice(0, 100);

  // Limpiar la lista existente antes de renderizar la nueva lista
  cleanList();

  // Renderizar la lista de crímenes limitada
  renderList(limitedFilteredCrimes);
});

const renderList = (listToRender) => {
  console.log(listToRender);
  listToRender.forEach((crime, index) => {
    renderCrimes(crime, index);
  });
};

// Función para renderizar un solo crimen en la tabla
const renderCrimes = (crime) => {
  const tableCrimes = document.querySelector("#crimes_list");
  const row = document.createElement("tr");

  const idCell = document.createElement("th");
  idCell.textContent = crime.id;

  const cells = [
    crime.categoria_delito,
    crime.colonia_catalogo,
    crime.alcaldia_catalogo,
    `${crime.fecha_hecho} ${crime.hora_hecho}`,
    `${crime.latitud_delito}, ${crime.longitud_delito}`,
  ];

  // Crear y agregar celdas de datos a la fila
  row.appendChild(idCell);
  cells.forEach((cellText) => {
    const cell = document.createElement("td");
    cell.textContent = cellText;
    row.appendChild(cell);
  });

  // Agregar la fila a la tabla de crímenes
  tableCrimes.appendChild(row);
};

// Función para limpiar la lista de crímenes en la tabla
const cleanList = () => {
  const tableCrimes = document.querySelector("#crimes_list");
  tableCrimes.innerHTML = ""; // Eliminar todo el contenido de la tabla
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

// Función para obtener datos de la API y procesarlos
const getInfoApi = async () => {
  try {
    const response = await fetch(url_DB, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al obtener datos de la API");
    }

    const parsed = await response.json();
    const crimesData = parserResponseFireBase(parsed);

    // Guardar la lista de crímenes obtenida de la API
    crimesList = crimesData;

    console.log(crimesList);
  } catch (error) {
    swal({
      icon: "error",
      title: "Oops...",
      text: error.message || "Error obteniendo delitos",
    });
  }
};

// Llamar a la función para obtener y mostrar los datos de la API
async function show() {
  await getInfoApi();
}

let crimesList = [];

// Llamar a la función principal para mostrar los datos
show();

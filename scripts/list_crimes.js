const url_DB =
  "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";

// Variables globales para rastrear la lista de crímenes y el contador de crímenes mostrados
let crimesList = [];
let displayedCrimesCount = 0;

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
    crimesList = parserResponseFireBase(parsed); // Guardar la lista de crímenes obtenida de la API

    console.log(crimesList);

    // Mostrar los primeros 100 registros de crímenes al cargar la página
    displayNextCrimes(100);
  } catch (error) {
    swal({
      icon: "error",
      title: "Oops...",
      text: error.message || "Error obteniendo crimenes",
    });
  }
};

// Función para mostrar una cantidad específica de crímenes
const displayNextCrimes = (count) => {
  const tableCrimes = document.querySelector("#crimes_list");
  const container = document.querySelector("#button_space")

  // Determinar cuántos crímenes se mostrarán
  const endIndex = Math.min(displayedCrimesCount + count, crimesList.length);

  // Renderizar los crímenes en la tabla
  for (let i = displayedCrimesCount; i < endIndex; i++) {
    renderCrime(crimesList[i], i + 1); // Renderizar cada crimen con su índice
  }

  // Actualizar el contador de crímenes mostrados
  displayedCrimesCount = endIndex;

  // Mostrar el botón "Cargar más" si hay más crímenes por mostrar
  if (displayedCrimesCount < crimesList.length) {
    const loadMoreButton = document.createElement("button");
    loadMoreButton.className = "btn btn-primary"
    loadMoreButton.textContent = "Cargar más";
    loadMoreButton.style.backgroundColor = "blue";
    loadMoreButton.style.color = "azure";
    loadMoreButton.style.alignItems = "center";
    loadMoreButton.addEventListener("click", () => {
      displayNextCrimes(100); // Cargar 100 crímenes adicionales al hacer clic en el botón
      loadMoreButton.remove(); // Eliminar el botón después de cargar más crímenes
    });
    container.appendChild(loadMoreButton);
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

// Función para renderizar un solo crimen en la tabla
const renderCrime = (crime, index) => {
  const tableCrimes = document.querySelector("#crimes_list");
  const row = document.createElement("tr");

  const idCell = document.createElement("th");
  idCell.textContent = index;

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

// Función para inicializar la aplicación
const initializeApp = async () => {
  await getInfoApi(); // Obtener datos de la API al cargar la página
};

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
// Llamar a la función de inicialización al cargar la página
initializeApp();

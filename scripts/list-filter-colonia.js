const url_DB = "https://proyecto-ipn-default-rtdb.firebaseio.com/Crimes.json";
// Variables globales para almacenar la lista de crímenes y los selectores HTML
let crimesList = [];
let renderedCrimesCount = 0; // Contador para rastrear el número de crímenes renderizados
let selectedAlcaldia = ""; // Alcaldía seleccionada
let selectedColonia = ""; // Colonia seleccionada

const alcaldiaSelect = document.querySelector("#alcaldias");
const coloniaSelect = document.querySelector("#colonias");
const filterButton = document.querySelector("#filterButton");
const loadMoreButton = document.querySelector("#loadMoreButton");
const tableCrimes = document.querySelector("#crimes_list");

// Función para restablecer el contador de crímenes renderizados
const resetRenderedCount = () => {
  renderedCrimesCount = 0; // Reiniciar el contador de crímenes renderizados
};

alcaldiaSelect.addEventListener("change", () => {
  selectedAlcaldia = alcaldiaSelect.value;

  // Filtrar la lista de crímenes por la alcaldía seleccionada
  const filteredCrimes = crimesList.filter((crime) => {
    return crime.alcaldia_catalogo === selectedAlcaldia;
  });

  // Obtener las colonias únicas asociadas a la alcaldía seleccionada
  const uniqueColonias = [
    ...new Set(filteredCrimes.map((crime) => crime.colonia_catalogo)),
  ];

  // Limpiar y llenar el selector de colonias con las opciones actualizadas
  populateColonias(uniqueColonias);
});

// Función para llenar el selector de colonias con las opciones proporcionadas
const populateColonias = (colonias) => {
  // Obtener referencia al selector de colonias
  const coloniaSelect = document.querySelector("#colonias");

  // Limpiar el selector de colonias
  coloniaSelect.innerHTML = "";

  // Crear una opción predeterminada para el selector de colonias
  const defaultOption = document.createElement("option");
  defaultOption.value = ""; // Valor vacío
  defaultOption.textContent = "Seleccione una colonia";
  coloniaSelect.appendChild(defaultOption);

  // Llenar el selector de colonias con las opciones proporcionadas
  colonias.forEach((colonia) => {
    const option = document.createElement("option");
    option.value = colonia;
    option.textContent = colonia;
    coloniaSelect.appendChild(option);
  });
};

// Manejar el evento de cambio de colonia
coloniaSelect.addEventListener("change", () => {
  selectedColonia = coloniaSelect.value;
  resetRenderedCount(); // Restablecer el contador de crímenes renderizados
  filterCrimes(); // Filtrar y renderizar la lista de crímenes
});

// Manejar el evento de clic en el botón de filtrar
filterButton.addEventListener("click", () => {
  resetRenderedCount(); // Restablecer el contador de crímenes renderizados
  filterCrimes(); // Filtrar y renderizar la lista de crímenes
});

// Manejar el evento de clic en el botón de cargar más
loadMoreButton.addEventListener("click", () => {
  renderMoreCrimes(); // Renderizar más crímenes al hacer clic en cargar más
});

// Función para filtrar y renderizar la lista de crímenes
const filterCrimes = () => {
  // Filtrar la lista de crímenes por la alcaldía y colonia seleccionadas
  let filteredCrimes = crimesList.filter((crime) => {
    const matchesAlcaldia =
      selectedAlcaldia === "" || crime.alcaldia_catalogo === selectedAlcaldia;
    const matchesColonia =
      selectedColonia === "" || crime.colonia_catalogo === selectedColonia;
    return matchesAlcaldia && matchesColonia;
  });

  // Limpiar la lista existente antes de renderizar la nueva lista
  cleanList();

  // Renderizar la lista de crímenes filtrada
  renderList(filteredCrimes);
};

// Función para limpiar la lista de crímenes en la tabla
const cleanList = () => {
  tableCrimes.innerHTML = ""; // Eliminar todo el contenido de la tabla
  renderedCrimesCount = 0; // Reiniciar el contador de crímenes renderizados
};

// Función para renderizar una porción de la lista de crímenes
const renderList = (listToRender) => {
  const crimesToRender = listToRender.slice(
    renderedCrimesCount,
    renderedCrimesCount + 100
  ); // Renderizar solo los próximos 100 elementos
  crimesToRender.forEach((crime, index) => {
    const row = tableCrimes.insertRow();
    row.insertCell(0).textContent = renderedCrimesCount + index + 1; // Incrementar el índice según los crímenes ya renderizados
    row.insertCell(1).textContent = crime.categoria_delito;
    row.insertCell(2).textContent = crime.colonia_catalogo;
    row.insertCell(3).textContent = crime.alcaldia_catalogo;
    row.insertCell(4).textContent = `${crime.fecha_hecho} ${crime.hora_hecho}`;
    row.insertCell(
      5
    ).textContent = `${crime.latitud_delito}, ${crime.longitud_delito}`;
  });

  // Actualizar el contador de crímenes renderizados
  renderedCrimesCount += crimesToRender.length;

  // Mostrar u ocultar el botón de cargar más según la cantidad de crímenes renderizados
  if (renderedCrimesCount < listToRender.length) {
    loadMoreButton.style.display = "block"; // Mostrar el botón de cargar más
  } else {
    loadMoreButton.style.display = "none"; // Ocultar el botón de cargar más si no hay más crímenes por renderizar
  }

  // Restaurar los valores seleccionados de alcaldía y colonia después de renderizar más crímenes
  alcaldiaSelect.value = selectedAlcaldia;
  coloniaSelect.value = selectedColonia;
};

// Función para renderizar más crímenes al hacer clic en el botón de cargar más
const renderMoreCrimes = () => {
  const remainingCrimes = crimesList.slice(
    renderedCrimesCount,
    renderedCrimesCount + 100
  ); // Obtener la siguiente página de crímenes
  renderList(remainingCrimes); // Renderizar la siguiente página de crímenes
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
    crimesList = parserResponseFireBase(parsed); // Guardar la lista de crímenes obtenida de la API

    console.log(crimesList);

    // Obtener las alcaldías únicas para llenar el selector de alcaldías
    const uniqueAlcaldias = [
      ...new Set(crimesList.map((crime) => crime.alcaldia_catalogo)),
    ];
    populateAlcaldias(uniqueAlcaldias); // Llenar el selector de alcaldías
  } catch (error) {
    swal({
      icon: "error",
      title: "Oops...",
      text: error.message || "Error obteniendo crimenes",
    });
  }
};

// Función para llenar el selector de alcaldías con las opciones proporcionadas
const populateAlcaldias = (alcaldias) => {
  alcaldiaSelect.innerHTML = ""; // Limpiar el selector de alcaldías

  // Crear una opción predeterminada para el selector de alcaldías
  const defaultOption = document.createElement("option");
  defaultOption.value = ""; // Valor vacío
  defaultOption.textContent = "Seleccione una alcaldía";
  alcaldiaSelect.appendChild(defaultOption);

  // Llenar el selector de alcaldías con las opciones proporcionadas
  alcaldias.forEach((alcaldia) => {
    const option = document.createElement("option");
    option.value = alcaldia;
    option.textContent = alcaldia;
    alcaldiaSelect.appendChild(option);
  });
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

// Llamar a la función para obtener y mostrar los datos de la API al cargar la página
getInfoApi();

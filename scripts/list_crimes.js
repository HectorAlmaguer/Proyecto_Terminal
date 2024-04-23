const url_DB =
  "https://proyecto-terminal-ipn-default-rtdb.firebaseio.com/Crimes.json";


const slice_crimes = async (crimes_List) => {
  let crimes = crimes_List.slice(0, 1000);
  renderList(crimes);
};

const renderCrimes = async (crime,index) => {
  const table_crimes = document.querySelector("#crimes_list");
  const row_data = document.createElement("tr");
  const id_text = document.createElement("th");
  const cols_data1 = document.createElement("td");
  const cols_data2 = document.createElement("td");
  const cols_data3 = document.createElement("td");
  const cols_data4 = document.createElement("td");
  const cols_data5 = document.createElement("td");



  id_text.className = "font-weight-bold";
  id_text.textContent = index + 1;
  cols_data1.textContent = crime.categoria_delito;
  cols_data2.textContent = crime.colonia_catalogo;
  cols_data3.textContent = crime.alcaldia_catalogo;
  cols_data4.textContent = `${crime.fecha_hecho} ${crime.hora_hecho}`;
  cols_data5.textContent = `${crime.latitud_delito}, ${crime.longitud_delito}`;

  table_crimes.appendChild(row_data);
  row_data.appendChild(id_text);
  row_data.appendChild(cols_data1);
  row_data.appendChild(cols_data2);
  row_data.appendChild(cols_data3);
  row_data.appendChild(cols_data4);
  row_data.appendChild(cols_data5);
};

const cleanList = () => {
  while (table_crimes.firstChild) {
    table_crimes.removeChild(table_crimes.firstChild);
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
      fecha_hecho: response[key].fecha_hecho,
      hora_hecho: response[key].hora_hecho,
      latitud_delito: response[key].latitud,
      longitud_delito: response[key].longitud,
    };
    parsedResponse.push(element);
  }
  return parsedResponse;
};

const renderList = (listToRender) => {
  listToRender.forEach((crime, index) => {
    renderCrimes(crime, index);
  });
};
const getInfoApi = async () => {
  try {
    const response = await fetch(url_DB, {
      method: "GET",
    });
    const parsed = await response.json();
    const array_crimes = parserResponseFireBase(parsed);
    crimesList = array_crimes;
    console.log(crimesList);
  } catch (error) {
    swal({
      icon: "error",
      title: "Oops...",
      text: "Error obteniendo crimenes",
    });
  }
};

let crimesList = [];

async function show() {
  let get_data = await getInfoApi();
  let slice1 = await slice_crimes(crimesList);
  get_data;
  slice1;
}

show();

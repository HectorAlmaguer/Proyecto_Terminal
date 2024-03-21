// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfBXOwQbNEOr3gCI__2UqWTv8NFrcNqD0",
  authDomain: "proyecto-terminal-ipn.firebaseapp.com",
  projectId: "proyecto-terminal-ipn",
  storageBucket: "proyecto-terminal-ipn.appspot.com",
  messagingSenderId: "631393428509",
  appId: "1:631393428509:web:9798fa6ff6ab8ef49b12f4",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize variables
const auth = firebase.auth();
const database = firebase.database();

const btn_register = document.querySelector("#registerbtn");
const btn_signin = document.querySelector("#signin_btn");

// Set up our register function
function register() {
  // Get all our input fields
  const user_field = document.querySelector("#user_register");
  const password_field = document.querySelector("#password_register");
  const email_field = document.querySelector("#email_register");
  const email = email_field.value;
  const password = password_field.value;
  const full_name = user_field.value;
  // Validate input fields
  if (validate_email(email) == false || validate_password(password) == false) {
    swal({
      icon: "error",
      title: "Oops... Email o contraseña no Valida",
    });
    return;
  }
  if (validate_field(full_name) == false) {
    swal({
      icon: "error",
      title: "Oops... Rellena todos los campos",
    });
    return;
  }

  // Move on with Auth
  auth
    .createUserWithEmailAndPassword(email, password)
    .then(function () {
      // Declare user variable
      var user = auth.currentUser;

      // Add this user to Firebase Database
      var database_ref = database.ref();

      // Create User data
      var user_data = {
        email: email,
        full_name: full_name,
        last_login: Date.now(),
      };

      // Push to Firebase Database
      database_ref.child("users/" + user.uid).set(user_data);

      // DOne
      swal({
        title: "¡Bienvenido!",
        text: "Usuario Creado",
        icon: "success",
      });
    })
    .catch(function (error) {
      // Firebase will use this to alert of its errors
      let error_message = error.message;
      swal({
        icon: "error",
        title: "Oops...",
        text: error_message,
      });
    });
}

// Set up our login function
function login() {
  // Get all our input fields
  const email = document.querySelector("#user_login").value;
  const password = document.querySelector("#password_login").value;

  // Validate input fields
  if (validate_email(email) == false || validate_password(password) == false) {
    swal({
      icon: "error",
      title: "Oops... Email o contraseña no Valida",
    });
    return;
    // Don't continue running the code
  }

  auth
    .signInWithEmailAndPassword(email, password)
    .then(function () {
      // Declare user variable
      let user = auth.currentUser;

      // Add this user to Firebase Database
      let database_ref = database.ref();

      // Create User data
      let user_data = {
        last_login: Date.now(),
      };

      // Push to Firebase Database
      database_ref.child("users/" + user.uid).update(user_data);

      //Done

      let pagina = "./pages/map.html";
      let segundos = 5;
      function redireccion() {
        window.location.href = pagina;
      }
      setTimeout(redireccion(), segundos * 1000);

      swal({
        title: "¡Bienvenido!",
        text: "Usuario Encontrado",
        icon: "success",
      });
    })
    .catch(function (error) {
      // Firebase will use this to alert of its errors
      let error_message = error.message;

      swal({
        icon: "error",
        title: "Oops...",
        text: error_message,
      });
    });
}

// Validate Functions
function validate_email(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  if (expression.test(email) == true) {
    // Email is good
    return true;
  } else {
    // Email is not good
    return false;
  }
}

function validate_password(password) {
  // Firebase only accepts lengths greater than 6
  if (password < 6) {
    return false;
  } else {
    return true;
  }
}

function validate_field(field) {
  if (field == null) {
    return false;
  }

  if (field.length <= 0) {
    return false;
  } else {
    return true;
  }
}

btn_register.addEventListener("click", (event) => {
  register();
});

btn_signin.addEventListener("click", (event) => {
  login();
});

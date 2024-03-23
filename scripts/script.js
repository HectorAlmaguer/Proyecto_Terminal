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

const errorList = {
  'auth/app-deleted': 'No se encontró la base de datos',
  'auth/expired-action-code': 'El código de acción o el enlace ha caducado',
  'auth/invalid-action-code':
    'El código de acción no es válido. Esto puede suceder si el código está mal formado o ya se ha utilizado',
  'auth/user-disabled':
    'El usuario correspondiente a la credencial proporcionada ha sido deshabilitado',
  'auth/user-not-found': 'Usuario no existente',
  'auth/weak-password': 'La contraseña es demasiado débil',
  'auth/email-already-in-use':
    'Ya tenía una cuenta con la dirección de correo electrónico proporcionada',
  'auth/invalid-email': 'La dirección de correo electrónico no es válida',
  'auth/operation-not-allowed':
    'El tipo de cuenta correspondiente a esta credencial aún no está activado',
  'auth/account-exists-with-different-credential': 'Correo electrónico ya asociado con otra cuenta',
  'auth/auth-domain-config-required':
    'No se ha proporcionado la configuración para la autenticación',
  'auth/credential-already-in-use': 'Ya existe una cuenta para esta credencial',
  'auth/operation-not-supported-in-this-environment':
    'Esta operación no se admite en el entorno que se realiza. Asegúrese de que debe ser http o https',
  'auth/timeout':
    'Tiempo de respuesta excedido. Es posible que el dominio no esté autorizado para realizar operaciones',
  'auth/missing-android-pkg-name':
    'Se debe proporcionar un nombre de paquete para instalar la aplicación de Android',
  'auth/missing-continue-uri': 'La siguiente URL debe proporcionarse en la solicitud',
  'auth/missing-ios-bundle-id':
    'Se debe proporcionar un nombre de paquete para instalar la aplicación iOS',
  'auth/invalid-continue-uri': 'La siguiente URL proporcionada en la solicitud no es válida',
  'auth/unauthorized-continue-uri': 'El dominio de la siguiente URL no está en la lista blanca',
  'auth/invalid-dynamic-link-domain':
    'El dominio de enlace dinámico proporcionado, no está autorizado o configurado en el proyecto actual',
  'auth/argument-error': 'Verifique la configuración del enlace para la aplicación',
  'auth/invalid-persistence-type':
    'El tipo especificado para la persistencia de datos no es válido',
  'auth/unsupported-persistence-type':
    'El entorno actual no admite el tipo especificado para la persistencia de datos',
  'auth/invalid-credential': 'La credencial ha caducado o está mal formada',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-verification-code': 'El código de verificación de credencial no es válido',
  'auth/invalid-verification-id': 'El ID de verificación de credencial no es válido',
  'auth/custom-token-mismatch': 'El token es diferente del estándar solicitado',
  'auth/invalid-custom-token': 'El token proporcionado no es válido',
  'auth/captcha-check-failed':
    'El token de respuesta reCAPTCHA no es válido, ha caducado o el dominio no está permitido',
  'auth/invalid-phone-number':
    'El número de teléfono está en un formato no válido (estándar E.164)',
  'auth/missing-phone-number': 'El número de teléfono es obligatorio',
  'auth/quota-exceeded': 'Se ha excedido la cuota de SMS',
  'auth/cancelled-popup-request': 'Solo se permite una solicitud de ventana emergente a la vez',
  'auth/popup-blocked': 'El navegador ha bloqueado la ventana emergente',
  'auth/popup-closed-by-user':
    'El usuario cerró la ventana emergente sin completar el inicio de sesión en el proveedor',
  'auth/unauthorized-domain':
    'El dominio de la aplicación no está autorizado para realizar operaciones',
  'auth/invalid-user-token': 'El usuario actual no fue identificado',
  'auth/user-token-expired': 'El token del usuario actual ha caducado',
  'auth/null-user': 'El usuario actual es nulo',
  'auth/app-not-authorized': 'Aplicación no autorizada para autenticarse con la clave dada',
  'auth/invalid-api-key': 'La clave API proporcionada no es válida',
  'auth/network-request-failed': 'Error al conectarse a la red',
  'auth/requires-recent-login':
    'El último tiempo de acceso del usuario no cumple con el límite de seguridad',
  'auth/too-many-requests':
    'Las solicitudes se bloquearon debido a una actividad inusual. Vuelva a intentarlo después de un tiempo',
  'auth/web-storage-unsupported':
    'El navegador no es compatible con el almacenamiento o si el usuario ha deshabilitado esta función',
  'auth/invalid-claims': 'Los atributos de registro personalizados no son válidos',
  'auth/claims-too-large':
    'El tamaño de la solicitud excede el tamaño máximo permitido de 1 Megabyte',
  'auth/id-token-expired': 'El token informado ha caducado',
  'auth/id-token-revoked': 'El token informado ha caducado',
  'auth/invalid-argument': 'Se proporcionó un argumento no válido a un método',
  'auth/invalid-creation-time': 'La hora de creación debe ser una fecha UTC válida',
  'auth/invalid-disabled-field': 'La propiedad para el usuario deshabilitado no es válida',
  'auth/invalid-display-name': 'El nombre de usuario no es válido',
  'auth/invalid-email-verified': 'El correo electrónico no es válido',
  'auth/invalid-hash-algorithm': 'El algoritmo HASH no es compatible con la criptografía',
  'auth/invalid-hash-block-size': ' El tamaño del bloque HASH no es válido ',
  'auth/invalid-hash-derived-key-length': 'El tamaño de la clave derivada de HASH no es válido',
  'auth/invalid-hash-key': 'La clave HASH debe tener un búfer de bytes válido',
  'auth/invalid-hash-memory-cost': 'El costo de la memoria HASH no es válido',
  'auth/invalid-hash-parallelization': 'La carga paralela HASH no es válida',
  'auth/invalid-hash-rounds': 'El redondeo HASH no es válido',
  'auth/invalid-hash-salt-separator':
    'El campo separador SALT del algoritmo de generación HASH debe ser un búfer de bytes válido',
  'auth/invalid-id-token': 'El código de token ingresado no es válido',
  'auth/invalid-last-sign-in-time':
    'La última hora de inicio de sesión debe ser una fecha UTC válida',
  'auth/invalid-page-token': 'La siguiente URL proporcionada en la solicitud no es válida',
  'auth/invalid-password':
    'La contraseña no es válida, debe tener al menos 6 caracteres de longitud',
  'auth/invalid-password-hash': 'La contraseña HASH no es válida',
  'auth/invalid-password-salt': 'La contraseña SALT no es válida',
  'auth/invalid-photo-url': 'La URL de la foto del usuario no es válida',
  'auth/invalid-provider-id': 'El identificador del proveedor no es compatible',
  'auth/invalid-session-cookie-duration':
    'La duración de la COOKIE de la sesión debe ser un número válido en milisegundos, entre 5 minutos y 2 semanas',
  'auth/invalid-uid': 'El identificador proporcionado debe tener un máximo de 128 caracteres',
  'auth/invalid-user-import': 'El registro de usuario a importar no es válido',
  'auth/invalid-provider-data': 'El proveedor de datos no es válido',
  'auth/maximum-user-count-exceeded':
    'Se ha excedido el número máximo permitido de usuarios a importar',
  'auth/missing-hash-algorithm':
    'Es necesario proporcionar el algoritmo de generación HASH y sus parámetros para importar usuarios',
  'auth/missing-uid': 'Se requiere un identificador para la operación actual',
  'auth/reserved-claims':
    'Una o más propiedades personalizadas proporcionaron palabras reservadas usadas',
  'auth/session-cookie-revoked': 'La sesión COOKIE ha expirado',
  'auth/uid-alread-exists': 'El identificador proporcionado ya está en uso',
  'auth/email-already-exists': 'El correo electrónico proporcionado ya está en uso',
  'auth/phone-number-already-exists': 'El teléfono proporcionado ya está en uso',
  'auth/project-not-found': 'No se encontraron proyectos',
  'auth/insufficient-permission': 'La credencial utilizada no tiene acceso al recurso solicitado',
  'auth/internal-error':
    'El servidor de autenticación encontró un error inesperado al intentar procesar la solicitud',
};


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
      let error_message = !!errorList[error.code]
      ? errorList[error.code]
      : !!error.message
      ? error.message
      : 'Ocurrió un error inesperado';
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


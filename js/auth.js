// Configuración de tu proyecto Firebase (reemplaza con tus claves de Firebase Console)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-app.firebaseapp.com",
  projectId: "tu-app",
  storageBucket: "tu-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const btnLogin = document.getElementById('btn-google-login');
const btnLogout = document.getElementById('btn-logout');
const userProfileUI = document.getElementById('user-profile');

btnLogin.addEventListener('click', () => {
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("Usuario autenticado: ", result.user);
    })
    .catch((error) => {
      console.error("Error al autenticar: ", error);
    });
});

btnLogout.addEventListener('click', () => {
  auth.signOut();
});

// Escuchar cambios de estado de sesión
auth.onAuthStateChanged((user) => {
  if (user) {
    btnLogin.classList.add('hidden');
    userProfileUI.classList.remove('hidden');
    document.getElementById('user-avatar').src = user.photoURL;
    document.getElementById('user-name').textContent = user.displayName;
  } else {
    btnLogin.classList.remove('hidden');
    userProfileUI.classList.add('hidden');
  }
});

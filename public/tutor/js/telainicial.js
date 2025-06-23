import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTghhMKFHgiWtumkLdjlyuohlR__yzEag",
  authDomain: "cva-controle-de-vac-de-animais.firebaseapp.com",
  databaseURL:
    "https://cva-controle-de-vac-de-animais-default-rtdb.firebaseio.com",
  projectId: "cva-controle-de-vac-de-animais",
  storageBucket: "cva-controle-de-vac-de-animais.appspot.com",
  messagingSenderId: "674772281471",
  appId: "1:674772281471:web:7c9dedf81224a4459fb74a",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const mensagem = document.getElementById("mensagem");
const logoutBtn = document.getElementById("logoutBtn");
const menuToggle = document.getElementById('menu-toggle');
      const navLinks = document.getElementById('nav-links');

     if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Logout realizado com sucesso.");
      window.location.href = "../../login/logintutor.html";
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao sair. Tente novamente.");
    });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esse local.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  const uid = user.uid;
  try {
    const snapshot = await get(ref(database, "usuarios/" + uid + "/nome"));
    if (snapshot.exists()) {
      const nomeUsuario = snapshot.val();
      mensagem.innerText = "Bem-vindo " + nomeUsuario;
    } else {
      mensagem.innerText = "Bem-vindo Usuário";
    }
  } catch (error) {
    mensagem.innerText = "Bem-vindo Usuário";
    console.error(error);
  }
});

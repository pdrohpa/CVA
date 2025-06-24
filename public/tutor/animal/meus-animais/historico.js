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
const db = getDatabase(app);
const auth = getAuth(app);

const params = new URLSearchParams(window.location.search);
const idAnimal = params.get("idAnimal");

const logoutBtn = document.getElementById("logoutBtn");
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Logout realizado com sucesso.");
      window.location.href = "../../../login/logintutor.html";
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao sair. Tente novamente.");
    });
});

if (menuToggle && navLinks) { 
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("É necessário estar logado.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  const historicoRef = ref(db, `historicoAnimal/${user.uid}/${idAnimal}`);
  const animalRef = ref(db, `animais/${user.uid}/${idAnimal}`);

  const [animalSnap, historicoSnap] = await Promise.all([
    get(animalRef),
    get(historicoRef),
  ]);

  if (animalSnap.exists()) {
    document.getElementById("titulo").textContent = `Histórico de: ${
      animalSnap.val().nome
    }`;
  }

  const lista = document.getElementById("lista-historico");
  if (historicoSnap.exists()) {
    Object.values(historicoSnap.val()).forEach((registro) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>Vacina:</strong> ${registro.vacina}<br>
        <strong>Data:</strong> ${registro.dataAplicacao} ${registro.horaAplicacao}<br>
        <strong>Veterinário:</strong> ${registro.nomeVeterinario}
      `;
      lista.appendChild(item);
    });
  } else {
    lista.innerHTML = "<p>Sem registros de vacinação.</p>";
  }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
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
const auth = getAuth(app);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const listaAnimais = document.getElementById("lista-animais");
  const mensagem = document.getElementById("mensagem");

  const logoutBtn = document.getElementById("logoutBtn");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  if (logoutBtn) {
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
  }

  function formatarData(dataStr) {
    if (!dataStr) return "-";
    const d = new Date(dataStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-BR");
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      mensagem.textContent = "Você precisa estar logado para ver seus animais.";
      mensagem.className = "text-danger";

      window.location.href = "../../login/logintutor.html";
      return;
    }

    const animaisRef = ref(database, "animais/" + user.uid);

    onValue(
      animaisRef,
      (snapshot) => {
        listaAnimais.innerHTML = "";
        mensagem.textContent = "";

        const dados = snapshot.val();
        if (!dados) {
          mensagem.textContent = "Nenhum animal cadastrado.";
          mensagem.className = "text-muted";

          return;
        }

        Object.entries(dados).forEach(([key, animal]) => {
          const col = document.createElement("div");
          col.className = "col-12 col-md-6";

          const card = document.createElement("div");
          card.className = "card shadow-sm";

          const cardBody = document.createElement("div");
          cardBody.className = "card-body";

          cardBody.innerHTML = `
                        <h5 class="card-title">${animal.nome || "Sem nome"}</h5>
                        <p class="card-text">
                            <strong>Espécie:</strong> ${
                              animal.especie || "Desconhecida"
                            }<br />
                            <strong>Raça:</strong> ${
                              animal.raca || "Desconhecida"
                            }<br />
                            <strong>Data de Nascimento:</strong> ${formatarData(
                              animal.nascimento
                            )}
                        </p>
                        <a href="historico.html?uidTutor=${
                          user.uid
                        }&idAnimal=${key}" class="btn btn-primary">
                            Ver Histórico
                        </a>
                        `;

          card.appendChild(cardBody);
          col.appendChild(card);
          listaAnimais.appendChild(col);
        });
      },
      (error) => {
        console.error("Erro ao carregar animais:", error);
        e;
        mensagem.textContent = "Erro ao carregar animais: " + error.message;
        mensagem.className = "text-danger";
      }
    );
  });
});

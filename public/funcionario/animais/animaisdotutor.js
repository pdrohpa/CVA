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

document.addEventListener("DOMContentLoaded", () => {
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

  const uidParam = new URLSearchParams(window.location.search).get("uid");
  const listaAnimais = document.getElementById("lista-animais");
  const campoBusca = document.getElementById("busca");
  const btnNovo = document.getElementById("btn-novo-animal");
  let animaisComTutores = [];

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
        window.location.href = "../../login/loginfuncionario.html";
      })
      .catch((error) => {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao sair. Tente novamente.");
      });
  });

  if (btnNovo && uidParam) {
    btnNovo.style.display = "inline-block";
    btnNovo.addEventListener("click", () => {
      window.location.href = `animal-form.html?uidTutor=${uidParam}`;
    });
  }

  async function carregarAnimais() {
    const animaisRef = ref(database, "animais");
    const usuariosRef = ref(database, "usuarios");

    try {
      const [snapAnimais, snapUsuarios] = await Promise.all([
        get(animaisRef),
        get(usuariosRef),
      ]);

      if (!snapAnimais.exists()) {
        listaAnimais.innerHTML =
          "<p class='text-muted'>Nenhum animal encontrado.</p>";
        return;
      }

      const dadosAnimais = snapAnimais.val();
      const dadosUsuarios = snapUsuarios.exists() ? snapUsuarios.val() : {};

      animaisComTutores = [];

      Object.entries(dadosAnimais).forEach(([uid, animais]) => {
        if (!uidParam || uid === uidParam) {
          const tutor = dadosUsuarios[uid];
          const nomeTutor = tutor ? tutor.nome : "Tutor desconhecido";

          Object.entries(animais).forEach(([id, animal]) => {
            animaisComTutores.push({
              ...animal,
              id,
              uidTutor: uid,
              nomeTutor,
            });
          });
        }
      });

      renderizarLista(animaisComTutores);
    } catch (error) {
      console.error("Erro ao buscar animais:", error);
      listaAnimais.innerHTML =
        "<p class='text-danger'>Erro ao carregar animais.</p>";
    }
  }

  function renderizarLista(animais) {
    listaAnimais.innerHTML = "";

    if (animais.length === 0) {
      listaAnimais.innerHTML =
        "<p class='text-muted'>Nenhum animal correspondente encontrado.</p>";
      return;
    }

    animais.forEach((animal) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-3";

      col.innerHTML = `
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">${animal.nome || "Sem nome"}</h5>
            <p class="card-text">
              <strong>Espécie:</strong> ${animal.especie || "Desconhecida"}<br>
              <strong>Raça:</strong> ${animal.raca || "Desconhecida"}<br>
              <strong>Tutor:</strong> ${animal.nomeTutor}
            </p>
            <button class="btn btn-outline-primary btn-sm" onclick="editarAnimal('${
              animal.uidTutor
            }', '${animal.id}')">
              Editar
            </button>
             <a href="historico.html?uidTutor=${animal.uidTutor}&idAnimal=${
        animal.id
      }" class="btn btn-primary">
                        Ver Histórico
                      </a>
          </div>
        </div>
      `;

      listaAnimais.appendChild(col);
    });
  }

  campoBusca.addEventListener("input", () => {
    const termo = campoBusca.value.toLowerCase().trim();
    const filtrados = animaisComTutores.filter((a) =>
      a.nome?.toLowerCase().includes(termo)
    );
    renderizarLista(filtrados);
  });

  window.editarAnimal = function (uidTutor, idAnimal) {
    window.location.href = `animal-form.html?uidTutor=${uidTutor}&idAnimal=${idAnimal}`;
  };

  onAuthStateChanged(auth, (user) => {
    if (user) {
      carregarAnimais();
    } else {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "/login.html";
    }
  });
});

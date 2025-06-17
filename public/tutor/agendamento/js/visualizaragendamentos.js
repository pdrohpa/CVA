import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
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

const corpoTabela = document.getElementById("corpoTabela");

const logoutBtn = document.getElementById("logoutBtn");

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

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  carregarAgendamentosDoUsuario(user.uid);
});

function carregarAgendamentosDoUsuario(uid) {
  const agendamentosRef = ref(database, `agendamentos/${uid}`);
  onValue(agendamentosRef, (snapshot) => {
    preencherTabela(snapshot.val(), uid);
  });
}

function preencherTabela(agendamentos, tutorUID) {
  corpoTabela.innerHTML = "";

  if (!agendamentos) {
    corpoTabela.innerHTML =
      '<tr><td colspan="7" class="text-center">Nenhum agendamento encontrado.</td></tr>';
    return;
  }

  const linhas = [];

  for (const id in agendamentos) {
    const ag = agendamentos[id];
    linhas.push(gerarLinha(ag, id));
  }

  corpoTabela.innerHTML = linhas.join("");

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", () => {
      const agendamentoId = btn.getAttribute("data-id");
      if (confirm("Tem certeza que deseja excluir esse agendamento?")) {
        const agendamentoRef = ref(
          database,
          `agendamentos/${tutorUID}/${agendamentoId}`
        );
        remove(agendamentoRef)
          .then(() => alert("Agendamento excluído com sucesso!"))
          .catch((error) => alert("Erro ao excluir: " + error.message));
      }
    });
  });
}

function gerarLinha(ag, id) {
  return `
    <tr>
      <td>${ag.vacina}</td>
      <td>${ag.nomeAnimal}</td>
      <td>${ag.veterinario}</td>
      <td>${ag.data}</td>
      <td>${ag.hora}</td>
      <td>${new Date(ag.criadoEm).toLocaleString("pt-BR")}</td>
      <td><button class='btn btn-danger btn-sm btn-excluir' data-id='${id}'>Excluir</button></td>
    </tr>
  `;
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
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
const uidParam = new URLSearchParams(window.location.search).get("uid");

const tabelaAgendamentos = document.getElementById("tabela-agendamentos");
const campoBusca = document.getElementById("busca");
let listaCompleta = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esse local.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  try {
    const uid = user.uid;
    const usuarioRef = ref(database, `usuarios/${uid}`);
    const usuarioSnap = await get(usuarioRef);

    if (!usuarioSnap.exists()) {
      alert("Usuário não encontrado.");
      window.location.href = "../../login/logintutor.html";
      return;
    }

    const dadosUsuario = usuarioSnap.val();
    if (dadosUsuario.funcao !== "funcionario") {
      alert("Acesso restrito a funcionários.");
      window.location.href = "../../login/logintutor.html";
      return;
    }

    const agendamentosRef = ref(database, "agendamentos");
    const usuariosRef = ref(database, "usuarios");

    const [agendamentosSnap, usuariosSnap] = await Promise.all([
      get(agendamentosRef),
      get(usuariosRef),
    ]);

    if (!agendamentosSnap.exists()) {
      tabelaAgendamentos.innerHTML =
        "<tr><td colspan='6'>Nenhum agendamento encontrado.</td></tr>";
      return;
    }

    const agendamentos = agendamentosSnap.val();
    const usuarios = usuariosSnap.val();

    listaCompleta = [];

    for (const uidTutor in agendamentos) {
      const nomeTutor = usuarios[uidTutor]?.nome || "Desconhecido";
      const agendamentosDoTutor = agendamentos[uidTutor];

      for (const idAgendamento in agendamentosDoTutor) {
        const ag = agendamentosDoTutor[idAgendamento];
        listaCompleta.push({
          uidTutor,
          idAgendamento,
          nomeTutor,
          ...ag,
        });
      }
    }

    renderizarTabela(listaCompleta);

    campoBusca.addEventListener("input", () => {
      const termo = campoBusca.value.toLowerCase().trim();
      const filtrados = listaCompleta.filter((ag) =>
        ag.nomeAnimal?.toLowerCase().includes(termo)
      );
      renderizarTabela(filtrados);
    });
  } catch (error) {
    console.error("Erro geral:", error);
    alert("Erro ao carregar dados.");
  }
});

window.excluirAgendamento = async function (uidTutor, idAgendamento) {
  if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

  try {
    const agendamentoRef = ref(
      database,
      `agendamentos/${uidTutor}/${idAgendamento}`
    );
    await remove(agendamentoRef); // <-- Aqui está a correção

    alert("Agendamento excluído com sucesso!");
    location.reload();
  } catch (error) {
    console.error("Erro ao excluir:", error);
    alert("Erro ao excluir agendamento.");
  }
};

function renderizarTabela(lista) {
  tabelaAgendamentos.innerHTML = "";

  if (lista.length === 0) {
    tabelaAgendamentos.innerHTML =
      "<tr><td colspan='6'>Nenhum agendamento encontrado.</td></tr>";
    return;
  }

  lista.forEach((ag) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ag.nomeTutor}</td>
      <td>${ag.nomeAnimal}</td>
      <td>${ag.veterinario}</td>
      <td>${ag.data}</td>
      <td>${ag.hora}</td>
      <td>
         <button class="btn btn-danger btn-sm" onclick="excluirAgendamento('${ag.uidTutor}', '${ag.idAgendamento}')">
             Excluir
         </button>
      </td>
    `;
    tabelaAgendamentos.appendChild(tr);
  });
}

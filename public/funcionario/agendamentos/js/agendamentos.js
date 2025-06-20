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

const tabelaAgendamentos = document.getElementById("tabela-agendamentos");
const campoBusca = document.getElementById("busca");
let listaCompleta = [];
let listaFiltradaParaExibicao = [];
let usuarioLogado = null;
const logoutBtn = document.getElementById("logoutBtn");

const urlParams = new URLSearchParams(window.location.search);
const uidTutorParam = urlParams.get("uidTutor");

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
    usuarioLogado = dadosUsuario;

    if (
      dadosUsuario.funcao !== "funcionario" &&
      dadosUsuario.funcao !== "veterinario"
    ) {
      alert("Acesso restrito a funcionários ou veterinários.");
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

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeFormatado = hoje.toISOString().split("T")[0];

    for (const currentUidTutor in agendamentos) {
      if (uidTutorParam && currentUidTutor !== uidTutorParam) {
        continue;
      }

      const nomeTutor = usuarios[currentUidTutor]?.nome || "Desconhecido";
      const agendamentosDoTutor = agendamentos[currentUidTutor];

      for (const idAgendamento in agendamentosDoTutor) {
        const ag = agendamentosDoTutor[idAgendamento];

        const dataAgendamentoParaComparacao = ag.data;

        if (dataAgendamentoParaComparacao < hojeFormatado) {
          continue;
        }

        if (!uidTutorParam && dadosUsuario.tipo === "veterinario") {
          if (ag.veterinario !== dadosUsuario.nome) {
            continue;
          }
        }

        listaCompleta.push({
          uidTutor: currentUidTutor,
          idAgendamento,
          nomeTutor,
          ...ag,
        });
      }
    }

    listaFiltradaParaExibicao = [...listaCompleta];
    renderizarTabela(listaFiltradaParaExibicao);

    campoBusca.addEventListener("input", () => {
      const termo = campoBusca.value.toLowerCase().trim();
      const filtrados = listaFiltradaParaExibicao.filter((ag) =>
        ag.nomeAnimal?.toLowerCase().includes(termo)
      );
      renderizarTabela(filtrados);
    });
  } catch (error) {
    console.error("Erro geral ao carregar agendamentos:", error);
    alert("Erro ao carregar dados dos agendamentos.");
  }

  window.excluirAgendamento = async function (uidTutor, idAgendamento) {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

    try {
      const agendamentoRef = ref(
        database,
        `agendamentos/${uidTutor}/${idAgendamento}`
      );
      await remove(agendamentoRef);
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
        "<tr><td colspan='6'>Nenhum agendamento encontrado para esse animal / veterinário..</td></tr>";
      return;
    }

    lista.forEach((ag) => {
       const tr = document.createElement("tr");
      tr.classList.add("linha-agendamento");

      const botaoExcluir = `
        <button class="btn btn-danger btn-sm" onclick="excluirAgendamento('${ag.uidTutor}', '${ag.idAgendamento}')">
          Excluir
        </button>`;

      const botaoVacinar =
        usuarioLogado?.tipo === "veterinario"
          ? `<a href="../vacinacao/realizarvacinacao.html?uidTutor=${ag.uidTutor}&idAnimal=${ag.idAnimal}&idAgendamento=${ag.idAgendamento}" class="btn btn-success btn-sm">
              Fazer Vacinação
            </a>`
          : "";

      tr.innerHTML = `
        <td>${ag.nomeTutor}</td>
        <td>${ag.nomeAnimal}</td>
        <td>${ag.veterinario}</td>
        <td>${ag.vacina}</td>
        <td>${ag.data}</td>
        <td>${ag.hora}</td>
        <td>
          ${botaoExcluir}
          ${botaoVacinar}
        </td>
      `;
      tabelaAgendamentos.appendChild(tr);
    });
  }
});

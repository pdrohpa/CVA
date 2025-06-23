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

const tabelaVacinas = document.getElementById("tabela-vacinas");
const buscaTipo = document.getElementById("buscaTipo");
const filtroAplicacao = document.getElementById("filtroAplicacao");
const logoutBtn = document.getElementById("logoutBtn");

let vacinas = {};
let tipos = {};

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Logout realizado com sucesso.");
      window.location.href = "../../../login/loginfuncionario.html";
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao sair. Tente novamente.");
    });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar este local.");
    window.location.href = " ../../../login/logintutor.html";
    return;
  }

  try {
    const uid = user.uid;
    const usuarioRef = ref(database, `usuarios/${uid}`);
    const usuarioSnap = await get(usuarioRef);

    if (!usuarioSnap.exists()) {
      alert("Usuário não encontrado.");
      window.location.href = "../../../login/logintutor.html";
      return;
    }

    const dadosUsuario = usuarioSnap.val();

    if (dadosUsuario.funcao !== "funcionario") {
      alert("Acesso restrito a funcionários.");
      window.location.href = "../../../login/logintutor.html";
      return;
    }

    await carregarDados();

    buscaTipo.addEventListener("input", aplicarFiltros);
    filtroAplicacao.addEventListener("change", aplicarFiltros);
  } catch (error) {
    console.error("Erro geral na autenticação ou carregamento inicial:", error);
    alert("Erro ao carregar dados.");
  }
});

async function carregarDados() {
  try {
    const snapshotTipos = await get(ref(database, "tiposVacinas"));
    tipos = snapshotTipos.val() || {};

    const snapshotVacinas = await get(ref(database, "vacinas"));
    vacinas = snapshotVacinas.val() || {};

    aplicarFiltros();
  } catch (error) {
    console.error("Erro ao carregar dados do Firebase:", error);
    tabelaVacinas.innerHTML =
      "<tr><td colspan='4'>Erro ao carregar dados das vacinas. Por favor, verifique suas permissões.</td></tr>";
  }
}

function aplicarFiltros() {
  const textoBusca = buscaTipo.value.toLowerCase().trim();
  const aplicacaoSelecionada = filtroAplicacao.value;

  tabelaVacinas.innerHTML = "";

  let vacinasEncontradas = 0;

  Object.values(vacinas).forEach((vacina) => {
    const tipo = tipos[vacina.tipoVacina];
    if (!tipo) return;

    const nomeTipo = tipo.nome || "";
    const aplicacao = tipo.aplicacao || "";

    const condicaoBusca = nomeTipo.toLowerCase().includes(textoBusca);
    const condicaoAplicacao =
      !aplicacaoSelecionada || aplicacao === aplicacaoSelecionada;

    if (condicaoBusca && condicaoAplicacao) {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${nomeTipo}</td>
        <td>${aplicacao}</td>
        <td>${vacina.lote}</td>
        <td>${vacina.validade}</td>
      `;
      tabelaVacinas.appendChild(linha);
      vacinasEncontradas++;
    }
  });

  if (vacinasEncontradas === 0) {
    tabelaVacinas.innerHTML =
      "<tr><td colspan='4'>Nenhuma vacina encontrada com os critérios de busca.</td></tr>";
  }
}

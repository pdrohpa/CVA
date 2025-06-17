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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const tabelaVacinas = document.getElementById("tabela-vacinas");
const buscaTipo = document.getElementById("buscaTipo");
const filtroAplicacao = document.getElementById("filtroAplicacao");

let vacinas = {};
let tipos = {};

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

function carregarDados() {
  db.ref("tiposVacinas")
    .once("value")
    .then((snapshotTipos) => {
      tipos = snapshotTipos.val() || {};

      db.ref("vacinas")
        .once("value")
        .then((snapshotVacinas) => {
          vacinas = snapshotVacinas.val() || {};
          aplicarFiltros();
        });
    });
}

function aplicarFiltros() {
  const textoBusca = buscaTipo.value.toLowerCase().trim();
  const aplicacaoSelecionada = filtroAplicacao.value;

  tabelaVacinas.innerHTML = "";

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
    }
  });

  if (tabelaVacinas.innerHTML.trim() === "") {
    tabelaVacinas.innerHTML =
      "<tr><td colspan='4'>Nenhuma vacina encontrada.</td></tr>";
  }
}

buscaTipo.addEventListener("input", aplicarFiltros);
filtroAplicacao.addEventListener("change", aplicarFiltros);

carregarDados();

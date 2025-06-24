import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  push,
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

const params = new URLSearchParams(window.location.search);
const uidTutor = params.get("uidTutor");
const idAnimal = params.get("idAnimal");

const vacinaSelect = document.getElementById("vacina");
const infoVacina = document.getElementById("info-vacina");
const botaoConfirmar = document.getElementById("confirmar");

let vacinas = {};
let tipos = {};
let dadosVeterinario = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("É necessário estar logado como veterinário.");
    window.location.href = "../../login/loginvet.html";
    return;
  }

  const usuarioSnap = await get(ref(database, `usuarios/${user.uid}`));
  if (!usuarioSnap.exists() || usuarioSnap.val().tipo !== "veterinario") {
    alert("Acesso restrito a veterinários.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  dadosVeterinario = usuarioSnap.val();

  document.getElementById("nome-veterinario").textContent =
    dadosVeterinario.nome;

  const animalRef = ref(database, `animais/${uidTutor}/${idAnimal}`);
  const animalSnap = await get(animalRef);

  if (animalSnap.exists()) {
    const dadosAnimal = animalSnap.val();
    document.getElementById("nome-animal").textContent = dadosAnimal.nome;
  } else {
    document.getElementById("nome-animal").textContent =
      "Animal não encontrado";
  }

  const [tiposSnap, vacinasSnap] = await Promise.all([
    get(ref(database, "tiposVacinas")),
    get(ref(database, "vacinas")),
  ]);

  tipos = tiposSnap.exists() ? tiposSnap.val() : {};
  vacinas = vacinasSnap.exists() ? vacinasSnap.val() : {};

  for (const id in vacinas) {
    const v = vacinas[id];
    const tipoNome = tipos[v.tipoVacina]?.nome || "Tipo desconhecido";
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${tipoNome} - Lote: ${v.lote} - Validade: ${v.validade}`;
    vacinaSelect.appendChild(option);
  }
});

vacinaSelect.addEventListener("change", () => {
  const selecionada = vacinas[vacinaSelect.value];
  if (selecionada) {
    const tipoNome = tipos[selecionada.tipoVacina]?.nome || "Desconhecido";
    infoVacina.innerHTML = `
            <p><strong>Nome:</strong> ${tipoNome}</p>
            <p><strong>Lote:</strong> ${selecionada.lote}</p>
            <p><strong>Validade:</strong> ${selecionada.validade}</p>
            `;
  } else {
    infoVacina.innerHTML = "";
  }
});

botaoConfirmar.addEventListener("click", async () => {
  const idVacina = vacinaSelect.value;
  if (!idVacina) {
    alert("Selecione uma vacina.");
    return;
  }

  const vacina = vacinas[idVacina];
  if (!vacina) {
    alert("Erro: Dados da vacina selecionada não encontrados.");
    return;
  }
  const tipoNome = tipos[vacina.tipoVacina]?.nome || "Desconhecido";

  if (!auth.currentUser || !auth.currentUser.uid) {
    alert("Erro de autenticação: Usuário não logado ou UID inválido.");
    window.location.href = "../../login/loginvet.html";
    return;
  }

  if (
    !dadosVeterinario ||
    typeof dadosVeterinario !== "object" ||
    !dadosVeterinario.nome
  ) {
    alert(
      "Erro: Dados do perfil do veterinário estão incompletos ou não foram carregados. Recarregue a página e tente novamente."
    );
    return;
  }

  const agora = new Date();

  const historico = {
    vacina: tipoNome,
    lote: vacina.lote,
    validade: vacina.validade,
    dataAplicacao: agora.toLocaleDateString(),
    horaAplicacao: agora.toLocaleTimeString(),
    aplicadoPor: auth.currentUser.uid,
    nomeVeterinario: dadosVeterinario.nome,
    criadoEm: agora.toISOString(),
  };

  try {
    await push(
      ref(database, `historicoAnimal/${uidTutor}/${idAnimal}`),
      historico
    );
    alert("Vacinação registrada com sucesso!");
    window.location.href = `../animais/visualizar.html?uidTutor=${uidTutor}&idAnimal=${idAnimal}`;
  } catch (error) {
    alert("Erro ao registrar vacinação: " + error.message);
  }
});

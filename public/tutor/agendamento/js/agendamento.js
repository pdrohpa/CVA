import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  child,
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

const animalSelect = document.getElementById("animal");
const vacinaSelect = document.getElementById("vacina");
const botaoCadastro = document.getElementById("botaoConfirmar");
let tiposVacinasDisponiveis = {};

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
    alert("Você precisa estar logado para agendar.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  function carregarAnimais() {
    const animaisRef = ref(database, "animais/" + user.uid);

    get(animaisRef)
      .then((snapshot) => {
        const dados = snapshot.val();

        if (!dados) {
          animalSelect.innerHTML = `<option value="">Nenhum animal cadastrado</option>`;
          return;
        }

        animalSelect.innerHTML = `<option value="">Selecione um animal</option>`;

        Object.entries(dados).forEach(([animalId, animal]) => {
          const option = document.createElement("option");
          option.value = animalId;
          option.textContent = animal.nome;
          option.setAttribute("data-nome", animal.nome);
          option.setAttribute(
            "data-especie",
            animal.especie?.toLowerCase() || ""
          );
          animalSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar animais:", error);
        animalSelect.innerHTML = `<option value="">Erro ao carregar animais</option>`;
      });
  }

  function carregarVacinas() {
    const vacinasRef = ref(database, "tiposVacinas");
    get(vacinasRef)
      .then((snapshot) => {
        tiposVacinasDisponiveis = snapshot.val() || {};
        vacinaSelect.innerHTML = `<option value="">Selecione um animal primeiro</option>`;
      })
      .catch((error) => {
        console.error("Erro ao carregar vacinas:", error);
        vacinaSelect.innerHTML = `<option value="">Erro ao carregar vacinas</option>`;
      });
  }

  animalSelect.addEventListener("change", () => {
    const selected = animalSelect.options[animalSelect.selectedIndex];
    const especie = selected.getAttribute("data-especie");

    if (!especie) {
      vacinaSelect.innerHTML = `<option value="">Selecione um animal primeiro</option>`;
      return;
    }

    vacinaSelect.innerHTML = `<option value="">Selecione uma vacina</option>`;

    let vacinasEncontradas = 0;

    Object.entries(tiposVacinasDisponiveis).forEach(([id, vacina]) => {
      const aplicacao = vacina.aplicacao?.toLowerCase() || "";

      if (aplicacao === especie) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = vacina.nome;
        option.setAttribute("data-nome", vacina.nome);
        vacinaSelect.appendChild(option);
        vacinasEncontradas++;
      }
    });

    if (vacinasEncontradas === 0) {
      vacinaSelect.innerHTML = `<option value="">Nenhuma vacina disponível para ${especie}</option>`;
    }
  });
  function carregarVeterinarios() {
    const usuariosRef = ref(database, "usuarios");

    get(usuariosRef)
      .then((snapshot) => {
        const todosUsuarios = snapshot.val();
        const selectVet = document.getElementById("veterinario");

        selectVet.innerHTML = `<option value="">Selecione um veterinário</option>`;

        if (!todosUsuarios) return;

        Object.values(todosUsuarios).forEach((usuario) => {
          if (usuario.tipo === "veterinario") {
            const option = document.createElement("option");
            option.value = usuario.nome || usuario.email || "SemNome";
            option.textContent = usuario.nome || usuario.email;
            selectVet.appendChild(option);
          }
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar veterinários:", error);
        const selectVet = document.getElementById("veterinario");
        selectVet.innerHTML = `<option value="">Erro ao carregar veterinários</option>`;
      });
  }
  carregarVeterinarios();
  carregarVacinas();
  carregarAnimais();

  botaoCadastro.addEventListener("click", () => {
    const vacinaSelecionada = vacinaSelect.options[vacinaSelect.selectedIndex];
    const vacinaNome = vacinaSelecionada?.getAttribute("data-nome") || "";
    const animalId = animalSelect.value;
    const selectedOption = animalSelect.options[animalSelect.selectedIndex];
    const animalNome = selectedOption?.getAttribute("data-nome") || "";
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;
    const veterinario = document.getElementById("veterinario").value;
    const resumo = document.getElementById("resumo");
    const redirecionamento = document.getElementById("redirecionamento");

    try {
      if (!vacinaSelecionada) throw new Error("Selecione uma vacina.");
      if (!animalId) throw new Error("Selecione um animal.");
      if (!data || !hora) throw new Error("Preencha data e hora.");
      if (!veterinario) throw new Error("Selecione um veterinário.");

      const agendamentoRef = push(ref(database, `agendamentos/${user.uid}`));

      const novoAgendamento = {
        idAnimal: animalId,
        nomeAnimal: animalNome,
        vacina: vacinaNome,
        data,
        hora,
        veterinario,
        criadoEm: new Date().toISOString(),
      };

      set(agendamentoRef, novoAgendamento)
        .then(() => {
          resumo.innerText = `✅ Agendamento confirmado:
                          Vacina: ${vacinaNome}
                           Animal: ${animalNome}
                           Veterinário: ${veterinario}
                           Data: ${data}
                           Hora: ${hora}`;
          redirecionamento.innerHTML =
            "<a href='../agendamento/visualizaragendamentos.html' class='text-blue me-3'>Visualizar Agendamento</a>";
        })
        .catch((error) => {
          console.error(error);
          resumo.innerText = "Erro ao salvar no Firebase: " + error.message;
        });
    } catch (error) {
      resumo.innerText = "Erro: " + error.message;
    }
  });
});

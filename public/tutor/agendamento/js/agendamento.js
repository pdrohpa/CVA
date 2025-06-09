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
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// Firebase config
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
const botaoCadastro = document.getElementById("botaoConfirmar");

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
          animalSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar animais:", error);
        animalSelect.innerHTML = `<option value="">Erro ao carregar animais</option>`;
      });
  }

  carregarAnimais();

  botaoCadastro.addEventListener("click", () => {
    const vacinaSelecionada = document.querySelector(
      'input[name="vacina"]:checked'
    );
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
        vacina: vacinaSelecionada.value,
        data,
        hora,
        veterinario,
        criadoEm: new Date().toISOString(),
      };

      set(agendamentoRef, novoAgendamento)
        .then(() => {
          resumo.innerText = `✅ Agendamento confirmado:
                          Vacina: ${vacinaSelecionada.value}
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
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

const animalSelect = document.getElementById("animal");
const vacinaSelect = document.getElementById("vacina");
const veterinarioSelect = document.getElementById("veterinario");
const dataInput = document.getElementById("data");
const horaSelect = document.getElementById("hora");
const botaoConfirmar = document.getElementById("botaoConfirmar");

const resumo = document.getElementById("resumo");
const redirecionamento = document.getElementById("redirecionamento");

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

  const uidDoTutorLogado = user.uid;

  function carregarVacinas() {
    const vacinasRef = ref(database, "tiposVacinas");
    get(vacinasRef)
      .then((snapshot) => {
        tiposVacinasDisponiveis = snapshot.val() || {};
        vacinaSelect.innerHTML = `<option value="">Selecione uma vacina</option>`;
      })
      .catch((error) => {
        console.error("Erro ao carregar vacinas:", error);
        vacinaSelect.innerHTML = `<option value="">Erro ao carregar vacinas</option>`;
      });
  }

  function carregarAnimais() {
    const animaisRef = ref(database, "animais/" + uidDoTutorLogado);
    get(animaisRef)
      .then((snapshot) => {
        const dados = snapshot.val();
        if (!dados) {
          animalSelect.innerHTML = `<option value="">Nenhum animal cadastrado</option>`;
          return;
        }
        animalSelect.innerHTML = `<option value="">Selecione um animal</option>`;
        Object.entries(dados).forEach(([id, animal]) => {
          const option = document.createElement("option");
          option.value = id;
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

  function carregarVeterinarios() {
    const usuariosRef = ref(database, "usuarios");
    get(usuariosRef)
      .then((snapshot) => {
        const todosUsuarios = snapshot.val();
        veterinarioSelect.innerHTML = `<option value="">Selecione um veterinário</option>`;
        if (!todosUsuarios) return;
        Object.values(todosUsuarios).forEach((usuario) => {
          if (usuario.tipo === "veterinario") {
            const option = document.createElement("option");
            option.value = usuario.nome || usuario.email || "SemNome";
            option.textContent = usuario.nome || usuario.email;
            veterinarioSelect.appendChild(option);
          }
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar veterinários:", error);
        veterinarioSelect.innerHTML = `<option value="">Erro ao carregar veterinários</option>`;
      });
  }

  function formatarDataParaInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function getHorariosOcupados(data, veterinarioNome) {
    if (!data || !veterinarioNome) {
      return new Set();
    }

    const ocupados = new Set();
    try {
      const agendamentosSnapshot = await get(ref(database, "agendamentos"));
      if (agendamentosSnapshot.exists()) {
        const todosAgendamentos = agendamentosSnapshot.val();
        for (const tutorUid in todosAgendamentos) {
          const agendamentosDoTutor = todosAgendamentos[tutorUid];
          for (const agendamentoId in agendamentosDoTutor) {
            const ag = agendamentosDoTutor[agendamentoId];
            if (ag.data === data && ag.veterinario === veterinarioNome) {
              ocupados.add(ag.hora);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar horários ocupados:", error);
    }
    return ocupados;
  }

  async function popularHorasDisponiveis() {
    const hoje = new Date();
    const dataSelecionadaStr = dataInput.value;
    const veterinarioSelecionadoNome = veterinarioSelect.value;

    horaSelect.innerHTML = `<option value="">Selecione uma hora</option>`;

    if (!dataSelecionadaStr) {
      horaSelect.innerHTML = `<option value="">Selecione uma data primeiro</option>`;
      return;
    }

    if (!veterinarioSelecionadoNome) {
      horaSelect.innerHTML = `<option value="">Selecione um veterinário primeiro</option>`;
      return;
    }

    const [ano, mes, dia] = dataSelecionadaStr.split("-").map(Number);
    const dataSelecionada = new Date(ano, mes - 1, dia);

    if (dataSelecionada.getDay() === 0) {
      // Se for Domingo
      horaSelect.innerHTML = `<option value="">Não é possível agendar aos Domingos</option>`;
      dataInput.value = "";
      return;
    }

    const horariosOcupados = await getHorariosOcupados(
      dataSelecionadaStr,
      veterinarioSelecionadoNome
    );

    const horaInicial = 9;
    const horaFinal = 18;

    let hasValidTime = false;

    for (let h = horaInicial; h <= horaFinal; h++) {
      const agendamentoDateTime = new Date(
        dataSelecionada.getFullYear(),
        dataSelecionada.getMonth(),
        dataSelecionada.getDate(),
        h,
        0,
        0
      );
      const horaFormatada = String(h).padStart(2, "0") + ":00";

      if (horariosOcupados.has(horaFormatada)) {
        continue;
      }

      if (dataSelecionada.toDateString() === hoje.toDateString()) {
        if (agendamentoDateTime.getTime() > hoje.getTime()) {
          const option = document.createElement("option");
          option.value = horaFormatada;
          option.textContent = horaFormatada;
          horaSelect.appendChild(option);
          hasValidTime = true;
        }
      } else {
        const option = document.createElement("option");
        option.value = horaFormatada;
        option.textContent = horaFormatada;
        horaSelect.appendChild(option);
        hasValidTime = true;
      }
    }

    if (!hasValidTime) {
      horaSelect.innerHTML = `<option value="">Nenhum horário disponível para esta data ou veterinário</option>`;
    }
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

  dataInput.addEventListener("change", popularHorasDisponiveis);
  veterinarioSelect.addEventListener("change", popularHorasDisponiveis);

  botaoConfirmar.addEventListener("click", async () => {
    const vacinaSelecionada = vacinaSelect.options[vacinaSelect.selectedIndex];
    const vacinaNome = vacinaSelecionada?.getAttribute("data-nome") || "";

    const animalId = animalSelect.value;
    const selectedAnimalOption =
      animalSelect.options[animalSelect.selectedIndex];
    const animalNome = selectedAnimalOption?.getAttribute("data-nome") || "";

    const data = dataInput.value;
    const hora = horaSelect.value;
    const veterinario = veterinarioSelect.value;

    try {
      if (!vacinaSelecionada || !vacinaNome)
        throw new Error("Selecione uma vacina.");
      if (!animalId || !animalNome) throw new Error("Selecione um animal.");
      if (
        !data ||
        !hora ||
        hora === "Selecione uma hora" ||
        hora === "Nenhum horário disponível para esta data ou veterinário"
      )
        throw new Error("Selecione uma data e hora válidas.");
      if (!veterinario) throw new Error("Selecione um veterinário.");

      const [ano, mes, dia] = data.split("-").map(Number);
      const dataAgendamentoObj = new Date(ano, mes - 1, dia);
      if (dataAgendamentoObj.getDay() === 0) {
        throw new Error("Não é possível agendar aos Domingos.");
      }

      const dataHoraAgendamentoStr = `${data}T${hora}:00`;
      const dataHoraAgendamento = new Date(dataHoraAgendamentoStr);
      const agora = new Date();

      if (dataHoraAgendamento.getTime() <= agora.getTime()) {
        throw new Error(
          "Não é possível agendar para datas ou horários passados. Por favor, selecione uma data e hora futuras."
        );
      }

      const horariosOcupadosNaConfirmacao = await getHorariosOcupados(
        data,
        veterinario
      );
      if (horariosOcupadosNaConfirmacao.has(hora)) {
        throw new Error(
          `O veterinário ${veterinario} já possui um agendamento para ${data} às ${hora}. Por favor, escolha outro horário ou veterinário.`
        );
      }

      const agendamentoRef = push(
        ref(database, `agendamentos/${uidDoTutorLogado}`)
      );

      const novoAgendamento = {
        idAnimal: animalId,
        nomeAnimal: animalNome,
        vacina: vacinaNome,
        data,
        hora,
        veterinario,
        criadoEm: new Date().toISOString(),
        criadoPor: user.uid,
      };

      set(agendamentoRef, novoAgendamento)
        .then(() => {
          resumo.innerText = `✅ Agendamento confirmado:
                            Vacina: ${vacinaNome}
                            Animal: ${animalNome}
                            Veterinário: ${veterinario}
                            Data: ${data}
                            Hora: ${hora}`;

          redirecionamento.innerHTML = `<a href='visualizaragendamentos.html' class='text-blue me-3'>Visualizar Seus Agendamentos</a>`;

          document.getElementById("form-agendamento").reset();
          const hojeMin = formatarDataParaInput(new Date());
          dataInput.min = hojeMin;
          dataInput.value = hojeMin;
          popularHorasDisponiveis();
        })
        .catch((error) => {
          console.error("Erro ao salvar no Firebase:", error);
          resumo.innerText = "Erro ao salvar no Firebase: " + error.message;
        });
    } catch (error) {
      resumo.innerText = "Erro: " + error.message;
    }
  });

  carregarVeterinarios();
  carregarVacinas();
  carregarAnimais();

  const hojeMin = formatarDataParaInput(new Date());
  dataInput.min = hojeMin;
  dataInput.value = hojeMin;

  popularHorasDisponiveis();
});

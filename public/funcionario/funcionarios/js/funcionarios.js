import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  push,
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

const listaFuncionarios = document.getElementById("listaFuncionarios");
const formFuncionario = document.getElementById("formFuncionario");
const btnCancelar = document.getElementById("btnCancelar");

const inputId = document.getElementById("funcionarioId");
const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputTelefone = document.getElementById("telefone");

function getTipoSelecionado() {
  return document.querySelector('input[name="tipo"]:checked').value;
}

function limparFormulario() {
  inputId.value = "";
  inputNome.value = "";
  inputEmail.value = "";
  inputTelefone.value = "";
  document.getElementById("tipoComum").checked = true;
}

async function carregarFuncionarios() {
  const funcionariosRef = ref(database, "usuarios");
  const snapshot = await get(funcionariosRef);
  listaFuncionarios.innerHTML = "";

  if (!snapshot.exists()) {
    listaFuncionarios.innerHTML = `<tr><td colspan="5">Nenhum funcionário encontrado.</td></tr>`;
    return;
  }

  const funcionarios = snapshot.val();

  for (const uid in funcionarios) {
    const f = funcionarios[uid];
    if (f.funcao !== "funcionario") continue;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.nome || ""}</td>
      <td>${f.email || ""}</td>
      <td>${f.telefone || ""}</td>
      <td>${f.tipo || ""}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-editar" data-uid="${uid}">Editar</button>
        <button class="btn btn-sm btn-danger btn-excluir" data-uid="${uid}">Excluir</button>
      </td>
    `;
    listaFuncionarios.appendChild(tr);
  }

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => editarFuncionario(btn.dataset.uid));
  });
  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", () => excluirFuncionario(btn.dataset.uid));
  });
}

async function criarContaAuth(email) {
  const senhaPadrao = "12345678";
  const apiKey = firebaseConfig.apiKey;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: senhaPadrao,
        returnSecureToken: true,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Erro ao criar conta");
  }

  return data.localId;
}

async function editarFuncionario(uid) {
  const funcionarioRef = ref(database, `usuarios/${uid}`);
  const snapshot = await get(funcionarioRef);
  if (!snapshot.exists()) return alert("Funcionário não encontrado.");

  const f = snapshot.val();

  inputId.value = uid;
  inputNome.value = f.nome || "";
  inputEmail.value = f.email || "";
  inputTelefone.value = f.telefone || "";
  if (f.tipo === "veterinario") {
    document.getElementById("tipoVeterinario").checked = true;
  } else {
    document.getElementById("tipoComum").checked = true;
  }
}

async function excluirFuncionario(uid) {
  if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

  try {
    const funcionarioRef = ref(database, `usuarios/${uid}`);
    await remove(funcionarioRef);
    alert("Funcionário excluído com sucesso!");
    carregarFuncionarios();
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    alert("Erro ao excluir funcionário.");
  }
}

formFuncionario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const uid = inputId.value;
  const nome = inputNome.value.trim();
  const email = inputEmail.value.trim();
  const telefone = inputTelefone.value.trim();
  const tipo = getTipoSelecionado();

  if (!nome || !email || !telefone) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    if (uid) {
      const funcionarioRef = ref(database, `usuarios/${uid}`);
      await update(funcionarioRef, {
        nome,
        email,
        telefone,
        tipo,
        funcao: "funcionario",
      });
      alert("Funcionário atualizado com sucesso!");
    } else {
      try {
        const uidCriado = await criarContaAuth(email); // cria no Authentication

        const funcionarioRef = ref(database, `usuarios/${uidCriado}`);
        await set(funcionarioRef, {
          nome,
          email,
          telefone,
          tipo,
          funcao: "funcionario",
        });
        alert("Funcionário adicionado com sucesso!");
      } catch (error) {
        console.error("Erro ao criar funcionário:", error);
        alert("Erro ao criar funcionário: " + error.message);
      }

      alert("Funcionário adicionado com sucesso!");
    }

    limparFormulario();
    carregarFuncionarios();
  } catch (error) {
    console.error("Erro ao salvar funcionário:", error);
    alert("Erro ao salvar funcionário.");
  }
});

btnCancelar.addEventListener("click", () => {
  limparFormulario();
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../../login/logintutor.html";
    return;
  }
  carregarFuncionarios();
});
const logoutBtn = document.getElementById("logoutBtn");

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

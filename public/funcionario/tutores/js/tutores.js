import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
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

const tabelaTutores = document.getElementById("tabela-tutores");
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
    const snapshot = await get(usuarioRef);

    if (!snapshot.exists()) {
      alert("Usuário não encontrado.");
      window.location.href = "../../login/logintutor.html";
      return;
    }

    const dadosUsuario = snapshot.val();
    if (dadosUsuario.funcao !== "funcionario") {
      alert("Acesso restrito a funcionários.");
      window.location.href = "../../login/logintutor.html";
      return;
    }

    const usuariosRef = ref(database, "usuarios");
    const usuariosSnap = await get(usuariosRef);

    if (!usuariosSnap.exists()) {
      tabelaTutores.innerHTML = `<tr><td colspan="4">Nenhum tutor encontrado.</td></tr>`;
      return;
    }

    const usuarios = usuariosSnap.val();
    listaCompleta = Object.entries(usuarios).filter(
      ([_, dados]) => dados.funcao === "tutor"
    );
    renderizarTabela(listaCompleta);

    campoBusca.addEventListener("input", () => {
      const termo = campoBusca.value.toLowerCase().trim();
      const filtrados = listaCompleta.filter(([_, dados]) =>
        dados.nome?.toLowerCase().includes(termo)
      );
      renderizarTabela(filtrados);
    });

    window.salvarEdicao = async function (uid) {
      const nome = document.getElementById(`nome-${uid}`).value.trim();
      const telefone = document.getElementById(`telefone-${uid}`).value.trim();

      if (!nome) {
        alert("Nome não pode estar vazio.");
        return;
      }

      try {
        await update(ref(database, `usuarios/${uid}`), { nome, telefone });
        alert("Dados atualizados com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
        alert("Erro ao salvar dados.");
      }
    };

    window.verAnimais = function (uid) {
      window.location.href = `../animais/animais.html?uid=${uid}`;
    };

    window.novoAgendamento = function (uid) {
      window.location.href = `../agendamentos/novoagendamento.html?uidTutor=${uid}`;
    };
    window.verAgendamentos = function (uid) {
      window.location.href = `../agendamentos/agendamentos.html?uidTutor=${uid}`;
    };
    function renderizarTabela(filtrados) {
      tabelaTutores.innerHTML = "";

      if (filtrados.length === 0) {
        tabelaTutores.innerHTML = `<tr><td colspan="4">Nenhum tutor encontrado.</td></tr>`;
        return;
      }

      filtrados.forEach(([uid, tutor]) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td><input type="text" class="form-control" id="nome-${uid}" value="${
          tutor.nome || ""
        }"></td>
          <td>${tutor.email || "Não informado"}</td>
          <td><input type="text" class="form-control" id="telefone-${uid}" value="${
          tutor.telefone || ""
        }"></td>
          <td>
            <button class="btn btn-success btn-sm mb-1" onclick="salvarEdicao('${uid}')">Salvar</button><br/>
            <button class="btn btn-primary btn-sm mb-1" onclick="verAnimais('${uid}')">Animais</button><br/>
            <button class="btn btn-warning btn-sm mb-1" onclick="novoAgendamento('${uid}')">Novo Agendamento</button><br/>
            <button class="btn btn-warning btn-sm mb-1" onclick="verAgendamentos('${uid}')">Ver Agendamentos</button>
         </td>
        `;

        tabelaTutores.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Erro geral:", error);
    alert("Erro ao carregar dados. Verifique as permissões no Firebase.");
  }
});

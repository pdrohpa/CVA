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

function carregarContatos() {
  get(ref(database, "contatos"))
    .then((snapshot) => {
      const contatos = snapshot.val();
      const tabela = document.getElementById("tabela-contatos");
      if (!contatos) {
        tabela.innerHTML =
          "<tr><td colspan='6'>Nenhum contato encontrado</td></tr>";
        return;
      }

      const lista = Object.entries(contatos).sort((a, b) => {
        return new Date(b[1].dataHora) - new Date(a[1].dataHora);
      });

      tabela.innerHTML = "";

      lista.forEach(([id, contato]) => {
        const linha = document.createElement("tr");

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.style.cursor = "pointer";
        botaoExcluir.addEventListener("click", () => {
          if (confirm(`Excluir contato de ${contato.nome}?`)) {
            excluirContato(id);
          }
        });

        const botaoWhats = document.createElement("button");
        botaoWhats.textContent = "WhatsApp";
        botaoWhats.style.cursor = "pointer";

        if (contato.telefone) {
          const telefoneLimpo = contato.telefone.replace(/[\s()-]/g, "");
          botaoWhats.addEventListener("click", () => {
            window.open(`https://wa.me/55${telefoneLimpo}`, "_blank");
          });
        } else {
          botaoWhats.disabled = true;
          botaoWhats.title = "Telefone não informado";
        }

        linha.innerHTML = `
                    <td>${contato.nome}</td>
                    <td>${contato.email}</td>
                    <td>${contato.mensagem}</td>
                    <td>${new Date(contato.dataHora).toLocaleString(
                      "pt-BR"
                    )}</td>
                    <td>${contato.telefone || "-"}</td>
                    <td></td>
                `;

        linha.children[5].appendChild(botaoExcluir);
        linha.children[5].appendChild(document.createTextNode(" "));
        linha.children[5].appendChild(botaoWhats);

        tabela.appendChild(linha);
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar contatos:", error);
      const tabela = document.getElementById("tabela-contatos");
      tabela.innerHTML =
        "<tr><td colspan='6'>Erro ao carregar contatos</td></tr>";
    });
}

function excluirContato(contatoId) {
  remove(ref(database, `contatos/${contatoId}`))
    .then(() => {
      alert("Contato excluído com sucesso!");
      carregarContatos();
    })
    .catch((error) => {
      alert("Erro ao excluir contato: " + error.message);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const tabela = document.getElementById("tabela-contatos");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");
  const logoutBtn = document.getElementById("logoutBtn");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("show");
    });
  }

  if (logoutBtn) {
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
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Você precisa estar logado.");
      window.location.href = "../../login/loginfuncionario.html";
      return;
    }

    get(ref(database, "usuarios/" + user.uid)).then((snapshot) => {
      const dados = snapshot.val();
      if (dados?.funcao === "funcionario") {
        carregarContatos();
      } else {
        alert("Apenas funcionários podem acessar esta página.");
        window.location.href = "../../login/loginfuncionario.html";
      }
    });
  });
});

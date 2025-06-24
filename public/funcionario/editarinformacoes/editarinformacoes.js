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
  signOut,
  updatePassword,
  EmailAuthProvider, 
  reauthenticateWithCredential, 
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
const auth = getAuth(app);
const db = getDatabase(app);

const form = document.getElementById("form-editar-funcionario");
const mensagem = document.getElementById("mensagem");
const logoutBtn = document.getElementById("logoutBtn");
 document.addEventListener('DOMContentLoaded', function() {
      const menuToggle = document.getElementById('menuToggle');
      const navLinks = document.querySelector('.nav-links');

      menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('show');
      });
    });

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../login/loginfuncionario.html";
    return;
  }

  const uid = user.uid;
  const userRef = ref(db, `usuarios/${uid}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const dados = snapshot.val();

      if (dados.funcao !== "funcionario") {
        alert("Apenas funcionários ou veterinários podem acessar essa página.");
        window.location.href = "../../login/loginfunc.html";
        return;
      }

      document.getElementById("nome").value = dados.nome || "";
      document.getElementById("telefone").value = dados.telefone || "";
    } else {
      mensagem.innerHTML = `<div class="text-danger">Dados do usuário não encontrados.</div>`;
    }
  } catch (error) {
    mensagem.innerHTML = `<div class="text-danger">Erro ao carregar dados: ${error.message}</div>`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senhaAtual = document.getElementById("senhaAtual").value.trim();
    const novaSenha = document.getElementById("novaSenha").value.trim();
    if (!nome || !telefone || !senhaAtual) {
      mensagem.innerHTML = `<div class="text-danger">Preencha todos os campos obrigatórios (Nome, Telefone e Senha Atual).</div>`;
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credential);

      await update(userRef, { nome, telefone });

      if (novaSenha.length >= 6) {
        await updatePassword(user, novaSenha);
      } else if (novaSenha.length > 0 && novaSenha.length < 6) {
        mensagem.innerHTML = `<div class="text-danger">A nova senha deve ter no mínimo 6 caracteres.</div>`;
        return;
      }

      mensagem.innerHTML = `<div class="text-success">Dados e/ou senha atualizados com sucesso!</div>`;
      document.getElementById("senhaAtual").value = "";
      document.getElementById("novaSenha").value = "";
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      let errorMessage =
        "Erro ao atualizar dados. Verifique a senha atual e tente novamente.";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Senha atual incorreta. Por favor, tente novamente.";
      } else if (error.code === "auth/user-mismatch") {
        errorMessage = "Erro de autenticação de usuário.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido. Entre em contato com o suporte.";
      }

      mensagem.innerHTML = `<div class="text-danger">${errorMessage}</div>`;
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        window.location.href = "../../login/loginfuncionario.html";
      })
      .catch((error) => {
        alert("Erro ao sair: " + error.message);
      });
  });
});

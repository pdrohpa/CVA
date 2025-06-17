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
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// Configuração Firebase
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

const form = document.getElementById("form-editar-tutor");
const mensagem = document.getElementById("mensagem");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../login/logintutor.html";
    return;
  }

  const uid = user.uid;
  const userRef = ref(db, `usuarios/${uid}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const dados = snapshot.val();
      document.getElementById("nome").value = dados.nome || "";
      document.getElementById("telefone").value = dados.telefone || "";
    }
  } catch (error) {
    mensagem.innerHTML = `<div class="text-danger">Erro ao carregar dados: ${error.message}</div>`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const novaSenha = document.getElementById("senha").value.trim();

    if (!nome || !telefone) {
      mensagem.innerHTML = `<div class="text-danger">Preencha todos os campos obrigatórios.</div>`;
      return;
    }

    try {
      await update(userRef, { nome, telefone });

      if (novaSenha.length >= 6) {
        await updatePassword(user, novaSenha);
      }

      mensagem.innerHTML = `<div class="text-success">Dados atualizados com sucesso!</div>`;
      alert("Dados atualizados!");
      window.location.href = "../telainicial.html";
      document.getElementById("senha").value = "";
    } catch (error) {
      mensagem.innerHTML = `<div class="text-danger">Erro: ${error.message}</div>`;
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        window.location.href = "../../login/logintutor.html";
      })
      .catch((error) => {
        alert("Erro ao sair: " + error.message);
      });
  });
});

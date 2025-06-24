import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
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
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

const mensagem = document.getElementById("mensagem");

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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esse local.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  const uid = user.uid;

  try {
    const usuarioRef = ref(database, `usuarios/${uid}`);
    const snapshot = await get(usuarioRef);

    if (!snapshot.exists()) {
      alert("Usuário não encontrado.");
      window.location.href = "../../login/logintutor.html";
      return;
    }

    const dadosUsuario = snapshot.val();

    if (dadosUsuario.funcao !== "funcionario") {
      alert("Acesso restrito a tutores.");
      window.location.href = "../../login/logintutor.html";
      return;
    }

    mensagem.innerText = "Bem-vindo " + (dadosUsuario.nome || "Funcionário");
  } catch (error) {
    console.error("Erro ao verificar função do usuário:", error);
    alert("Erro ao verificar permissão. Faça login novamente.");
    window.location.href = "../../login/logintutor.html";
  }
});

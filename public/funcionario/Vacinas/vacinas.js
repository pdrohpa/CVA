import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBTghhMKFHgiWtumkLdjlyuohlR__yzEag",
  authDomain: "cva-controle-de-vac-de-animais.firebaseapp.com",
  databaseURL: "https://cva-controle-de-vac-de-animais-default-rtdb.firebaseio.com",
  projectId: "cva-controle-de-vac-de-animais",
  storageBucket: "cva-controle-de-vac-de-animais.appspot.com",
  messagingSenderId: "674772281471",
  appId: "1:674772281471:web:7c9dedf81224a4459fb74a",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// ✅ MENU TOGGLE (fora do onAuthStateChanged)
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// ✅ LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
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


// ✅ AUTENTICAÇÃO E CADASTRO DE VACINA
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esse local.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  try {
    // Buscar os dados do usuário no banco
    const usuarioRef = ref(database, "usuarios/" + user.uid);
    const usuarioSnap = await get(usuarioRef);

    if (usuarioSnap.exists()) {
      const dadosUsuario = usuarioSnap.val();

      if (dadosUsuario.funcao !== "funcionario") {
        alert("Acesso restrito a funcionários.");
        window.location.href = "../../login/logintutor.html";
        return;
      }

      // Aqui o usuário está autenticado e é funcionário
      console.log("Usuário autenticado:", dadosUsuario.nome);
      // Pode carregar os dados da página normalmente aqui

    } else {
      alert("Dados do usuário não encontrados.");
      window.location.href = "../../login/logintutor.html";
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    alert("Erro ao carregar dados.");
  }
});

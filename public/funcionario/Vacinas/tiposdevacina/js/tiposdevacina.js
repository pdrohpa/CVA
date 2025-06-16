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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esse local.");
    window.location.href = "../../login/logintutor.html";
    return;
  }

  try {
    const uid = user.uid;
    const usuarioRef = ref(database, `usuarios/${uid}`);
    const usuarioSnap = await get(usuarioRef);

    if (!usuarioSnap.exists()) {
      alert("Usuário não encontrado.");
      window.location.href = "../../login/logintutor.html";
      return;
    }

    const dadosUsuario = usuarioSnap.val();
    if (dadosUsuario.funcao !== "funcionario") {
      alert("Acesso restrito a funcionários.");
      window.location.href = "../../login/logintutor.html";
      return;
    }
    const form = document.getElementById("formTipoVacina");
    const resposta = document.getElementById("resposta");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("nomeTipo").value.trim();
      const aplicacao = document.getElementById("aplicacao").value;

      try {
        const tipoRef = push(ref(database, "tiposVacinas"));
        await set(tipoRef, { nome, aplicacao });
        resposta.innerText = "✅ Tipo de vacina cadastrado com sucesso.";
        form.reset();
      } catch (error) {
        resposta.innerText = "Erro ao salvar: " + error.message;
      }
    });
  } catch (error) {
    console.error("Erro geral:", error);
    alert("Erro ao carregar dados.");
  }
});

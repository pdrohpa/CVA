import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Sua configuração Firebase
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

// Inicializa o app e o banco de dados
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Formulário
const form = document.getElementById("formContato");
const resposta = document.getElementById("resposta");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensagem = document.getElementById("mensagem").value.trim();

  if (!nome || !email || !mensagem) {
    resposta.textContent = "Preencha todos os campos.";
    resposta.classList.remove("text-success");
    resposta.classList.add("text-danger");
    return;
  }

  try {
    await push(ref(database, "contatos"), {
      nome,
      email,
      mensagem,
      dataHora: new Date().toISOString(),
    });

    resposta.textContent = "Mensagem enviada com sucesso!";
    resposta.classList.remove("text-danger");
    resposta.classList.add("text-success");

    form.reset();
  } catch (error) {
    console.error("Erro ao enviar:", error);
    resposta.textContent = "Erro ao enviar mensagem.";
    resposta.classList.remove("text-success");
    resposta.classList.add("text-danger");
  }
});

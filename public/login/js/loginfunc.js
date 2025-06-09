import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTghhMKFHgiWtumkLdjlyuohlR__yzEag",
  authDomain: "cva-controle-de-vac-de-animais.firebaseapp.com",
  databaseURL:
    "https://cva-controle-de-vac-de-animais-default-rtdb.firebaseio.com",
  projectId: "cva-controle-de-vac-de-animais",
  storageBucket: "cva-controle-de-vac-de-animais.appspot.com",
  messagingSenderId: "674772281471",
  appId: "1:674772281471:web:7c9dedf81224a4459fb74a",
  measurementId: "G-KFDRW0XV4X",
};

const app = initializeApp(firebaseConfig);

import "https://www.gstatic.com/firebasejs/9.8.1/firebase-database-compat.js";
import "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth-compat.js";

const botaoEmailSenha = document.getElementById("authEmailSenha");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const mensagem = document.getElementById("mensagem");

// Login com Email e Senha
botaoEmailSenha.addEventListener("click", function () {
  firebase
    .auth()
    .signInWithEmailAndPassword(email.value, senha.value)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      return firebase
        .database()
        .ref("usuarios/" + uid)
        .once("value");
    })
    .then((snapshot) => {
      const usuario = snapshot.val();

      if (!usuario) {
        throw new Error("Usuário não encontrado no banco de dados.");
      }

      if (usuario.funcao !== "funcionario") {
        throw new Error("Esse usuário não é um funcionário.");
      }

      // Apenas até a tela de funcionario ser desenvolvida
      mensagem.innerText = "Bem-vindo, " + usuario.nome;
      console.log("Login como funcionário OK");
    })
    .catch((error) => {
      console.error(error.code, error.message);
      if (error.code === "permission-denied") {
        mensagem.innerText = "Você não tem permissão para acessar esses dados.";
      } else {
        mensagem.innerText = "Erro: " + error.message;
      }
    });
});

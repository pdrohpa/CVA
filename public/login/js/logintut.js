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
const botaoGoogle = document.getElementById("authGoogle");
const cadastrar = document.getElementById("cadastrar");
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
        throw new Error("Usuário não encontrado na base de dados.");
      }

      if (usuario.funcao !== "tutor") {
        throw new Error("Esse usuário não é um tutor.");
      }

      window.location.href = "../../tutor/telainicial.html";
    })
    .catch((error) => {
      console.error(error.code, error.message);
      mensagem.innerText = "Erro: " + error.message;
    });
});

// Login com Google
botaoGoogle.addEventListener("click", function () {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      const uid = user.uid;

      return firebase
        .database()
        .ref("usuarios/" + uid) // cadastra no realtime database com o mesmo id do authenticator
        .once("value")
        .then((snapshot) => {
          if (!snapshot.exists()) {
            return firebase
              .database()
              .ref("usuarios/" + uid)
              .set({
                nome: user.displayName, //Utiliza o nome da conta do Google
                telefone: "",
                email: user.email,
                funcao: "tutor",
              })
              .then(() => {
                return {
                  nome: user.displayName,
                  funcao: "tutor",
                };
              });
          } else {
            return snapshot.val();
          }
        });
    })
    .then((usuario) => {
      if (usuario.funcao !== "tutor") {
        throw new Error("Esse usuário não é um tutor.");
      }

      window.location.href = "../../tutor/telainicial.html";
    })
    .catch((error) => {
      console.error(error.code, error.message);
      mensagem.innerText = "Erro: " + error.message;
    });
});

// Botão de cadastro
cadastrar.addEventListener("click", function () {
  window.location.href = "../login/cadastrartutor.html";
});

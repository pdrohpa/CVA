import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTghhMKFHgiWtumkLdjlyuohlR__yzEag",
  authDomain: "cva-controle-de-vac-de-animais.firebaseapp.com",
  databaseURL: "https://cva-controle-de-vac-de-animais.firebaseio.com",
  projectId: "cva-controle-de-vac-de-animais",
  storageBucket: "cva-controle-de-vac-de-animais.appspot.com",
  messagingSenderId: "674772281471",
  appId: "1:674772281471:web:7c9dedf81224a4459fb74a",
  measurementId: "G-KFDRW0XV4X",
};

const app = initializeApp(firebaseConfig);

window.addEventListener("load", function () {
  const nome = document.getElementById("nome");
  const telefone = document.getElementById("telefone");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const botaoCadastro = document.getElementById("botaoCadastro");
  const mensagem = document.getElementById("mensagem");

  botaoCadastro.addEventListener("click", function () {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email.value, senha.value)
      .then((userCredential) => {
        const userId = userCredential.user.uid;

        firebase
          .database()
          .ref("usuarios/" + userId)
          .set({
            nome: nome.value,
            telefone: telefone.value,
            email: email.value,
            funcao: "tutor",
          });

        mensagem.innerText = "Cadastro realizado com sucesso!";
        setTimeout(() => {
          window.location.href = "logintutor.html";
        }, 1000);
      })
      .catch((error) => {
        console.error(error.code, error.message);
        mensagem.innerText = "Erro: " + error.message;
      });
  });
});

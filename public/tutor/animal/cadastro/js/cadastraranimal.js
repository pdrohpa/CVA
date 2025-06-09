// Inicialização Firebase compat
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
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

const form = document.getElementById("form-cadastrar-animal");
const mensagem = document.getElementById("mensagem");
const inputRacaOutros = document.getElementById("racaOutros");

const especieSelect = document.getElementById("especie");
const racaSelect = document.getElementById("raca");

// Raças
const racasCachorro = [
  "Shih Tzu",
  "Poodle",
  "Yorkshire Terrier",
  "Labrador Retriever",
  "Golden Retriever",
  "Bulldog Francês",
  "Pinscher",
  "Dachshund (Salsicha)",
  "Lhasa Apso",
  "Outro",
];

const racasGato = [
  "Siamês",
  "Persa",
  "Maine Coon",
  "Sphynx",
  "Ragdoll",
  "Bengal",
  "Abissínio",
  "Outro",
];

const racasPassaro = [
  "Calopsita",
  "Canário",
  "Periquito",
  "Papagaio",
  "Agapornis",
  "Outro",
];

especieSelect.addEventListener("change", () => {
  const especie = especieSelect.value;
  racaSelect.innerHTML = '<option value="">Selecione uma raça</option>';
  inputRacaOutros.style.display = "none";
  inputRacaOutros.required = false;
  inputRacaOutros.value = "";

  if (!especie) return;

  let racas = [];
  if (especie === "cachorro") racas = racasCachorro;
  else if (especie === "gato") racas = racasGato;
  else if (especie === "passaro") racas = racasPassaro;

  racas.forEach((raca) => {
    const option = document.createElement("option");
    option.value = raca.toLowerCase();
    option.textContent = raca;
    racaSelect.appendChild(option);
  });
});

racaSelect.addEventListener("change", () => {
  if (racaSelect.value === "outro") {
    inputRacaOutros.style.display = "block";
    inputRacaOutros.required = true;
  } else {
    inputRacaOutros.style.display = "none";
    inputRacaOutros.required = false;
    inputRacaOutros.value = "";
  }
});

// Envio do formulário
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const especie = especieSelect.value;
  let raca = racaSelect.value;
  if (raca === "outro") {
    raca = inputRacaOutros.value.trim();
  }
  const nascimento = document.getElementById("nascimento").value;

  if (!nome || !especie || !raca) {
    mensagem.textContent = "Por favor, preencha os campos obrigatórios.";
    mensagem.className = "text-danger";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    mensagem.textContent =
      "Você precisa estar logado para cadastrar um animal.";
    mensagem.className = "text-danger";
    return;
  }

  const novoAnimal = {
    nome,
    especie,
    raca,
    nascimento: nascimento || null,
    criadoEm: new Date().toISOString(),
  };

  const animaisRef = database.ref("animais/" + user.uid);
  const novoAnimalRef = animaisRef.push();
  novoAnimalRef
    .set(novoAnimal)
    .then(() => {
      mensagem.textContent = "Animal cadastrado com sucesso!";
      mensagem.className = "text-success";
      form.reset();
      inputRacaOutros.style.display = "none";
      inputRacaOutros.required = false;
    })
    .catch((error) => {
      mensagem.textContent = "Erro ao cadastrar animal: " + error.message;
      mensagem.className = "text-danger";
    });
});
